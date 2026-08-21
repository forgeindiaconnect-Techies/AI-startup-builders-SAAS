import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Rocket, LogOut, Menu, X, ChevronLeft, ChevronRight,
  LayoutDashboard, FolderKanban, TrendingUp, Users, Wallet,
  File, Lightbulb, CalendarClock, Handshake, ClipboardList,
  Briefcase, Building2, UserCog, Inbox, CreditCard,
  BarChart2, Settings, CheckSquare, ShieldCheck,
  IndianRupee, Film, Link2, Bell, GraduationCap, Star, FolderLock, ScrollText, FileText,
} from 'lucide-react';
import NotificationDropdown from '../components/shared/NotificationDropdown';
import PlanGate from '../components/shared/PlanGate';

// ─── Dashboard page registry (rendered in-place when a sidebar item is clicked) ───
import FounderDashboard from '../pages/dashboards/FounderDashboard';
import FounderStartups from '../pages/dashboards/founder/FounderStartups';
import FounderAIBuilder from '../pages/dashboards/founder/FounderAIBuilder';
import FounderMentors from '../pages/dashboards/founder/FounderMentors';
import FounderMentorReviews from '../pages/dashboards/founder/FounderMentorReviews';
import FounderFunding from '../pages/dashboards/founder/FounderFunding';
import FounderBilling from '../pages/dashboards/founder/FounderBilling';
import FounderDocuments from '../pages/dashboards/founder/FounderDocuments';
import FounderLearningVideos from '../pages/dashboards/founder/FounderLearningVideos';
import FounderOriginalityCheck from '../pages/dashboards/founder/FounderOriginalityCheck';
import FounderProfileBilling from '../pages/dashboards/founder/FounderProfileBilling';
import SharedNotifications from '../pages/dashboards/founder/FounderNotifications';
import SharedInbox from '../pages/dashboards/founder/SharedInbox';

// Founder Investor Module Components
import FounderInvestorHub from '../pages/dashboards/founder/FounderInvestorHub';
import FounderInvestorMarketplace from '../pages/dashboards/founder/FounderInvestorMarketplace';
import FounderInvestmentRequests from '../pages/dashboards/founder/FounderInvestmentRequests';
import FounderInvestorMessages from '../pages/dashboards/founder/FounderInvestorMessages';
import FounderInvestorMeetings from '../pages/dashboards/founder/FounderInvestorMeetings';
import FounderFundingTransactions from '../pages/dashboards/founder/FounderFundingTransactions';
import FounderInvestorProfile from '../pages/dashboards/founder/FounderInvestorProfile';

import MentorDashboard from '../pages/dashboards/MentorDashboard';
import MentorReviews from '../pages/dashboards/mentor/MentorReviews';
import MentorSessions from '../pages/dashboards/mentor/MentorSessions';
import MentorFeedbackHub from '../pages/dashboards/mentor/MentorFeedbackHub';
import MentorEarnings from '../pages/dashboards/mentor/MentorEarnings';
import MentorProfile from '../pages/dashboards/mentor/MentorProfile';
import InvestorDashboard from '../pages/dashboards/InvestorDashboard';
import InvestorHub from '../pages/dashboards/investor/InvestorHub';
import InvestorMarketplace from '../pages/dashboards/investor/InvestorMarketplace';
import InvestorPortfolioHub from '../pages/dashboards/investor/InvestorPortfolioHub';
import InvestorSaved from '../pages/dashboards/investor/InvestorSaved';
import InvestorRequests from '../pages/dashboards/investor/InvestorRequests';
import InvestorMeetings from '../pages/dashboards/investor/InvestorMeetings';
import InvestorTransactions from '../pages/dashboards/investor/InvestorTransactions';
import InvestorAgreement from '../pages/dashboards/investor/InvestorAgreement';
import InvestorLearningCenter from '../pages/dashboards/investor/InvestorLearningCenter';
import InvestorProfileKYC from '../pages/dashboards/investor/InvestorProfileKYC';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import AdminUsers from '../pages/dashboards/admin/AdminUsers';
import AdminInviteLinks from '../pages/dashboards/admin/AdminInviteLinks';
import AdminStartups from '../pages/dashboards/admin/AdminStartups';
import AdminApprovalsHub from '../pages/dashboards/admin/AdminApprovalsHub';
import AdminInvestorApproval from '../pages/dashboards/admin/AdminInvestorApproval';
import AdminDocumentVerification from '../pages/dashboards/admin/AdminDocumentVerification';
import AdminSubPayments from '../pages/dashboards/admin/AdminSubPayments';
import AdminAnalytics from '../pages/dashboards/admin/AdminAnalytics';
import AdminPlatformSettings from '../pages/dashboards/admin/AdminPlatformSettings';
import AdminMentorEarnings from '../pages/dashboards/admin/AdminMentorEarnings';
import AdminInvestorFunding from '../pages/dashboards/admin/AdminInvestorFunding';
import AdminAgreementTemplates from '../pages/dashboards/admin/AdminAgreementTemplates';
import AdminProfile from '../pages/dashboards/admin/AdminProfile';

