import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    api.post(`/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        setAuth({ id: '', email: '', name: '', planTier: 'FREE' }, data.accessToken, data.refreshToken);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && <p className="text-steel-grey">Verifying your email…</p>}
        {status === 'success' && <><h2 className="font-montserrat font-bold text-2xl text-navy mb-2">Email verified!</h2><p className="text-steel-grey text-sm">Redirecting to your dashboard…</p></>}
        {status === 'error' && <><h2 className="font-montserrat font-bold text-2xl text-error mb-2">Verification failed</h2><p className="text-steel-grey text-sm">The link may be expired. <a href="/login" className="text-navy underline">Return to login</a></p></>}
      </div>
    </div>
  );
}
