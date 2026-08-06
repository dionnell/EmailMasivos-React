import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { DashboardMetrics } from '@/shared/types'

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => api.get<DashboardMetrics>(ENDPOINTS.dashboard.metrics).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })
}