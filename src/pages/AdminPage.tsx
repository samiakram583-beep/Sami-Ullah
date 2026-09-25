import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { authService } from '../services/auth.service';
import { AdminLayout, AdminTab } from '../components/admin/AdminLayout';
import { AdminDashboardHome } from '../components/admin/AdminDashboardHome';
import { AdminAppointments } from '../components/admin/AdminAppointments';
import { AdminCalendar } from '../components/admin/AdminCalendar';
import { AdminServices } from '../components/admin/AdminServices';
import { AdminBarbers } from '../components/admin/AdminBarbers';
import { AdminGallery } from '../components/admin/AdminGallery';
import { AdminCustomers } from '../components/admin/AdminCustomers';
import { AdminHours } from '../components/admin/AdminHours';
import { AdminBlockedDates } from '../components/admin/AdminBlockedDates';
import { AdminSettings } from '../components/admin/AdminSettings';
import {
  Shield,
  Lock,
  AlertTriangle,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  LockKeyhole,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface AdminPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome }) => {
  const { user, isAdmin, loading, registerSingleAdmin, loginAdmin, logout } = useAuth();
  const { showToast } = useToast();

  // Default tab is 'appointments' so the admin immediately sees all bookings done on the website
  const [currentTab, setCurrentTab] = useState<AdminTab>('appointments');

  // Admin slot state
  const [slotAvailable, setSlotAvailable] = useState<boolean>(() => authService.isAdminSlotAvailable());
  const [slotInfo, setSlotInfo] = useState(() => authService.getAdminSlotInfo());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync slot status on mount and when auth state changes
  useEffect(() => {
    const isAvail = authService.isAdminSlotAvailable();
    const info = authService.getAdminSlotInfo();
    setSlotAvailable(isAvail);
    setSlotInfo(info);
    if (isAvail) {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121314] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // User is logged in as Customer (not Admin)
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#121314] flex items-center justify-center p-4">
        <div className="bg-[#1A1B1D] border border-red-500/30 rounded max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#F5F2EA]">Admin Privilege Required</h1>
            <p className="text-xs text-[#B8B5AE] mt-2">
              You are currently signed in as <strong className="text-[#F5F2EA]">{user.email}</strong> with customer privileges.
              This portal is restricted to the shop administrator.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={async () => {
                await logout();
                setAuthMode('login');
              }}
              className="w-full py-3 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Sign Out & Switch to Admin Login
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 bg-[#202124] text-[#B8B5AE] hover:text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider border border-[#2E3035]"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is NOT logged in: Show Admin Auth (Setup slot or Login)
  if (!user || !isAdmin) {
    const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!slotAvailable) {
        setFormError('The single administrator slot has already been claimed. Additional admin accounts cannot be created.');
        showToast('Admin slot is already claimed.', 'error');
        setAuthMode('login');
        return;
      }

      if (!fullName.trim() || !email.trim() || !password) {
        setFormError('Please fill in all required fields.');
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please verify.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await registerSingleAdmin(email.trim(), password, fullName.trim(), phone.trim());
        if (res.success) {
          showToast('Administrator account created and claimed successfully!', 'success');
          // Re-evaluate slot availability
          setSlotAvailable(false);
          setSlotInfo(authService.getAdminSlotInfo());
        } else {
          setFormError(res.error || 'Failed to create administrator account.');
          showToast(res.error || 'Admin creation failed.', 'error');
        }
      } catch (err: any) {
        setFormError(err.message || 'Error creating admin account.');
      } finally {
        setSubmitting(false);
      }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!email.trim() || !password) {
        setFormError('Please enter both administrator email and password.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await loginAdmin(email.trim(), password);
        if (res.success) {
          showToast('Administrator authenticated successfully.', 'success');
        } else {
          setFormError(res.error || 'Invalid administrator credentials.');
          showToast(res.error || 'Login failed.', 'error');
        }
      } catch (err: any) {
        setFormError(err.message || 'Authentication error.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#121314] flex items-center justify-center p-4 py-12">
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded-lg max-w-lg w-full p-8 shadow-2xl space-y-6">
          
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 mb-2">
              <Shield className="w-7 h-7" />
            </div>
            <span className="font-serif text-2xl tracking-widest text-[#F5F2EA] block uppercase font-medium">
              U.S. BARBER
            </span>
            <p className="text-xs uppercase tracking-widest text-[#C5A059] font-mono font-semibold">
              Admin & Staff Portal
            </p>
          </div>

          {/* Slot Status Banner */}
          {slotAvailable ? (
            <div className="p-3.5 bg-[#C5A059]/10 border border-[#C5A059]/40 rounded text-xs space-y-1">
              <div className="flex items-center gap-2 text-[#C5A059] font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Single Admin Slot Available (1 of 1)</span>
              </div>
              <p className="text-[#B8B5AE] text-[11px] leading-relaxed">
                Create the primary shop administrator account below. Once this account is created, the registration slot will be permanently closed and nobody else will be allowed to create an admin account.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-[#202124] border border-[#2E3035] rounded text-xs space-y-1">
              <div className="flex items-center gap-2 text-[#F5F2EA] font-semibold uppercase tracking-wider">
                <LockKeyhole className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Admin Slot Claimed — Registration Locked</span>
              </div>
              <p className="text-[#B8B5AE] text-[11px] leading-relaxed">
                The single administrator account has already been registered{slotInfo.emailMasked ? ` (${slotInfo.emailMasked})` : ''}. Only the primary administrator may log in. Additional admin creation is disabled.
              </p>
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* MODE 1: REGISTER SINGLE ADMIN */}
          {authMode === 'register' && slotAvailable && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Administrator Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Barber / Shop Owner"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Administrator Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="owner@usbarber.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Direct Phone <span className="text-[11px] text-[#B8B5AE] font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+1 (410) 788-5156"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-10 py-2.5 rounded focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#B8B5AE] hover:text-[#F5F2EA]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {submitting ? 'Creating Admin Account...' : 'CREATE & CLAIM ADMIN ACCOUNT'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-xs text-[#B8B5AE]">
                Already created your account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setAuthMode('login');
                  }}
                  className="text-[#C5A059] font-medium hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: LOGIN ADMIN */}
          {(authMode === 'login' || !slotAvailable) && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Administrator Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="admin@usbarber.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-3 py-2.5 rounded focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#B8B5AE] absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm pl-10 pr-10 py-2.5 rounded focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#B8B5AE] hover:text-[#F5F2EA]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'SIGN IN TO ADMIN PANEL'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {slotAvailable ? (
                <div className="text-center pt-2 text-xs text-[#B8B5AE]">
                  Haven't created the admin account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setAuthMode('register');
                    }}
                    className="text-[#C5A059] font-medium hover:underline"
                  >
                    Claim Single Admin Slot
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#121314] border border-[#2E3035] rounded text-center text-[11px] text-[#B8B5AE]">
                  Admin registration is closed. Only the single claimed administrator account is authorized.
                </div>
              )}
            </form>
          )}

          {/* Return to website link */}
          <div className="pt-2 border-t border-[#2E3035] text-center">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Website
            </button>
          </div>

        </div>
      </div>
    );
  }

  // User is verified Administrator: Render Full Admin Panel!
  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onNavigateHome={onNavigateHome}
    >
      {currentTab === 'appointments' && <AdminAppointments />}
      {currentTab === 'dashboard' && (
        <AdminDashboardHome onNavigateToTab={setCurrentTab} />
      )}
      {currentTab === 'calendar' && <AdminCalendar />}
      {currentTab === 'services' && <AdminServices />}
      {currentTab === 'barbers' && <AdminBarbers />}
      {currentTab === 'gallery' && <AdminGallery />}
      {currentTab === 'customers' && <AdminCustomers />}
      {currentTab === 'hours' && <AdminHours />}
      {currentTab === 'blocked-dates' && <AdminBlockedDates />}
      {currentTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
