import React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Clock, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const isMentor = role === 'mentor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/10 blur-[100px]"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FBBF24]/10 blur-[100px]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-2xl shadow-lg">
            <Clock size={40} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[#1F2937]">
          {isMentor ? 'Mentor Profile Submitted' : 'Pending Approval'}
        </h2>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          {isMentor
            ? 'Your mentor profile has been submitted. Please wait for admin approval.'
            : 'Your account has been created and is awaiting admin verification.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <ShieldCheck size={36} className="text-amber-500" />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#1F2937] text-lg mb-1">Almost there!</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {isMentor
                  ? 'Your mentor profile is now under review. An admin will review your expertise and approve your account. You\'ll receive a notification once approved.'
                  : 'An admin will review your account shortly. You\'ll receive a notification once your account is approved and you can log in.'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-left">
              <Mail size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <span className="font-bold block mb-1">What happens next?</span>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  {isMentor ? (
                    <>
                      <li>Admin reviews your mentor profile</li>
                      <li>Your expertise and experience are verified</li>
                      <li>Once approved, you can log in and start mentoring</li>
                    </>
                  ) : (
                    <>
                      <li>Admin reviews your application</li>
                      <li>You get approved or notified if more info is needed</li>
                      <li>Once approved, you can log in and access your dashboard</li>
                    </>
                  )}
                </ol>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Link to="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#5B21B6] hover:bg-[#7C3AED] transition-colors shadow-sm"
              >
                Go to Login <ArrowRight size={16} />
              </Link>
              <button onClick={() => navigate('/')}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
