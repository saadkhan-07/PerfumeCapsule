/**
 * Predefined list of major Pakistani cities for the checkout city combobox.
 * Kept intentionally short (a searchable combobox, not an exhaustive registry).
 * The admin's "inside city" setting is also chosen from this list, so the
 * configured inside city is always one the checkout combobox can match.
 */
export const PAKISTAN_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Sheikhupura',
  'Mardan', 'Gujrat', 'Kasur', 'Sahiwal', 'Okara',
  'Abbottabad', 'Mansehra', 'Vehari', 'Jhang', 'Chiniot',
]

/** Default inside city. The actual value is admin-configurable via SiteSettings.localCity. */
export const INSIDE_CITY_NAME = 'Lahore'

/**
 * True when `city` is the configured inside city. The inside city defaults to
 * Lahore but is admin-editable (SiteSettings.localCity), so callers pass that
 * value. Comparison is case/whitespace-insensitive. SINGLE source of truth for
 * the inside-city decision on the frontend — no other code should string-compare
 * city names independently.
 */
export const isInsideCity = (city: string, insideCity: string = INSIDE_CITY_NAME): boolean =>
  city.trim().toLowerCase() === insideCity.trim().toLowerCase()
