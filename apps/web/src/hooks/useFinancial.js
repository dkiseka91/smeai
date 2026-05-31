import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
export function useFinancialModel(profileId) {
    return useQuery({
        queryKey: ['financial', profileId],
        queryFn: () => api.get(`/financial/${profileId}`).then(r => r.data),
        enabled: !!profileId,
        staleTime: 5 * 60 * 1000,
    });
}
export function useCalculateFinancial() {
    return useMutation({
        mutationFn: (inputs) => api.post('/financial/calculate', inputs).then(r => r.data),
    });
}
export function useSaveFinancialModel(profileId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post(`/financial/${profileId}/save`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['financial', profileId] }),
    });
}