const PAGE_REGISTRY: Record<string, Record<string, React.ElementType>> = {
  founder: {
    '/dashboard/founder': FounderDashboard,
    '/dashboard/founder/startups': FounderStartups,
    '/dashboard/founder/ai-builder': FounderAIBuilder,
    '/dashboard/founder/ai_builder': FounderAIBuilder,
    '/dashboard/founder/originality-check': FounderOriginalityCheck,
    '/dashboard/founder/originality_check': FounderOriginalityCheck,
    '/dashboard/founder/plagiarism': FounderOriginalityCheck,
    '/dashboard/founder/mentors': FounderMentors,
    '/dashboard/founder/mentor-reviews': FounderMentorReviews,
    '/dashboard/founder/investors': FounderInvestorHub,
    '/dashboard/founder/investor-marketplace': FounderInvestorHub,
    '/dashboard/founder/investors/:investorId': FounderInvestorProfile,
    '/dashboard/founder/investment-requests': FounderInvestorHub,
    '/dashboard/founder/messages': FounderInvestorHub,
    '/dashboard/founder/meetings': FounderInvestorHub,
    '/dashboard/founder/agreement': FounderInvestorHub,
    '/dashboard/founder/funding-transactions': FounderInvestorHub,
    '/dashboard/founder/funding': FounderInvestorHub,

    '/founder/investors': FounderInvestorHub,
    '/founder/investor-marketplace': FounderInvestorHub,
    '/founder/investors/:investorId': FounderInvestorProfile,
    '/founder/investment-requests': FounderInvestorHub,
    '/founder/messages': FounderInvestorHub,
    '/founder/meetings': FounderInvestorHub,
    '/founder/agreement': FounderInvestorHub,
    '/founder/funding-transactions': FounderInvestorHub,
    '/founder/funding': FounderInvestorHub,
    '/dashboard/founder/billing': FounderBilling,
    '/dashboard/founder/documents': FounderDocuments,
    '/dashboard/founder/learning-videos': FounderLearningVideos,
    '/dashboard/founder/notifications': SharedNotifications,
    '/dashboard/founder/profile-billing': FounderProfileBilling,
  },
  mentor: {
    '/dashboard/mentor': MentorDashboard,
    '/dashboard/mentor/reviews': MentorReviews,
    '/dashboard/mentor/sessions': MentorSessions,
    '/dashboard/mentor/feedback-hub': MentorFeedbackHub,
    '/dashboard/mentor/earnings': MentorEarnings,
    '/dashboard/mentor/notifications': SharedNotifications,
    '/dashboard/mentor/inbox': SharedInbox,
    '/dashboard/mentor/profile': MentorProfile,
  },
  investor: {
    '/dashboard/investor': InvestorDashboard,
    '/dashboard/investor/marketplace': InvestorMarketplace,
    '/dashboard/investor/startup-ideas': InvestorSaved,
    '/dashboard/investor/portfolio-hub': InvestorPortfolioHub,
    '/dashboard/investor/requests': InvestorRequests,
    '/dashboard/investor/meetings': InvestorMeetings,
    '/dashboard/investor/agreement': InvestorAgreement,
    '/dashboard/investor/transactions': InvestorTransactions,
    '/dashboard/investor/learning-center': InvestorLearningCenter,
    '/dashboard/investor/messages': FounderInvestorMessages,
    '/dashboard/investor/inbox': SharedNotifications,
    '/dashboard/investor/notifications': SharedNotifications,
    '/dashboard/investor/profile-kyc': InvestorProfileKYC,
  },
  admin: {
    '/dashboard/admin': AdminDashboard,
    '/dashboard/admin/users': AdminUsers,
    '/dashboard/admin/investors': AdminInvestorApproval,
    '/dashboard/admin/investor-approval': AdminInvestorApproval,
    '/dashboard/admin/invite-links': AdminInviteLinks,
    '/dashboard/admin/startups': AdminStartups,
    '/dashboard/admin/approvals-hub': AdminApprovalsHub,
    '/dashboard/admin/document-verification': AdminDocumentVerification,
    '/dashboard/admin/sub-payments': AdminSubPayments,
    '/dashboard/admin/analytics': AdminAnalytics,
    '/dashboard/admin/platform-settings': AdminPlatformSettings,
    '/dashboard/admin/notifications': SharedNotifications,
    '/dashboard/admin/inbox': SharedInbox,
    '/dashboard/admin/mentor-earnings': AdminMentorEarnings,
    '/dashboard/admin/investor-funding': AdminInvestorFunding,
    '/dashboard/admin/templates': AdminAgreementTemplates,
    '/dashboard/admin/profile': AdminProfile,
  },
};

