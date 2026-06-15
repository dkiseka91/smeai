import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Missing reset token. Please request a new password reset link.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Invalid or expired reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-montserrat font-bold text-2xl text-navy mb-2">Password reset!</h2>
        <p className="text-steel-grey text-sm">Your password has been updated. Redirecting to login…</p>
        <Link to="/login" className="mt-6 inline-block text-navy font-semibold text-sm hover:underline">Go to login now</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="font-montserrat font-bold text-2xl text-navy mb-2 text-center">Set new password</h1>
        <p className="text-steel-grey text-sm text-center mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-grey mb-1">New Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-dark-grey mb-1">Confirm Password</label>
            <input id="confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !token}
            className="w-full bg-navy text-white py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-navy/90 disabled:opacity-50">
            {loading ? 'Updating…' : 'Set New Password'}
          </button>
        </form>
        <p className="text-center mt-4"><Link to="/forgot-password" className="text-sm text-navy hover:underline">Request new reset link</Link></p>
      </div>
    </div>
  );
}
