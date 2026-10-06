import React from 'react';
import InvestorProfile from './InvestorProfileDetails';
import InvestorKYC from './InvestorKYC';

const InvestorProfileKYC: React.FC = () => {
  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      {/* Profile contact details section with top header and Save Changes button */}
      <InvestorProfile />

      {/* KYC & Accreditation upload & documents section */}
      <InvestorKYC />
    </div>
  );
};

export default InvestorProfileKYC;
