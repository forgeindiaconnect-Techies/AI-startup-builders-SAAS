import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { BillingProvider } from './context/BillingContext';
import { FundingProvider } from './context/FundingContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import PendingApproval from './pages/auth/PendingApproval';
import BlogPage from './pages/info/BlogPage';
import HelpCenterPage from './pages/info/HelpCenterPage';
import CommunityPage from './pages/info/CommunityPage';
import PitchDeckGuidePage from './pages/info/PitchDeckGuidePage';
import PrivacyPolicyPage from './pages/info/PrivacyPolicyPage';
import TermsOfServicePage from './pages/info/TermsOfServicePage';
import CookiePolicyPage from './pages/info/CookiePolicyPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// ── Founder Pages ────────────────────────────────────────────────
import FounderDashboard from './pages/dashboards/FounderDashboard';
import FounderStartups  from './pages/dashboards/founder/FounderStartups';
import FounderRoadmap   from './pages/dashboards/founder/FounderRoadmap';
import FounderTasks     from './pages/dashboards/founder/FounderTasks';
import FounderDocuments from './pages/dashboards/founder/FounderDocuments';
import FounderTeam      from './pages/dashboards/founder/FounderTeam';
import FounderMentors   from './pages/dashboards/founder/FounderMentors';
import FounderFunding   from './pages/dashboards/founder/FounderFunding';
import FounderIdeaGenerator from './pages/dashboards/founder/FounderIdeaGenerator';
import FounderBusinessPlan from './pages/dashboards/founder/FounderBusinessPlan';
import FounderPitchDeck from './pages/dashboards/founder/FounderPitchDeck';
import FounderMarketResearch from './pages/dashboards/founder/FounderMarketResearch';
import FounderReports   from './pages/dashboards/founder/FounderReports';
import FounderAIChat    from './pages/dashboards/founder/FounderAIChat';
import FounderProfile   from './pages/dashboards/founder/FounderProfile';
import FounderBilling   from './pages/dashboards/founder/FounderBilling';
import FounderLearningVideos from './pages/dashboards/founder/FounderLearningVideos';

// ── Mentor Pages ─────────────────────────────────────────────────
import MentorDashboard from './pages/dashboards/MentorDashboard';
import MentorReviews   from './pages/dashboards/mentor/MentorReviews';
import MentorEarnings  from './pages/dashboards/mentor/MentorEarnings';
import MentorSessions  from './pages/dashboards/mentor/MentorSessions';
import MentorAvailability from './pages/dashboards/mentor/MentorAvailability';
import MentorFeedback  from './pages/dashboards/mentor/MentorFeedback';
import MentorRatings   from './pages/dashboards/mentor/MentorRatings';
import MentorPayout    from './pages/dashboards/mentor/MentorPayout';
import MentorProfile   from './pages/dashboards/mentor/MentorProfile';

// ── Investor Pages ───────────────────────────────────────────────
import InvestorDashboard   from './pages/dashboards/InvestorDashboard';
import InvestorMarketplace from './pages/dashboards/investor/InvestorMarketplace';
import InvestorPortfolio   from './pages/dashboards/investor/InvestorPortfolio';
import InvestorSaved       from './pages/dashboards/investor/InvestorSaved';
import InvestorRequests    from './pages/dashboards/investor/InvestorRequests';
import InvestorDueDiligence from './pages/dashboards/investor/InvestorDueDiligence';
import InvestorMeetings    from './pages/dashboards/investor/InvestorMeetings';
import InvestorTransactions from './pages/dashboards/investor/InvestorTransactions';
import InvestorReports     from './pages/dashboards/investor/InvestorReports';
import InvestorProfileDetails from './pages/dashboards/investor/InvestorProfileDetails';
import InvestorKYC         from './pages/dashboards/investor/InvestorKYC';
import InvestorLearningCenter from './pages/dashboards/investor/InvestorLearningCenter';