// ─── Types ──────────────────────────────────────────────────────
type NavItem = { name: string; icon: React.ElementType; path: string; plans?: string[] };
type SidebarSection = { items: NavItem[] };

// ─── Simplified Sidebar Config ──────────────────────────────────
const SIDEBAR_CONFIG: Record<string, SidebarSection[]> = {
  founder: [
    {
      items: [
        { name: 'Overview',                 icon: LayoutDashboard, path: '/dashboard/founder' },
        { name: 'My Startups',              icon: Rocket,          path: '/dashboard/founder/startups' },
        { name: 'AI Builder',               icon: Lightbulb,       path: '/dashboard/founder/ai-builder' },
        { name: 'Originality & Plagiarism', icon: ShieldCheck,     path: '/dashboard/founder/originality-check' },
        { name: 'Mentors',                  icon: GraduationCap,   path: '/dashboard/founder/mentors' },
        { name: 'Investor Marketplace',    icon: Building2,       path: '/dashboard/founder/investors' },
        { name: 'Subscription',             icon: CreditCard,      path: '/dashboard/founder/billing' },
        { name: 'Documents',                icon: File,            path: '/dashboard/founder/documents' },
        { name: 'Learning Videos',          icon: Film,            path: '/dashboard/founder/learning-videos' },
        { name: 'Notifications',            icon: Bell,            path: '/dashboard/founder/notifications' },
        { name: 'Profile',                  icon: UserCog,         path: '/dashboard/founder/profile-billing' },
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
        { name: 'Notifications',     icon: Bell,           path: '/dashboard/mentor/notifications' },
        { name: 'Profile',           icon: UserCog,        path: '/dashboard/mentor/profile' },
      ],
    },
  ],

  investor: [
    {
      items: [
        { name: 'Overview',           icon: LayoutDashboard, path: '/dashboard/investor' },
        { name: 'Startup Marketplace',icon: Building2,       path: '/dashboard/investor/marketplace' },
        { name: 'Startup Ideas',      icon: Rocket,          path: '/dashboard/investor/startup-ideas' },
        { name: 'Investment Requests',icon: Handshake,       path: '/dashboard/investor/requests' },
        { name: 'Learning Center',   icon: Film,             path: '/dashboard/investor/learning-center' },
        { name: 'Notifications',      icon: Bell,            path: '/dashboard/investor/notifications' },
        { name: 'Profile',            icon: ShieldCheck,     path: '/dashboard/investor/profile-kyc' },
      ],
    },
  ],

  admin: [
    {
      items: [
        { name: 'Overview',                icon: LayoutDashboard, path: '/dashboard/admin' },
        { name: 'Manage Users',            icon: Users,           path: '/dashboard/admin/users' },
        { name: 'Investor Management',     icon: TrendingUp,      path: '/dashboard/admin/investors' },
        { name: 'Invite Links',            icon: Link2,           path: '/dashboard/admin/invite-links' },
        { name: 'Startup Ideas',           icon: Rocket,          path: '/dashboard/admin/startups' },
        { name: 'Approvals',               icon: ShieldCheck,     path: '/dashboard/admin/approvals-hub' },
        { name: 'Doc Verification',        icon: File,            path: '/dashboard/admin/document-verification' },
        { name: 'Subscriptions & Payments',icon: CreditCard,      path: '/dashboard/admin/sub-payments' },
        { name: 'AI Analytics',            icon: BarChart2,       path: '/dashboard/admin/analytics' },
        { name: 'Mentor Earnings',         icon: IndianRupee,     path: '/dashboard/admin/mentor-earnings' },
        { name: 'Investor Funding',         icon: Wallet,          path: '/dashboard/admin/investor-funding' },
        { name: 'Agreement Templates',     icon: FileText,        path: '/dashboard/admin/templates' },
        { name: 'Notifications',           icon: Bell,            path: '/dashboard/admin/notifications' },
        { name: 'Profile',                 icon: UserCog,         path: '/dashboard/admin/profile' },
      ],
    },
  ],
};

