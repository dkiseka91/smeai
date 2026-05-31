import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
export function useProfiles() {
    return useQuery({
        queryKey: ['profiles'],
        queryFn: () => api.get('/profiles').then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });
}
export function useProfile(profileId) {
    return useQuery({
        queryKey: ['profile', profileId],
        queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data),
        enabled: !!profileId,
        staleTime: 5 * 60 * 1000,
    });
}
export function useCreateProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post('/profiles', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
    });
}
export function useUpdateProfile(profileId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.put(`/profiles/${profileId}`, data).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['profiles'] });
            qc.invalidateQueries({ queryKey: ['profile', profileId] });
        },
    });
}
export function useDeleteProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (profileId) => api.delete(`/profiles/${profileId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
    });
}