// ── Admin Pages ──────────────────────────────────────────────────
import AdminDashboard        from './pages/dashboards/AdminDashboard';
import AdminUsers            from './pages/dashboards/admin/AdminUsers';
import AdminStartups         from './pages/dashboards/admin/AdminStartups';
import AdminMentorApproval   from './pages/dashboards/admin/AdminMentorApproval';
import AdminInvestorApproval from './pages/dashboards/admin/AdminInvestorApproval';
import AdminRoles            from './pages/dashboards/admin/AdminRoles';
import AdminSubscriptions    from './pages/dashboards/admin/AdminSubscriptions';
import AdminSubManagement    from './pages/dashboards/admin/AdminSubManagement';
import AdminPayments         from './pages/dashboards/admin/AdminPayments';
import AdminAnalytics        from './pages/dashboards/admin/AdminAnalytics';
import AdminAISettings       from './pages/dashboards/admin/AdminAISettings';
import AdminLogs             from './pages/dashboards/admin/AdminLogs';
import AdminReports          from './pages/dashboards/admin/AdminReports';
import AdminBilling          from './pages/dashboards/admin/AdminBilling';
import AdminSettings         from './pages/dashboards/admin/AdminSettings';
import AdminManageVideos     from './pages/dashboards/admin/AdminManageVideos';
import AdminDocumentVerification from './pages/dashboards/admin/AdminDocumentVerification';

import SharedMessages      from './pages/dashboards/founder/FounderMessages';
import SharedNotifications from './pages/dashboards/founder/FounderNotifications';
import SharedHelp          from './pages/dashboards/founder/FounderHelp';
import AdminProfile        from './pages/dashboards/founder/FounderProfile';
// ── Founder Combined Pages ──────────────────────────────────────────
import FounderAIBuilder        from './pages/dashboards/founder/FounderAIBuilder';
import FounderRoadmapTasks     from './pages/dashboards/founder/FounderRoadmapTasks';
import FounderProfileBilling   from './pages/dashboards/founder/FounderProfileBilling';
import SharedInbox             from './pages/dashboards/founder/SharedInbox';

// ── Mentor Combined Pages ───────────────────────────────────────────
import MentorFeedbackHub       from './pages/dashboards/mentor/MentorFeedbackHub';

// ── Investor Combined Pages ─────────────────────────────────────────
import InvestorPortfolioHub    from './pages/dashboards/investor/InvestorPortfolioHub';
import InvestorProfileKYC      from './pages/dashboards/investor/InvestorProfileKYC';

// ── Admin Combined Pages ────────────────────────────────────────────
import AdminApprovalsHub       from './pages/dashboards/admin/AdminApprovalsHub';
import AdminSubPayments        from './pages/dashboards/admin/AdminSubPayments';
import AdminPlatformSettings   from './pages/dashboards/admin/AdminPlatformSettings';


