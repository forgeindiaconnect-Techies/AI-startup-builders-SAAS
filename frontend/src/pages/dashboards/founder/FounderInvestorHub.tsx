import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FounderInvestorMarketplace from './FounderInvestorMarketplace';
import FounderInvestmentRequests from './FounderInvestmentRequests';
import FounderInvestorMessages from './FounderInvestorMessages';
import FounderInvestorMeetings from './FounderInvestorMeetings';
import FounderFundingTransactions from './FounderFundingTransactions';

const FounderInvestorHub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Normalize path matching to select active component
  const currentPath = location.pathname;

  let ActiveComponent = FounderInvestorMarketplace;
  if (currentPath.includes('/investment-requests')) {
    ActiveComponent = FounderInvestmentRequests;
  } else if (currentPath.includes('/messages')) {
    ActiveComponent = FounderInvestorMessages;
  } else if (currentPath.includes('/meetings')) {
    ActiveComponent = FounderInvestorMeetings;
  } else if (currentPath.includes('/funding-transactions') || currentPath.includes('/funding')) {
    ActiveComponent = FounderFundingTransactions;
  }

  return (
    <div className="space-y-6">
      <ActiveComponent />
    </div>
  );
};

export default FounderInvestorHub;