// ─── Sidebar Inner ───────────────────────────────────────────────
const SidebarInner: React.FC<{
  isCollapsed: boolean;
  onLinkClick: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  userPlan: string;
  activePath: string;
}> = ({ isCollapsed, onLinkClick, onNavigate, onLogout, userName, userRole, userPlan, activePath }) => {
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24] truncate">{(!userRole || userRole.toLowerCase() === 'user' || userRole.toLowerCase() === 'founder') ? 'Founder' : userRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.items
              .filter((item) => !item.plans || item.plans.includes(userPlan))
              .map((item) => {
                const isItemActive = (itemPath: string, currentActive: string) => {
                  if (itemPath === `/dashboard/${userRole}`) return currentActive === itemPath;
                  const altPath = itemPath.startsWith('/dashboard/founder/')
                    ? itemPath.replace('/dashboard/founder/', '/founder/')
                    : itemPath.replace('/founder/', '/dashboard/founder/');
                  return (
                    currentActive === itemPath ||
                    currentActive === altPath ||
                    currentActive.startsWith(itemPath + '/') ||
                    currentActive.startsWith(altPath + '/')
                  );
                };

                const isActive = isItemActive(item.path, activePath);

                return (
                  <button
                    key={item.path}
                    onClick={() => { onNavigate(item.path); onLinkClick(); }}
                    title={isCollapsed ? item.name : undefined}
                    className={`relative group flex items-center gap-3 w-full px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#6C4CF1] text-white shadow-lg shadow-purple-900/40'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    {isActive && (
                      <span className="absolute -left-1 top-2.5 bottom-2.5 w-1.5 rounded-r-full bg-[#FBBF24] shadow-sm" />
                    )}
                    <item.icon
                      size={18}
                      className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#FBBF24]' : 'text-gray-400 group-hover:text-gray-200'}`}
                    />
                    {!isCollapsed && <span className="truncate text-[13px] font-bold tracking-wide">{item.name}</span>}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1f2e] border border-white/10 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                        {item.name}
                      </span>
                    )}
                  </button>
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
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const rawRole = (user?.role ?? '').toLowerCase();
  const role = (rawRole === 'user' || !rawRole) ? 'founder' : rawRole;

  // Preserve the founder subscription gate that ProtectedRoute applies on route change
  const resolveAllowed = (path: string): string => {
    return path;
  };

  // Derive active path and active component directly from React Router's location.pathname
  const currentPath = location.pathname;
  const normPath = currentPath.includes('/ai_builder') ? currentPath.replace('/ai_builder', '/ai-builder') : currentPath;
  const matchedPath = (PAGE_REGISTRY[role] ?? {})[currentPath]
    ? currentPath
    : ((PAGE_REGISTRY[role] ?? {})[normPath] ? normPath : '');

  const activePath = matchedPath ? resolveAllowed(matchedPath) : resolveAllowed(currentPath);

  const handleNavigate = (targetPath: string) => {
    const allowed = resolveAllowed(targetPath);
    navigate(allowed);
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const closeMobile = () => setIsMobileOpen(false);

  const sidebarProps = {
    isCollapsed,
    onLinkClick: closeMobile,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    userName: user?.fullName ?? '',
    userRole: role,
    userPlan: user?.plan ?? 'none',
    activePath,
  };

  const ActivePage = (PAGE_REGISTRY[role] ?? {})[activePath] as React.ElementType | undefined;

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
              <p className="text-xs text-gray-400 font-semibold capitalize">
                {(role === 'founder' ? 'Founder' : role)} Dashboard
              </p>
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
                    admin: '/dashboard/admin/profile',
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
            {ActivePage ? <ActivePage /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
