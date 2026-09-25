import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { User, Mail, Lock, Phone } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(email, password, fullName, phone);
      if (res.success) {
        showToast('Registration successful! Welcome to U.S. Barber.', 'success');
        onNavigate('/account');
      } else {
        showToast(res.error || 'Registration failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="font-serif text-2xl tracking-widest text-[#F5F2EA] block uppercase font-medium">
            U.S. BARBER
          </span>
          <h1 className="font-serif text-xl text-[#F5F2EA]">Create Customer Account</h1>
          <p className="text-xs text-[#B8B5AE]">
            Save appointment history, book faster, and manage your barbering schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. David Miller"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="david@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
              Mobile Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
              <input
                type="tel"
                placeholder="(410) 555-0182"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
              Password (min 6 characters) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center"
          >
            {submitting ? 'Creating account...' : 'REGISTER ACCOUNT'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#B8B5AE]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/auth/login')}
            className="text-[#C5A059] font-semibold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
