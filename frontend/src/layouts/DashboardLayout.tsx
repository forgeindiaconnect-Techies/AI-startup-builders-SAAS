import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Rocket, LogOut, Menu, X, ChevronLeft, ChevronRight,
  LayoutDashboard, FolderKanban, TrendingUp, Users, Wallet,
  File, Lightbulb, CalendarClock, Handshake, ClipboardList,
  Briefcase, Building2, UserCog, Inbox, CreditCard,
  BarChart2, Settings, CheckSquare, ShieldCheck,
  Map, IndianRupee, Film,
} from 'lucide-react';
import NotificationDropdown from '../components/shared/NotificationDropdown';

// ─── Types ──────────────────────────────────────────────────────
type NavItem = { name: string; icon: React.ElementType; path: string };
type SidebarSection = { items: NavItem[] };

// ─── Simplified Sidebar Config ──────────────────────────────────
const SIDEBAR_CONFIG: Record<string, SidebarSection[]> = {
  founder: [
    {
      items: [
        { name: 'Overview',         icon: LayoutDashboard, path: '/dashboard/founder' },
        { name: 'My Startups',      icon: Rocket,          path: '/dashboard/founder/startups' },
        { name: 'AI Builder',       icon: Lightbulb,       path: '/dashboard/founder/ai-builder' },
        { name: 'Roadmap & Tasks',  icon: Map,             path: '/dashboard/founder/roadmap-tasks' },
        { name: 'Mentors',          icon: Users,           path: '/dashboard/founder/mentors' },
        { name: 'Funding',          icon: Wallet,           path: '/dashboard/founder/funding' },
        { name: 'Subscription',      icon: CreditCard,       path: '/dashboard/founder/billing' },
        { name: 'Documents',        icon: File,            path: '/dashboard/founder/documents' },
        { name: 'Learning Videos',  icon: Film,            path: '/dashboard/founder/learning-videos' },
        { name: 'Founder Support',  icon: Inbox,           path: '/dashboard/founder/inbox' },
        { name: 'Profile & Billing',icon: CreditCard,      path: '/dashboard/founder/profile-billing' },
      ],
    },
  ],

  mentor: [
    {
      items: [
        { name: 'Overview',          icon: LayoutDashboard, path: '/dashboard/mentor' },
        { name: 'Startups to Review',icon: FolderKanban,   path: '/dashboard/mentor/reviews' },
        { name: 'Mentor Sessions',   icon: CalendarClock,  path: '/dashboard/mentor/sessions' },
        { name: 'Feedback',          icon: CheckSquare,    path: '/dashboard/mentor/feedback-hub' },
        { name: 'Earnings',          icon: TrendingUp,     path: '/dashboard/mentor/earnings' },
        { name: 'Mentor Support',    icon: Inbox,          path: '/dashboard/mentor/inbox' },
        { name: 'Profile',           icon: UserCog,        path: '/dashboard/mentor/profile' },
      ],
    },
  ],

  investor: [
    {
      items: [
        { name: 'Overview',           icon: LayoutDashboard, path: '/dashboard/investor' },
        { name: 'Startup Marketplace',icon: Building2,       path: '/dashboard/investor/marketplace' },
        { name: 'Portfolio',          icon: Briefcase,       path: '/dashboard/investor/portfolio-hub' },
        { name: 'Investment Requests',icon: Handshake,       path: '/dashboard/investor/requests' },
        { name: 'Due Diligence',      icon: ClipboardList,   path: '/dashboard/investor/due-diligence' },
        { name: 'Meetings',           icon: CalendarClock,   path: '/dashboard/investor/meetings' },
        { name: 'Transactions',       icon: IndianRupee,     path: '/dashboard/investor/transactions' },
        { name: 'Learning Center',   icon: Film,             path: '/dashboard/investor/learning-center' },
        { name: 'Investor Support',   icon: Inbox,           path: '/dashboard/investor/inbox' },
        { name: 'Profile & KYC',      icon: ShieldCheck,     path: '/dashboard/investor/profile-kyc' },
      ],
    },
  ],

  admin: [
    {
      items: [
        { name: 'Overview',                icon: LayoutDashboard, path: '/dashboard/admin' },
        { name: 'Manage Users',            icon: Users,           path: '/dashboard/admin/users' },
        { name: 'Login Logs',             icon: ClipboardList,   path: '/dashboard/admin/logs' },
        { name: 'Manage Startups',         icon: Rocket,          path: '/dashboard/admin/startups' },
        { name: 'Manage Videos',           icon: Film,            path: '/dashboard/admin/manage-videos' },
        { name: 'Approvals',               icon: ShieldCheck,     path: '/dashboard/admin/approvals-hub' },
        { name: 'Subscriptions & Payments',icon: CreditCard,      path: '/dashboard/admin/sub-payments' },
        { name: 'AI Analytics',            icon: BarChart2,       path: '/dashboard/admin/analytics' },
        { name: 'Platform Settings',       icon: Settings,        path: '/dashboard/admin/platform-settings' },
        { name: 'Support Center',          icon: Inbox,           path: '/dashboard/admin/inbox' },
      ],
    },
  ],
};

