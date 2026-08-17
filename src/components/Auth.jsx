import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setErrorMsg(result.error.message);
    } else if (result.data.session) {
      onLogin(result.data.session);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">🏗️ Site Attendance</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isSignUp ? 'Create an account to manage site data' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs font-semibold text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-all shadow-xs"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}