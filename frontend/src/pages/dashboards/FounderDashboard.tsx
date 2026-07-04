import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lightbulb, TrendingUp, DollarSign, Clock } from 'lucide-react';

const FounderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Startups', value: '3', icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'AI Reports Generated', value: '12', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Pending Offers', value: '1', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'Mentor Reviews', value: '2', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your startups today.</p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Active Startups</h2>
              <button onClick={() => navigate('/dashboard/founder/startups')} className="text-sm font-medium text-[#5B21B6] hover:underline">View all</button>
            </div>
            
            <div className="space-y-4">
              {/* Dummy Startup Card */}
              <div className="p-5 border border-gray-100 rounded-xl hover:border-[#5B21B6]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">EcoPackage Hub</h3>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Approved</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Sustainable packaging marketplace connecting green manufacturers with D2C e-commerce brands.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm font-medium">
                    <span className="text-[#5B21B6]">AI Score: 92/100</span>
                  </div>
                  <button onClick={() => navigate('/dashboard/founder/ai-builder')} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors">Manage</button>
                </div>
              </div>

              {/* Dummy Startup Card 2 */}
              <div className="p-5 border border-gray-100 rounded-xl hover:border-[#5B21B6]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">FinFlow AI</h3>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">In Review</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Automated financial forecasting for SaaS companies using LLM-based data extraction.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-500">AI Score: 85/100</span>
                  </div>
                  <button onClick={() => navigate('/dashboard/founder/ai-builder')} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors">Manage</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h2 className="text-lg font-bold mb-2 relative z-10">Generate New Idea</h2>
            <p className="text-sm text-indigo-100 mb-6 relative z-10">Got a new concept? Let our AI analyze it instantly.</p>
            <button onClick={() => navigate('/dashboard/founder/ai-builder')} className="w-full py-3 bg-white text-[#5B21B6] font-bold rounded-xl shadow-md relative z-10 hover:bg-indigo-50 transition-colors">
              New Startup Idea
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Investment Offer Received</p>
                  <p className="text-xs text-gray-500">David Chen offered $250k for 10% on EcoPackage</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Mentor Review Completed</p>
                  <p className="text-xs text-gray-500">Elena reviewed FinFlow AI</p>
                  <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderDashboard;