// ─── Sidebar Inner ───────────────────────────────────────────────
const SidebarInner: React.FC<{
  isCollapsed: boolean;
  onLinkClick: () => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
}> = ({ isCollapsed, onLinkClick, onLogout, userName, userRole }) => {
  const location = useLocation();
  const sections = SIDEBAR_CONFIG[userRole] ?? [];
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className={`flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'} h-16 border-b border-white/8`}>
        <button onClick={() => { navigate('/'); onLinkClick(); }} className="flex items-center gap-2.5 group">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Rocket size={15} className="text-[#FBBF24]" />
          </div>
          {!isCollapsed && (
            <div className="leading-none">
              <div className="text-[13px] font-extrabold text-white tracking-tight">AI Startup</div>
              <div className="text-[11px] font-bold text-[#FBBF24] tracking-wide">Builder</div>
            </div>
          )}
        </button>
        <button className="md:hidden text-gray-500 hover:text-white p-1" onClick={onLinkClick}>
          <X size={18} />
        </button>
      </div>

      {/* User card */}
      <div className={`flex-shrink-0 ${isCollapsed ? 'py-3 flex justify-center' : 'px-4 py-3'}`}>
        {isCollapsed ? (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-sm font-black shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24] truncate">{userRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = item.path === `/dashboard/${userRole}`
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/dashboard/${userRole}`}
                  onClick={onLinkClick}
                  title={isCollapsed ? item.name : undefined}
                  className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white shadow-lg shadow-purple-900/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon
                    size={17}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#FBBF24]' : 'text-gray-500 group-hover:text-gray-300'}`}
                  />
                  {!isCollapsed && <span className="truncate text-[13px]">{item.name}</span>}
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#FBBF24]" />}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1f2e] border border-white/10 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
        <div className="h-4" />
      </div>

      {/* Sign Out */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-white/8">
        <button
          onClick={onLogout}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} className="flex-shrink-0 group-hover:text-red-400 transition-colors" />
          {!isCollapsed && 'Sign Out'}
          {isCollapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1f2e] border border-white/10 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main Layout ────────────────────────────────────────────────
const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const closeMobile = () => setIsMobileOpen(false);

  const sidebarProps = {
    isCollapsed,
    onLinkClick: closeMobile,
    onLogout: handleLogout,
    userName: user?.fullName ?? '',
    userRole: user?.role ?? '',
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm" onClick={closeMobile} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1117] md:hidden transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarInner {...sidebarProps} />
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex flex-col flex-shrink-0 bg-[#0F1117] border-r border-white/5 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[68px]' : 'w-60'}`}>
        <SidebarInner {...sidebarProps} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <button className="hidden md:flex p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setIsCollapsed(c => !c)} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400 font-semibold capitalize">{user?.role} Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
              <button
                onClick={() => {
                  const profileMap: Record<string, string> = {
                    founder: '/dashboard/founder/profile-billing',
                    investor: '/dashboard/investor/profile-kyc',
                    mentor: '/dashboard/mentor/profile',
                    admin: '/dashboard/admin',
                  };
                  navigate(profileMap[user?.role ?? ''] ?? '/dashboard');
                }}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-xs font-black shadow">
                  {(user?.fullName || '?').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700">{user?.fullName}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="p-5 sm:p-7 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
