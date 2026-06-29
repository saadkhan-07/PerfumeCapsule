import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings, type SettingsFormValues } from '../services/settings.service'
import { getApiErrorMessage } from '../utils/apiError'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'

const EMPTY: SettingsFormValues = {
  siteName: '', tagline: '', contactEmail: '', contactPhone: '', addressLine: '', city: '',
  instagramUrl: '', facebookUrl: '', tiktokUrl: '', currency: '', localCity: '',
  localShippingFee: '', outstationShippingFee: '', freeShippingThreshold: '',
  announcementBar: '', maintenanceMode: false,
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-xl border border-neutral-200 bg-white p-5">
    <h2 className="mb-4 text-base font-semibold text-neutral-900">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
)

export function AdminSettingsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings })

  const [form, setForm] = useState<SettingsFormValues>(EMPTY)
  const [logo, setLogo] = useState<File | null>(null)
  const [favicon, setFavicon] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!data) return
    setForm({
      siteName: data.siteName ?? '',
      tagline: data.tagline ?? '',
      contactEmail: data.contactEmail ?? '',
      contactPhone: data.contactPhone ?? '',
      addressLine: data.addressLine ?? '',
      city: data.city ?? '',
      instagramUrl: data.instagramUrl ?? '',
      facebookUrl: data.facebookUrl ?? '',
      tiktokUrl: data.tiktokUrl ?? '',
      currency: data.currency ?? '',
      localCity: data.localCity ?? '',
      localShippingFee: data.localShippingFee != null ? String(data.localShippingFee) : '',
      outstationShippingFee:
        data.outstationShippingFee != null ? String(data.outstationShippingFee) : '',
      freeShippingThreshold:
        data.freeShippingThreshold != null ? String(data.freeShippingThreshold) : '',
      announcementBar: data.announcementBar ?? '',
      maintenanceMode: data.maintenanceMode ?? false,
    })
  }, [data])

  const update = (key: keyof SettingsFormValues, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const saveMut = useMutation({
    mutationFn: () => updateSettings(form, { logo, favicon }),
    onSuccess: (updated) => {
      qc.setQueryData(['settings'], updated)
      setLogo(null)
      setFavicon(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  })

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        saveMut.mutate()
      }}
      className="max-w-2xl space-y-6"
      noValidate
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Site settings</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Saved ✓</span>}
          <Button type="submit" isLoading={saveMut.isPending}>
            Save changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Section title="Identity">
        <Input
          label="Site name"
          value={form.siteName}
          onChange={(e) => update('siteName', e.target.value)}
          required
        />
        <Input
          label="Tagline"
          placeholder="Authentic branded decants"
          value={form.tagline}
          onChange={(e) => update('tagline', e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Logo</label>
          <div className="flex items-center gap-4">
            {data?.logoUrl ? (
              <img src={data.logoUrl} alt="Current logo" className="h-12 w-12 rounded object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-neutral-100 text-xs text-neutral-400">
                none
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              className="block text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:text-white"
            />
          </div>
          {logo && <p className="mt-1 text-xs text-neutral-500">New logo selected: {logo.name}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Favicon</label>
          <div className="flex items-center gap-4">
            {data?.faviconUrl ? (
              <img src={data.faviconUrl} alt="Current favicon" className="h-8 w-8 rounded object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 text-[10px] text-neutral-400">
                none
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFavicon(e.target.files?.[0] ?? null)}
              className="block text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:text-white"
            />
          </div>
        </div>
      </Section>

      <Section title="Contact">
        <Input label="Contact email" type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
        <Input label="Contact phone" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
        <Input label="Address" value={form.addressLine} onChange={(e) => update('addressLine', e.target.value)} />
        <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
      </Section>

      <Section title="Social">
        <Input label="Instagram URL" value={form.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} placeholder="https://instagram.com/…" />
        <Input label="Facebook URL" value={form.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} placeholder="https://facebook.com/…" />
        <Input label="TikTok URL" value={form.tiktokUrl} onChange={(e) => update('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@…" />
      </Section>

      <Section title="Commerce & shipping">
        <Input label="Currency" value={form.currency} onChange={(e) => update('currency', e.target.value)} />
        <Input label="Local city" value={form.localCity} onChange={(e) => update('localCity', e.target.value)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Local fee" type="number" value={form.localShippingFee} onChange={(e) => update('localShippingFee', e.target.value)} />
          <Input label="Outstation fee" type="number" value={form.outstationShippingFee} onChange={(e) => update('outstationShippingFee', e.target.value)} />
          <Input label="Free over" type="number" value={form.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', e.target.value)} />
        </div>
      </Section>

      <Section title="Announcement & maintenance">
        <Input
          label="Announcement bar text"
          value={form.announcementBar}
          onChange={(e) => update('announcementBar', e.target.value)}
          placeholder="Free delivery this week!"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
            className="h-4 w-4 accent-neutral-900"
          />
          Maintenance mode
        </label>
      </Section>
    </form>
  )
}
