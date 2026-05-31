import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Profile {
  id: string;
  name: string;
  industry: string;
  stage: string;
  country: string;
  currency: string;
  isComplete: boolean;
  onboardingData: Record<string, unknown>;
}

export function useProfiles() {
  return useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: () => api.get('/profiles').then(r => r.data as Profile[]),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfile(profileId: string | undefined) {
  return useQuery<Profile>({
    queryKey: ['profile', profileId],
    queryFn: () => api.get(`/profiles/${profileId}`).then(r => r.data as Profile),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Profile> & { onboardingData?: Record<string, unknown> }) =>
      api.post('/profiles', data).then(r => r.data as Profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useUpdateProfile(profileId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Profile> & { onboardingData?: Record<string, unknown> }) =>
      api.put(`/profiles/${profileId}`, data).then(r => r.data as Profile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      qc.invalidateQueries({ queryKey: ['profile', profileId] });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => api.delete(`/profiles/${profileId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}
