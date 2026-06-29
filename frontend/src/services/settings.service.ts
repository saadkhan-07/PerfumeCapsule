import { api } from './api'
import type { ApiResponse, SiteSettings } from '../types'

export async function getSettings(): Promise<SiteSettings> {
  const { data } = await api.get<ApiResponse<SiteSettings>>('/settings')
  return data.data
}

export interface SettingsFormValues {
  siteName: string
  tagline: string
  contactEmail: string
  contactPhone: string
  addressLine: string
  city: string
  instagramUrl: string
  facebookUrl: string
  tiktokUrl: string
  currency: string
  localCity: string
  localShippingFee: string
  outstationShippingFee: string
  freeShippingThreshold: string
  announcementBar: string
  maintenanceMode: boolean
}

/**
 * Update settings via multipart PUT. Empty values are omitted so format-validated
 * optional fields (email/url) and numbers aren't rejected; siteName is always sent.
 */
export async function updateSettings(
  values: SettingsFormValues,
  files: { logo?: File | null; favicon?: File | null } = {},
): Promise<SiteSettings> {
  const fd = new FormData()
  const appendIf = (key: string, value: string) => {
    if (value.trim() !== '') fd.append(key, value.trim())
  }

  fd.append('siteName', values.siteName)
  // Free-text fields safe to clear with an empty string.
  fd.append('tagline', values.tagline)
  fd.append('announcementBar', values.announcementBar)
  fd.append('maintenanceMode', values.maintenanceMode ? 'true' : 'false')

  // Format/number-validated fields: only send when non-empty.
  appendIf('contactEmail', values.contactEmail)
  appendIf('contactPhone', values.contactPhone)
  appendIf('addressLine', values.addressLine)
  appendIf('city', values.city)
  appendIf('instagramUrl', values.instagramUrl)
  appendIf('facebookUrl', values.facebookUrl)
  appendIf('tiktokUrl', values.tiktokUrl)
  appendIf('currency', values.currency)
  appendIf('localCity', values.localCity)
  appendIf('localShippingFee', values.localShippingFee)
  appendIf('outstationShippingFee', values.outstationShippingFee)
  appendIf('freeShippingThreshold', values.freeShippingThreshold)

  if (files.logo) fd.append('logo', files.logo)
  if (files.favicon) fd.append('favicon', files.favicon)

  const { data } = await api.put<ApiResponse<SiteSettings>>('/settings', fd)
  return data.data
}
