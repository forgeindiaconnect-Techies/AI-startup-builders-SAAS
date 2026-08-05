import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, FileText } from 'lucide-react';
import { getStartups, getMentorPaymentSettings } from '../../../utils/localStorageHelper';

const MentorEarnings: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedReviewsCount, setCompletedReviewsCount] = useState(0);
  const [availablePayout, setAvailablePayout] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const settings = getMentorPaymentSettings();
      const startups = await getStartups();
      const storedSessions = JSON.parse(localStorage.getItem('video_sessions') || '[]');

    const mentorSharePercent = (settings.mentorShare || 80) / 100;
    const newTransactions: any[] = [];
    let earnings = 0;
    let reviewsCount = 0;

    startups.forEach(startup => {
      if (startup.mentorReview) {
        reviewsCount++;
        const isDetailed = true; // Default to detailed for reviews in MVP
        const amount = (isDetailed ? settings.detailedReviewAmount : settings.basicReviewAmount) * mentorSharePercent;
        earnings += amount;
        
        newTransactions.push({
          id: `rev_${startup.startupId || Math.random()}`,
          date: startup.createdAt ? new Date(startup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          type: 'Review',
          description: `${startup.startupName} - Detailed Review`,
          status: 'Completed',
          amount: amount,
          typeColor: 'bg-indigo-100 text-indigo-700'
        });
      }
    });

    storedSessions.forEach((session: any) => {
       const is60 = session.duration?.includes('60');
       const is45 = session.duration?.includes('45');
       const durationAmount = is60 ? settings.call60MinAmount : is45 ? settings.call45MinAmount : settings.call30MinAmount;
       const amount = durationAmount * mentorSharePercent;
       earnings += amount;

       newTransactions.push({
         id: `call_${session.id || Math.random()}`,
         date: session.time?.split(',')[0] || 'Recent', // e.g. "Tomorrow, 11:00 AM" -> "Tomorrow"
         type: '1:1 Call',
         description: `${session.startup || 'Startup'} - ${session.duration || '30 min'} Session`,
         status: 'Completed',
         amount: amount,
         typeColor: 'bg-purple-100 text-purple-700'
       });
    });

    newTransactions.push({
       id: 'payout_1',
       date: 'Oct 18, 2026',
       type: 'Payout',
       description: 'Bank Transfer (**** 4291)',
       status: 'Processed',
       amount: -1200,
       typeColor: 'bg-gray-100 text-gray-700'
    });

    setTransactions(newTransactions);
    setTotalEarnings(earnings);
    setCompletedReviewsCount(reviewsCount);
    
    // Available payout = total earnings minus the processed payout
    setAvailablePayout(Math.max(0, earnings - 1200));
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
        <p className="text-gray-500 mt-1">Track your income from startup reviews and 1:1 consultation calls (Per Task Model).</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IndianRupee size={80} />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-2">Available for Payout</p>
          <p className="text-4xl font-bold mb-4">₹{availablePayout.toFixed(2)}</p>
          <button 
            onClick={() => window.alert(`Processing withdrawal of ₹${availablePayout.toFixed(2)} to your bank account...`)}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
          >
            Withdraw Funds
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600"><TrendingUp size={24} /></div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={16} className="mr-1" /> Active
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
          <p className="text-sm font-medium text-gray-500">Gross Earnings (All Time)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600"><FileText size={24} /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedReviewsCount}</p>
          <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button 
            onClick={() => window.alert('Opening date picker filter...')}
            className="text-sm font-medium text-[#5B21B6] hover:text-[#7C3AED] transition-colors flex items-center"
          >
            <Calendar size={16} className="mr-2" />
            Filter by Date
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.typeColor}`}>{t.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center w-fit">
                      {t.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${t.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MentorEarnings;
