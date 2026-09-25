import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Scissors,
  Users,
  Image,
  UserCheck,
  Clock,
  CalendarOff,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'appointments'
  | 'calendar'
  | 'services'
  | 'barbers'
  | 'gallery'
  | 'customers'
  | 'hours'
  | 'blocked-dates'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateHome,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar View', icon: <Calendar className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Scissors className="w-4 h-4" /> },
    { id: 'barbers', label: 'Barbers / Team', icon: <Users className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery', icon: <Image className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'hours', label: 'Business Hours', icon: <Clock className="w-4 h-4" /> },
    { id: 'blocked-dates', label: 'Blocked Dates', icon: <CalendarOff className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#121314] text-[#F5F2EA] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1A1B1D] border-b border-[#2E3035]">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#C5A059]" />
          <span className="font-serif tracking-widest uppercase font-medium">U.S. Barber Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-[#F5F2EA] focus:outline-none"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar: Desktop + Mobile Drawer */}
      <aside
        className={`w-64 bg-[#161719] border-r border-[#2E3035] flex flex-col justify-between z-40 transition-all ${
          mobileSidebarOpen
            ? 'fixed inset-y-0 left-0 flex'
            : 'hidden md:flex shrink-0 min-h-screen'
        }`}
      >
        <div className="p-6">
          {/* Brand & Badge */}
          <div className="pb-6 border-b border-[#2E3035] flex items-center justify-between">
            <div>
              <span className="font-serif text-xl tracking-wider text-[#F5F2EA] block font-semibold">
                U.S. BARBER
              </span>
              <span className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider block mt-0.5">
                Admin Management Console
              </span>
            </div>
            {mobileSidebarOpen && (
              <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-[#B8B5AE]">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#C5A059] text-[#121314] font-semibold shadow-sm'
                      : 'text-[#B8B5AE] hover:text-[#F5F2EA] hover:bg-[#202124]'
                  }`}
                >
                  <span className={isActive ? 'text-[#121314]' : 'text-[#C5A059]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Profile & Exit */}
        <div className="p-6 border-t border-[#2E3035] space-y-3">
          <div className="text-xs text-[#B8B5AE] truncate">
            <span className="block text-[11px] text-[#C5A059] uppercase font-semibold">Signed in as:</span>
            <span className="text-[#F5F2EA] font-medium truncate block">{user?.email}</span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-xs text-[#B8B5AE] hover:text-[#F5F2EA] transition-colors py-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
              View Public Website
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
