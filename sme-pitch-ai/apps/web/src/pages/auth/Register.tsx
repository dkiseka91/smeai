import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="font-montserrat font-bold text-2xl text-navy mb-2">Check your email</h2>
        <p className="text-steel-grey text-sm">We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-montserrat font-bold text-2xl text-navy">Create your account</h1>
          <p className="text-steel-grey text-sm mt-1">Start with a free plan — no credit card needed</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-error text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-dark-grey mb-1 capitalize">{field === 'name' ? 'Full Name' : field}</label>
              <input id={field} type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-amber text-navy py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-amber/90 disabled:opacity-50 transition-colors">
            {loading ? 'Creating account…' : 'Create Free Account'}
          </button>
        </form>
        <p className="text-center text-sm text-steel-grey mt-6">
          Already have an account? <Link to="/login" className="text-navy font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
