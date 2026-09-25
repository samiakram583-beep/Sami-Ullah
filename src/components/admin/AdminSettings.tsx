import React, { useState, useEffect } from 'react';
import { ShopSettings } from '../../types';
import { settingsService } from '../../services/settings.service';
import { isSupabaseConfigured, supabase, SUPABASE_URL, SUPABASE_PROJECT_ID } from '../../lib/supabase/client';
import { useToast } from '../common/Toast';
import { Save, Database, Shield, Sliders, MapPin, CheckCircle2, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Supabase Diagnostics
  const [testingConnection, setTestingConnection] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    tablesFound: boolean;
    message: string;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await settingsService.getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    testSupabase();
  }, []);

  const testSupabase = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setDbStatus({
        connected: false,
        tablesFound: false,
        message: 'Supabase credentials not detected.',
      });
      return;
    }

    setTestingConnection(true);
    try {
      const { data, error } = await supabase.from('appointments').select('id').limit(1);

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          setDbStatus({
            connected: true,
            tablesFound: false,
            message: 'Connected to Supabase project! However, the `appointments` table has not yet been initialized in your SQL schema. Run the quickstart script below in your Supabase SQL Editor.',
          });
        } else {
          setDbStatus({
            connected: true,
            tablesFound: false,
            message: `Supabase responded: ${error.message}`,
          });
        }
      } else {
        setDbStatus({
          connected: true,
          tablesFound: true,
          message: 'All Supabase tables connected and ready! Customer appointments are actively synced to your PostgreSQL database.',
        });
      }
    } catch (err: any) {
      setDbStatus({
        connected: false,
        tablesFound: false,
        message: `Connection test error: ${err.message || 'Unknown network error'}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopySql = () => {
    const sqlScript = `-- U.S. Barber Supabase Schema Quickstart
-- Copy and run in Supabase Dashboard > SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    confirmation_code TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    service_id TEXT NOT NULL,
    barber_id TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    category TEXT NOT NULL DEFAULT 'Haircuts',
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.barbers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    specialties TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read services" ON public.services FOR ALL USING (true);
CREATE POLICY "Public read barbers" ON public.barbers FOR ALL USING (true);
`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    showToast('SQL setup script copied to clipboard.', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      showToast('Shop settings and booking rules saved.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading settings...</div>;
  }

  const supabaseActive = isSupabaseConfigured();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            System & Operations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Shop Configuration & Rules
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            Adjust general business information, booking schedule policies, and backend database parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-[#F5F2EA]">Supabase Backend Integration</h2>
              <span className="text-xs text-[#B8B5AE] font-mono">
                Project: {SUPABASE_PROJECT_ID} · {SUPABASE_URL}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={testSupabase}
              disabled={testingConnection}
              className="px-3.5 py-1.5 bg-[#202124] hover:bg-[#2A2B30] text-[#F5F2EA] border border-[#2E3035] text-xs font-semibold rounded flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Supabase
            </a>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="p-4 bg-[#121314] rounded border border-[#2E3035] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F5F2EA] flex items-center gap-2">
              {dbStatus?.tablesFound ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#C5A059]" />
              )}
              {dbStatus?.tablesFound ? 'Supabase Synchronized' : 'Supabase Connected (Setup Needed)'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                dbStatus?.tablesFound
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {dbStatus?.tablesFound ? 'Live DB Active' : 'Waiting For Tables'}
            </span>
          </div>
          <p className="text-[#B8B5AE] leading-relaxed">
            {dbStatus?.message || 'Testing connection to your Supabase project...'}
          </p>
        </div>

        {/* Setup Instructions & 1-Click Copy */}
        {!dbStatus?.tablesFound && (
          <div className="p-4 bg-[#141517] rounded border border-[#C5A059]/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#C5A059] uppercase tracking-wider text-[11px]">
                One-Click Supabase Table Setup
              </span>
              <button
                onClick={handleCopySql}
                className="px-3 py-1 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold rounded flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedSql ? 'COPIED!' : 'COPY SQL SCRIPT'}
              </button>
            </div>
            <p className="text-[#B8B5AE]">
              To complete the connection, open your{' '}
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C5A059] underline font-medium"
              >
                Supabase SQL Editor
              </a>
              , paste the copied script, and click <strong>Run</strong>. The <code className="text-[#C5A059]">appointments</code> table and RLS policies will be created instantly.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Business Information */}
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#2E3035] pb-4">
            <MapPin className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-serif text-xl text-[#F5F2EA]">General Business Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">Shop Name</label>
              <input
                type="text"
                value={settings.shop_name}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">Shop Telephone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#F5F2EA] font-semibold mb-1">Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#F5F2EA] font-semibold mb-1">Google Maps Link</label>
              <input
                type="text"
                value={settings.google_maps_url}
                onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Booking Rules */}
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#2E3035] pb-4">
            <Sliders className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-serif text-xl text-[#F5F2EA]">Booking & Scheduling Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">
                Minimum Advance Notice (Minutes)
              </label>
              <p className="text-[11px] text-[#B8B5AE] mb-1.5">
                Earliest booking allowed from right now (e.g. 60 = 1 hour notice).
              </p>
              <input
                type="number"
                min="0"
                step="15"
                value={settings.min_notice_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, min_notice_minutes: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">
                Maximum Advance Days (Days)
              </label>
              <p className="text-[11px] text-[#B8B5AE] mb-1.5">
                How far into the future customers can schedule (e.g. 30 days).
              </p>
              <input
                type="number"
                min="1"
                max="90"
                value={settings.max_advance_days}
                onChange={(e) =>
                  setSettings({ ...settings, max_advance_days: parseInt(e.target.value, 10) || 30 })
                }
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">
                Customer Cancellation Window (Hours)
              </label>
              <p className="text-[11px] text-[#B8B5AE] mb-1.5">
                Hours before appointment when self-service cancellation is allowed.
              </p>
              <input
                type="number"
                min="0"
                value={settings.cancellation_window_hours}
                onChange={(e) =>
                  setSettings({ ...settings, cancellation_window_hours: parseInt(e.target.value, 10) || 2 })
                }
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-[#F5F2EA] font-semibold mb-1">
                Time Slot Grid Interval (Minutes)
              </label>
              <p className="text-[11px] text-[#B8B5AE] mb-1.5">
                Standard appointment cadence (e.g. 15 or 30 minute start increments).
              </p>
              <input
                type="number"
                min="15"
                step="15"
                value={settings.slot_interval_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, slot_interval_minutes: parseInt(e.target.value, 10) || 30 })
                }
                className="w-full bg-[#121314] border border-[#2E3035] p-2.5 text-[#F5F2EA] rounded focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
