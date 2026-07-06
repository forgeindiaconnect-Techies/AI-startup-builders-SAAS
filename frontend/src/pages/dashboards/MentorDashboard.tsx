import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileText, DollarSign, Star, CheckCircle } from 'lucide-react';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Newest');
  const [startups, setStartups] = React.useState<any[]>([]);

  React.useEffect(() => {
    const keys = Object.keys(localStorage);
    const locals: any[] = [];
    keys.forEach(key => {
      if (key.startsWith('startup_')) {
        try {
          locals.push(JSON.parse(localStorage.getItem(key) || ''));
        } catch (e) {}
      }
    });
    locals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setStartups(locals);
  }, []);

  const stats = [
    { title: 'Pending Reviews', value: '4', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-100' },
    { title: 'Completed Reviews', value: '128', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'Average Rating', value: '4.9', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { title: 'Total Earnings', value: '$3,840', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-100' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Portal</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}. You have 4 startups waiting for review.</p>
        </div>
        <button 
          onClick={() => window.alert('Redirecting to Earnings page to withdraw funds...')}
          className="px-4 py-2 bg-[#1F2937] text-white font-medium rounded-lg"
        >
          Withdraw Earnings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Assigned Startups for Review</h2>
          <div className="flex gap-2">
            <button onClick={() => setFilter('Newest')} className={`px-3 py-1 text-sm ${filter === 'Newest' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'} rounded-md font-medium`}>Newest</button>
            <button onClick={() => setFilter('Urgent')} className={`px-3 py-1 text-sm ${filter === 'Urgent' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'} rounded-md font-medium`}>Urgent</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Startup Name</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Date</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {startups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No startups assigned yet.
                  </td>
                </tr>
              ) : (
                startups.slice(0, 5).map((startup, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{startup.startupName}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{startup.startupIdea}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{startup.aiGenerated?.ideaAnalysis?.businessModel || 'Tech'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${startup.status === 'generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {startup.status === 'generated' ? (startup.aiGenerated?.aiReport?.investmentReadinessScore || '85') + '/100' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(startup.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => navigate(`/dashboard/mentor/reviews?startupId=${startup.startupId}`)} className="text-sm font-medium text-[#5B21B6] hover:text-[#7C3AED]">Start Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
