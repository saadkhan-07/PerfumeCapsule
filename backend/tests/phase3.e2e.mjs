// ===========================================================================
// Phase 3 — complete end-to-end suite
// Covers: Auth, Brands, Categories, Products, Variants, Product Images,
//         Orders, Site Settings — incl. real Cloudinary uploads, authz,
//         validation, error envelope, concurrency oversell, rate limiting.
//
// Prerequisites (see tests/README.md):
//   1. The API server is running and reachable at E2E_BASE_URL.
//   2. An admin account exists with E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD.
//   3. Cloudinary credentials are configured (real uploads are exercised).
//
// Config is env-driven so no secrets are committed. Defaults match the local
// dev setup. Run against a freshly-booted server (the in-memory rate-limit
// counter resets on restart, so the rate-limit test stays repeatable).
//
//   npm run test:e2e
// ===========================================================================

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@perfume.test';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin12345';
const API = BASE + '/api';
let pass = 0, fail = 0;
const failures = [];

// 1x1 transparent PNG — used for all real image uploads.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const readJson = async (res) => {
  try { return await res.json(); } catch { return null; }
};
const req = async (method, path, { token, body } = {}) => {
  const res = await fetch(API + path, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  return { status: res.status, body: await readJson(res) };
};
const get = (p, token) => req('GET', p, { token });
const post = (p, body, token) => req('POST', p, { body, token });
const put = (p, body, token) => req('PUT', p, { body, token });
const del = (p, token) => req('DELETE', p, { token });

// multipart form (text fields + image file parts)
const form = async (method, path, { token, fields = {}, files = [] } = {}) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, String(v));
  for (const f of files) fd.append(f.field, new Blob([PNG], { type: 'image/png' }), f.filename);
  const res = await fetch(API + path, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: fd,
  });
  return { status: res.status, body: await readJson(res) };
};