function App() {
  return (
    <AuthProvider>
      <BillingProvider>
        <FundingProvider>
          <ChatProvider>
            <Router>
            <Routes>
              {/* Public */}
              <Route path="/"      element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/pitch-deck-guide" element={<PitchDeckGuidePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/" replace />} />

                  {/* ───────────── FOUNDER ───────────── */}
                  <Route path="founder" element={<ProtectedRoute allowedRoles={['founder']} />}>
                    <Route index                  element={<FounderDashboard />} />
                    <Route path="startups"        element={<FounderStartups />} />
                    <Route path="ai-builder"      element={<FounderAIBuilder />} />
                    <Route path="roadmap-tasks"   element={<FounderRoadmapTasks />} />
                    <Route path="mentors"         element={<FounderMentors />} />
                    <Route path="funding"         element={<FounderFunding />} />
                    <Route path="documents"           element={<FounderDocuments />} />
                    <Route path="learning-videos"    element={<FounderLearningVideos />} />
                    <Route path="inbox"               element={<SharedInbox />} />
                    <Route path="profile-billing" element={<FounderProfileBilling />} />
                    {/* Legacy / Direct paths */}
                    <Route path="roadmap"         element={<FounderRoadmap />} />
                    <Route path="tasks"           element={<FounderTasks />} />
                    <Route path="team"            element={<FounderTeam />} />
                    <Route path="idea-generator"  element={<FounderIdeaGenerator />} />
                    <Route path="business-plan"   element={<FounderBusinessPlan />} />
                    <Route path="pitch-deck"      element={<FounderPitchDeck />} />
                    <Route path="market-research" element={<FounderMarketResearch />} />
                    <Route path="reports"         element={<FounderReports />} />
                    <Route path="ai-chat"         element={<FounderAIChat />} />
                    <Route path="messages"        element={<SharedMessages />} />
                    <Route path="notifications"   element={<SharedNotifications />} />
                    <Route path="profile"         element={<FounderProfile />} />
                    <Route path="billing"         element={<FounderBilling />} />
                    <Route path="help"            element={<SharedHelp />} />
                  </Route>

                  {/* ───────────── ADMIN ───────────── */}
                  <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route index                     element={<AdminDashboard />} />
                    <Route path="users"              element={<AdminUsers />} />
                    <Route path="startups"           element={<AdminStartups />} />
                    <Route path="manage-videos"     element={<AdminManageVideos />} />
                    <Route path="approvals-hub"      element={<AdminApprovalsHub />} />
                    <Route path="sub-payments"       element={<AdminSubPayments />} />
                    <Route path="analytics"          element={<AdminAnalytics />} />
                    <Route path="platform-settings"  element={<AdminPlatformSettings />} />
                    <Route path="document-verification" element={<AdminDocumentVerification />} />
                    <Route path="inbox"              element={<SharedInbox />} />
                    {/* Legacy / Direct paths */}
                    <Route path="mentor-approval"    element={<AdminMentorApproval />} />
                    <Route path="investor-approval"  element={<AdminInvestorApproval />} />
                    <Route path="roles"              element={<AdminRoles />} />
                    <Route path="subscriptions"      element={<AdminSubscriptions />} />
                    <Route path="sub-management"     element={<AdminSubManagement />} />
                    <Route path="payments"           element={<AdminPayments />} />
                    <Route path="ai-settings"        element={<AdminAISettings />} />
                    <Route path="logs"               element={<AdminLogs />} />
                    <Route path="reports"            element={<AdminReports />} />
                    <Route path="billing"            element={<AdminBilling />} />
                    <Route path="settings"           element={<AdminSettings />} />
                    <Route path="messages"           element={<SharedMessages />} />
                    <Route path="notifications"      element={<SharedNotifications />} />
                    <Route path="profile"            element={<AdminProfile />} />
                    <Route path="help"              element={<SharedHelp />} />
                  </Route>

                  {/* ───────────── MENTOR ───────────── */}
                  <Route path="mentor" element={<ProtectedRoute allowedRoles={['mentor']} />}>
                    <Route index                element={<MentorDashboard />} />
                    <Route path="reviews"       element={<MentorReviews />} />
                    <Route path="sessions"      element={<MentorSessions />} />
                    <Route path="feedback-hub"  element={<MentorFeedbackHub />} />
                    <Route path="earnings"      element={<MentorEarnings />} />
                    <Route path="inbox"         element={<SharedInbox />} />
                    <Route path="profile"       element={<MentorProfile />} />
                    {/* Legacy / Direct paths */}
                    <Route path="availability"  element={<MentorAvailability />} />
                    <Route path="feedback"      element={<MentorFeedback />} />
                    <Route path="ratings"       element={<MentorRatings />} />
                    <Route path="payout"        element={<MentorPayout />} />
                    <Route path="messages"      element={<SharedMessages />} />
                    <Route path="notifications" element={<SharedNotifications />} />
                    <Route path="help"          element={<SharedHelp />} />
                  </Route>

                  {/* ───────────── INVESTOR ───────────── */}
                  <Route path="investor" element={<ProtectedRoute allowedRoles={['investor']} />}>
                    <Route index                  element={<InvestorDashboard />} />
                    <Route path="marketplace"     element={<InvestorMarketplace />} />
                    <Route path="portfolio-hub"   element={<InvestorPortfolioHub />} />
                    <Route path="requests"        element={<InvestorRequests />} />
                    <Route path="due-diligence"   element={<InvestorDueDiligence />} />
                    <Route path="meetings"        element={<InvestorMeetings />} />
                    <Route path="transactions"    element={<InvestorTransactions />} />
                    <Route path="learning-center" element={<InvestorLearningCenter />} />
                    <Route path="inbox"           element={<SharedInbox />} />
                    <Route path="profile-kyc"     element={<InvestorProfileKYC />} />
                    {/* Legacy / Direct paths */}
                    <Route path="saved"           element={<InvestorSaved />} />
                    <Route path="portfolio"       element={<InvestorPortfolio />} />
                    <Route path="reports"         element={<InvestorReports />} />
                    <Route path="profile"         element={<InvestorProfileDetails />} />
                    <Route path="kyc"             element={<InvestorKYC />} />
                    <Route path="messages"        element={<SharedMessages />} />
                    <Route path="notifications"   element={<SharedNotifications />} />
                    <Route path="help"            element={<SharedHelp />} />
                  </Route>

                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          </ChatProvider>
        </FundingProvider>
      </BillingProvider>
    </AuthProvider>
  );
}

export default App;
