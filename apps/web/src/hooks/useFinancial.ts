import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { FinancialModelOutputs } from '@sme-pitch-ai/shared';

export function useFinancialModel(profileId: string | undefined) {
  return useQuery({
    queryKey: ['financial', profileId],
    queryFn: () => api.get(`/financial/${profileId}`).then(r => r.data as { outputs: FinancialModelOutputs }),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCalculateFinancial() {
  return useMutation({
    mutationFn: (inputs: Record<string, unknown>) =>
      api.post('/financial/calculate', inputs).then(r => r.data as FinancialModelOutputs),
  });
}

export function useSaveFinancialModel(profileId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { inputs: Record<string, unknown>; outputs: FinancialModelOutputs }) =>
      api.post(`/financial/${profileId}/save`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial', profileId] }),
  });
}