function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ❌ ${name} — ${detail}`); }
}
const section = (t) => console.log(`\n=== ${t} ===`);
// Standard envelope: { success, message, data, errors }
const isEnvelope = (b) =>
  b && typeof b.success === 'boolean' && 'message' in b && 'data' in b && 'errors' in b;
const noPassword = (b) => !JSON.stringify(b ?? {}).toLowerCase().includes('"password"');

const uniq = Date.now();
const created = { brands: [], products: [], categories: [], imagePublicIds: [] };

// ───────────────────────────────────────────────────────────────────────────
async function run() {
  // ===================== 1. AUTH =====================
  section('1. Auth');
  const admin = await post('/auth/admin/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const adminToken = admin.body?.data?.token;
  check('admin login → 200 + token', admin.status === 200 && !!adminToken, JSON.stringify(admin.body));

  // Reset the settings singleton to documented shipping defaults up-front so order
  // math is deterministic regardless of prior runs (the row persists in the DB).
  await put('/settings', { localCity: 'Lahore', localShippingFee: 200, outstationShippingFee: 400, freeShippingThreshold: 5000 }, adminToken);

  const userEmail = `cust${uniq}@test.com`;
  const reg = await post('/auth/register', { name: 'Customer A', email: userEmail, password: 'custpass123' });
  const userToken = reg.body?.data?.token;
  check('register → 201 + token', reg.status === 201 && !!userToken, JSON.stringify(reg.body));
  check('register response hides password', noPassword(reg.body), 'password leaked');

  const reg2 = await post('/auth/register', { name: 'Customer B', email: `other${uniq}@test.com`, password: 'custpass123' });
  const user2Token = reg2.body?.data?.token;
  check('register 2nd user → 201', reg2.status === 201 && !!user2Token, JSON.stringify(reg2.body));

  const loginOk = await post('/auth/login', { email: userEmail, password: 'custpass123' });
  check('login correct → 200', loginOk.status === 200 && !!loginOk.body?.data?.token, loginOk.status);

  const loginBad = await post('/auth/login', { email: userEmail, password: 'wrongpass' });
  check('login wrong password → 401', loginBad.status === 401, loginBad.status);

  const dup = await post('/auth/register', { name: 'Dup', email: userEmail, password: 'custpass123' });
  check('duplicate email register → 409', dup.status === 409, dup.status);

  const badReg = await post('/auth/register', { name: 'x', email: 'not-an-email', password: 'short' });
  check('invalid register → 422 + errors[]', badReg.status === 422 && Array.isArray(badReg.body?.errors), JSON.stringify(badReg.body));

  const me = await get('/auth/me', userToken);
  check('GET /me with token → 200', me.status === 200, me.status);
  check('GET /me hides password', noPassword(me.body), 'password leaked');
  const meNoToken = await get('/auth/me');
  check('GET /me without token → 401', meNoToken.status === 401, meNoToken.status);

  // ===================== 2. BRANDS =====================
  section('2. Brands');
  const bNoAuth = await post('/brands', { name: 'NoAuth Brand' });
  check('create brand no token → 401', bNoAuth.status === 401, bNoAuth.status);
  const bAsUser = await post('/brands', { name: 'User Brand' }, userToken);
  check('create brand as user → 403', bAsUser.status === 403, bAsUser.status);
  const bInvalid = await post('/brands', { name: 'x' }, adminToken);
  check('create brand short name → 422', bInvalid.status === 422, bInvalid.status);

  const brand = await post('/brands', { name: `Dior ${uniq}`, description: 'House of Dior' }, adminToken);
  const brandId = brand.body?.data?.id;
  created.brands.push(brandId);
  check('create brand (admin) → 201', brand.status === 201 && !!brandId, JSON.stringify(brand.body));

  const brandList = await get('/brands');
  check('list brands (public) → 200 + contains new', brandList.status === 200 && brandList.body?.data?.some((b) => b.id === brandId), brandList.status);
  const brandGet = await get(`/brands/${brandId}`);
  check('get brand by id (public) → 200', brandGet.status === 200, brandGet.status);
  const brandMiss = await get('/brands/nonexistent-id');
  check('get missing brand → 404', brandMiss.status === 404, brandMiss.status);

  const brandUpd = await form('PUT', `/brands/${brandId}`, { token: adminToken, fields: { name: `Dior Updated ${uniq}` } });
  check('update brand → 200', brandUpd.status === 200 && brandUpd.body?.data?.name === `Dior Updated ${uniq}`, JSON.stringify(brandUpd.body));

  // Brand logo upload — REAL Cloudinary
  const brandLogo = await post('/brands', { name: `Logo Brand ${uniq}` }, adminToken); // create w/o logo
  // then replace with a logo via PUT (covers upload + old-asset cleanup path)
  const logoBrandId = brandLogo.body?.data?.id;
  created.brands.push(logoBrandId);
  const logoUp = await form('PUT', `/brands/${logoBrandId}`, { token: adminToken, fields: { description: 'with logo' }, files: [{ field: 'logo', filename: 'logo.png' }] });
  const lb = logoUp.body?.data;
  check('brand logo upload → 200 + https secure_url', logoUp.status === 200 && /^https:\/\//.test(lb?.logoUrl || ''), JSON.stringify(logoUp.body));
  check('brand logo stores publicId', !!lb?.logoPublicId, lb?.logoPublicId);

  // ===================== 3. CATEGORIES =====================
  section('3. Categories');
  const catAsUser = await post('/categories', { name: 'User Cat' }, userToken);
  check('create category as user → 403', catAsUser.status === 403, catAsUser.status);
  const cat = await post('/categories', { name: `Floral ${uniq}` }, adminToken);
  const catId = cat.body?.data?.id;
  created.categories.push(catId);
  check('create category (admin) → 201', cat.status === 201 && !!catId, JSON.stringify(cat.body));
  const catDup = await post('/categories', { name: `Floral ${uniq}` }, adminToken);
  check('duplicate category name → 409', catDup.status === 409, catDup.status);
  const cat2 = await post('/categories', { name: `Woody ${uniq}` }, adminToken);
  created.categories.push(cat2.body?.data?.id);
  const catList = await get('/categories');
  check('list categories (public) → 200', catList.status === 200, catList.status);
  const catUpd = await put(`/categories/${catId}`, { name: `Floral Edited ${uniq}` }, adminToken);
  check('update category → 200', catUpd.status === 200, JSON.stringify(catUpd.body));

  // ===================== 4. PRODUCTS =====================
  section('4. Products');
  const pBadBrand = await post('/products', { name: 'Orphan', brandId: 'nope' }, adminToken);
  check('create product invalid brand → 422', pBadBrand.status === 422, pBadBrand.status);
  const pAsUser = await post('/products', { name: 'User Product', brandId }, userToken);
  check('create product as user → 403', pAsUser.status === 403, pAsUser.status);

  const product = await post('/products', { name: `Sauvage ${uniq}`, brandId, description: 'Fresh', categoryIds: [catId] }, adminToken);
  const productId = product.body?.data?.id;
  created.products.push(productId);
  check('create product (+brand +category) → 201', product.status === 201 && !!productId, JSON.stringify(product.body));

  // a couple more for pagination/filter/search
  const p2 = await post('/products', { name: `Aventus ${uniq}`, brandId }, adminToken);
  created.products.push(p2.body?.data?.id);
  const otherBrand = await post('/brands', { name: `Chanel ${uniq}` }, adminToken);
  created.brands.push(otherBrand.body?.data?.id);
  const p3 = await post('/products', { name: `Bleu ${uniq}`, brandId: otherBrand.body?.data?.id }, adminToken);
  created.products.push(p3.body?.data?.id);

  const list = await get('/products');
  check('list products → 200 + pagination shape', list.status === 200 && typeof list.body?.data?.pagination?.total === 'number', JSON.stringify(list.body?.data?.pagination));
  const paged = await get('/products?limit=1&page=1');
  check('pagination limit=1 → 1 item', paged.body?.data?.items?.length === 1 && paged.body?.data?.pagination?.limit === 1, JSON.stringify(paged.body?.data?.pagination));
  const filtered = await get(`/products?brandId=${brandId}`);
  check('filter by brandId → only that brand', filtered.body?.data?.items?.every((p) => p.brandId === brandId), 'foreign brand leaked');
  const searched = await get(`/products?search=Aventus%20${uniq}`);
  check('search by name → matches', searched.body?.data?.items?.some((p) => p.name.includes('Aventus')), JSON.stringify(searched.body?.data?.items?.map((p) => p.name)));

  const pGet = await get(`/products/${productId}`);
  check('get product by id → 200 + relations', pGet.status === 200 && Array.isArray(pGet.body?.data?.variants), pGet.status);
  const pUpd = await put(`/products/${productId}`, { name: `Sauvage Elixir ${uniq}`, categoryIds: [cat2.body?.data?.id] }, adminToken);
  check('update product (name→slug, categories replace) → 200', pUpd.status === 200 && pUpd.body?.data?.slug?.includes('elixir'), JSON.stringify(pUpd.body?.data?.slug));

  // ===================== 5. VARIANTS =====================
  section('5. Variants');
  const vAsUser = await post(`/products/${productId}/variants`, { size: '5ml', price: 1500, stock: 10 }, userToken);
  check('create variant as user → 403', vAsUser.status === 403, vAsUser.status);
  const variant = await post(`/products/${productId}/variants`, { size: '5ml', price: 1500, stock: 10 }, adminToken);
  const variantId = variant.body?.data?.id;
  check('create variant → 201', variant.status === 201 && !!variantId, JSON.stringify(variant.body));
  const vDup = await post(`/products/${productId}/variants`, { size: '5ml', price: 2000, stock: 5 }, adminToken);
  check('duplicate size (same product) → 409', vDup.status === 409, vDup.status);
  const vList = await get(`/products/${productId}/variants`);
  check('list variants (public) → 200', vList.status === 200 && vList.body?.data?.length >= 1, vList.status);
  const vUpd = await put(`/products/${productId}/variants/${variantId}`, { price: 1700, stock: 20 }, adminToken);
  check('update variant (price/stock) → 200', vUpd.status === 200 && Number(vUpd.body?.data?.price) === 1700 && vUpd.body?.data?.stock === 20, JSON.stringify(vUpd.body));
  // disposable variant to test delete
  const vDel = await post(`/products/${productId}/variants`, { size: '100ml', price: 9000, stock: 3 }, adminToken);
  const delRes = await del(`/products/${productId}/variants/${vDel.body?.data?.id}`, adminToken);
  check('delete variant → 200', delRes.status === 200, delRes.status);

  // ===================== 6. PRODUCT IMAGES (real Cloudinary) =====================
  section('6. Product Images');
  const imgAsUser = await form('POST', `/products/${productId}/images`, { token: userToken, files: [{ field: 'images', filename: 'a.png' }] });
  check('upload image as user → 403', imgAsUser.status === 403, imgAsUser.status);
  const imgMiss = await form('POST', `/products/nope/images`, { token: adminToken, files: [{ field: 'images', filename: 'a.png' }] });
  check('upload to missing product → 404', imgMiss.status === 404, imgMiss.status);

  const imgUp = await form('POST', `/products/${productId}/images`, { token: adminToken, files: [{ field: 'images', filename: 'a.png' }, { field: 'images', filename: 'b.png' }] });
  const imgs = imgUp.body?.data || [];
  imgs.forEach((i) => created.imagePublicIds.push(i.publicId));
  check('upload 2 images → 201 + https urls', imgUp.status === 201 && imgs.length === 2 && imgs.every((i) => /^https:\/\//.test(i.url)), JSON.stringify(imgUp.body));
  check('images store publicId + incrementing position', imgs.every((i) => !!i.publicId) && imgs[1].position > imgs[0].position, JSON.stringify(imgs.map((i) => i.position)));

  const imgDel = await del(`/products/${productId}/images/${imgs[0]?.id}`, adminToken);
  check('delete image → 200', imgDel.status === 200, imgDel.status);
  const imgDelWrong = await del(`/products/${created.products[1]}/images/${imgs[1]?.id}`, adminToken);
  check('delete image wrong product → 404', imgDelWrong.status === 404, imgDelWrong.status);

  // ===================== 7. ORDERS =====================
  section('7. Orders');
  // ensure known stock for order math: set variant stock to 20 already (vUpd). price 1700.
  const placeOrder = (qty, city, token = userToken, vId = variantId) =>
    post('/orders', { items: [{ variantId: vId, quantity: qty }], shippingInfo: { name: 'Customer A', phone: '03001234567', address: '12 Mall Road', city }, paymentMethod: 'JAZZCASH' }, token);

  const ordUnknown = await post('/orders', { items: [{ variantId: 'ghost', quantity: 1 }], shippingInfo: { name: 'A', phone: '03001234567', address: '12 Mall Road', city: 'Lahore' }, paymentMethod: 'JAZZCASH' }, userToken);
  check('order unknown variant → 422', ordUnknown.status === 422, ordUnknown.status);
  const ordOversell = await placeOrder(999, 'Lahore');
  check('order qty > stock → 409', ordOversell.status === 409, ordOversell.status);

  const order = await placeOrder(2, 'Lahore'); // subtotal 3400, +200 = 3600
  const orderId = order.body?.data?.id;
  const od = order.body?.data;
  check('place order → 201', order.status === 201 && !!orderId, JSON.stringify(order.body));
  check('order math: subtotal 3400 + ship 200 = total 3600', Number(od?.subtotal) === 3400 && Number(od?.shippingFee) === 200 && Number(od?.total) === 3600, JSON.stringify({ s: od?.subtotal, sh: od?.shippingFee, t: od?.total }));
  check('order item snapshots present', od?.items?.[0]?.productName && od?.items?.[0]?.unitPrice && od?.items?.[0]?.size, JSON.stringify(od?.items?.[0]));

  const listAsUser = await get('/orders', userToken);
  check('list orders as user → 403', listAsUser.status === 403, listAsUser.status);
  const listAsAdmin = await get('/orders', adminToken);
  check('list orders as admin → 200', listAsAdmin.status === 200 && Array.isArray(listAsAdmin.body?.data), listAsAdmin.status);

  const getOwner = await get(`/orders/${orderId}`, userToken);
  check('get order as owner → 200', getOwner.status === 200, getOwner.status);
  const getOther = await get(`/orders/${orderId}`, user2Token);
  check('get order as other user → 403', getOther.status === 403, getOther.status);
  const getAdmin = await get(`/orders/${orderId}`, adminToken);
  check('get order as admin → 200', getAdmin.status === 200, getAdmin.status);
  const getMiss = await get('/orders/ghost-id', adminToken);
  check('get missing order → 404', getMiss.status === 404, getMiss.status);

  const statUser = await put(`/orders/${orderId}/status`, { status: 'CONFIRMED' }, userToken);
  check('update status as user → 403', statUser.status === 403, statUser.status);
  const statBad = await put(`/orders/${orderId}/status`, { status: 'BOGUS' }, adminToken);
  check('update status invalid → 422', statBad.status === 422, statBad.status);
  const statOk = await put(`/orders/${orderId}/status`, { status: 'CONFIRMED' }, adminToken);
  check('update status (admin) → 200 + CONFIRMED', statOk.status === 200 && statOk.body?.data?.status === 'CONFIRMED', JSON.stringify(statOk.body?.data?.status));

  // Concurrency: stock=1, fire 2 simultaneous orders → exactly one 201, one 409
  const cv = await post(`/products/${productId}/variants`, { size: '1ml', price: 100, stock: 1 }, adminToken);
  const cvId = cv.body?.data?.id;
  const [r1, r2] = await Promise.all([placeOrder(1, 'Lahore', userToken, cvId), placeOrder(1, 'Lahore', user2Token, cvId)]);
  const codes = [r1.status, r2.status].sort();
  check('concurrent oversell → exactly one 201 + one 409', codes[0] === 201 && codes[1] === 409, JSON.stringify(codes));

  // ===================== 8. SITE SETTINGS =====================
  section('8. Site Settings');
  const setPub = await get('/settings');
  check('GET /settings (public) → 200 + shipping fields', setPub.status === 200 && 'localShippingFee' in (setPub.body?.data || {}), setPub.status);
  const setUser = await put('/settings', { siteName: 'Hacker' }, userToken);
  check('PUT /settings as user → 403', setUser.status === 403, setUser.status);
  const setAdmin = await put('/settings', { siteName: `Perfume Capsules ${uniq}`, announcementBar: 'Free delivery week!' }, adminToken);
  check('PUT /settings (admin) → 200', setAdmin.status === 200 && setAdmin.body?.data?.siteName === `Perfume Capsules ${uniq}`, JSON.stringify(setAdmin.body?.data?.siteName));
  const favUp = await form('PUT', '/settings', { token: adminToken, files: [{ field: 'favicon', filename: 'fav.png' }] });
  check('PUT /settings favicon upload → 200 + https', favUp.status === 200 && /^https:\/\//.test(favUp.body?.data?.faviconUrl || ''), JSON.stringify(favUp.body?.data?.faviconUrl));
  check('favicon stores publicId', !!favUp.body?.data?.faviconPublicId, favUp.body?.data?.faviconPublicId);
  // reset shipping to documented defaults for repeatability
  await put('/settings', { localCity: 'Lahore', localShippingFee: 200, outstationShippingFee: 400, freeShippingThreshold: 5000 }, adminToken);

  // ===================== 9. ERROR ENVELOPE & SECURITY =====================
  section('9. Error envelope & security');
  const notFound = await get('/this-route-does-not-exist');
  check('unknown route → 404 + envelope', notFound.status === 404 && isEnvelope(notFound.body), JSON.stringify(notFound.body));
  check('401 response uses standard envelope', isEnvelope(bNoAuth.body) && bNoAuth.body.data === null, JSON.stringify(bNoAuth.body));
  check('no stack trace leaked in error body', !('stack' in (badReg.body || {})), 'stack present');

  // ===================== 10. RATE LIMITING (last — exhausts budget) =====================
  section('10. Rate limiting (auth)');
  let got429 = false;
  for (let i = 0; i < 14; i++) {
    const r = await post('/auth/login', { email: 'nobody@test.com', password: 'whatever1' });
    if (r.status === 429) { got429 = true; break; }
  }
  check('auth endpoint rate-limits → 429 after burst', got429, 'never hit 429');

  // ===================== CLEANUP =====================
  section('Cleanup (also deletes Cloudinary assets)');
  for (const id of created.products) if (id) await del(`/products/${id}`, adminToken);
  for (const id of created.brands) if (id) await del(`/brands/${id}`, adminToken);
  for (const id of created.categories) if (id) await del(`/categories/${id}`, adminToken);
  console.log('  cleaned products/brands/categories (cascade removes variants/images + Cloudinary assets)');
}

run()
  .then(() => {
    console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
    if (fail) console.log('Failed:', failures.join(' | '));
    process.exit(fail === 0 ? 0 : 1);
  })
  .catch((e) => { console.error('SUITE CRASHED:', e); process.exit(1); });
