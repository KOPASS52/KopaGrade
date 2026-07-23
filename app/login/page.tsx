'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Convert input to email format if user typed a username (e.g. admin -> admin@kobokoparents.ac.ug)
      const email = emailOrUsername.includes('@')
        ? emailOrUsername
        : `${emailOrUsername.toLowerCase().trim()}@kobokoparents.ac.ug`;

      // 2. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error('User account not found.');

      // 3. Determine role via User Metadata or Profile check
      // (Checks metadata first; defaults to checking user_metadata.role)
      const userRole = user.user_metadata?.role;

      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'teacher') {
        router.push('/teacher/enter-marks');
      } else {
        // Fallback profile lookup from Supabase database if role isn't in metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // Default role for staff/teachers
          router.push('/teacher/enter-marks');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Portal Access</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in with your assigned ID or Email</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Username / Email / Teacher ID
            </label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. admin or teacher_john"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-lg text-sm transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Forgot your password? Contact school IT system administrator.
        </div>
      </div>
    </div>
  );
}