import { useQuery } from '@tanstack/react-query'
import { getSettings } from '../services/settings.service'

/** Site-wide settings (public). Cached for a while; rarely changes. */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 10,
  })
}
