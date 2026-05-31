import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.post('/auth/forgot-password', { email }).catch(() => {});
    setDone(true);
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="font-montserrat font-bold text-2xl text-navy mb-2">Check your email</h2>
        <p className="text-steel-grey text-sm">If that email is registered, a reset link has been sent.</p>
        <Link to="/login" className="mt-6 inline-block text-navy font-semibold text-sm hover:underline">Back to login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="font-montserrat font-bold text-2xl text-navy mb-2 text-center">Reset your password</h1>
        <p className="text-steel-grey text-sm text-center mb-6">Enter your email and we'll send a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-grey mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-navy text-white py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-navy/90 disabled:opacity-50">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center mt-4"><Link to="/login" className="text-sm text-navy hover:underline">Back to login</Link></p>
      </div>
    </div>
  );
}
