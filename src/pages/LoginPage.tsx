import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { authService } from '../services/auth.service';
import { Shield, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Signed in successfully!', 'success');
        // If email was admin, redirect to admin, else account
        if (email.toLowerCase().includes('admin')) {
          onNavigate('/admin');
        } else {
          onNavigate('/account');
        }
      } else {
        showToast(res.error || 'Authentication failed. Please verify your credentials.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error signing in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email || !email.includes('@')) {
      showToast('Please enter your email address to reset password.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword(email);
      setResetSent(true);
      showToast('Password reset instructions sent if account exists.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not send reset email.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="font-serif text-2xl tracking-widest text-[#F5F2EA] block uppercase font-medium">
            U.S. BARBER
          </span>
          <h1 className="font-serif text-xl text-[#F5F2EA]">Sign In to Your Account</h1>
          <p className="text-xs text-[#B8B5AE]">
            Access your appointments, update bookings, and manage grooming preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EA]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(!showForgot)}
                className="text-xs text-[#C5A059] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
              />
            </div>
          </div>

          {showForgot && (
            <div className="p-3 bg-[#121314] border border-[#2E3035] rounded text-xs space-y-2">
              <p className="text-[#B8B5AE]">
                Enter your email above and click below to initiate password recovery.
              </p>
              <button
                type="button"
                disabled={submitting}
                onClick={handlePasswordReset}
                className="text-[#C5A059] font-medium hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                Send Password Reset Email
              </button>
              {resetSent && <p className="text-emerald-400">Reset instructions dispatched.</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? 'Authenticating...' : 'SIGN IN'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#B8B5AE]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('/auth/register')}
            className="text-[#C5A059] font-semibold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
