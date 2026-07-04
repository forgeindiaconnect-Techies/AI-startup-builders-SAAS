import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, CreditCard, Activity, Cpu } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Active Users', value: '1,248', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Monthly Revenue', value: '$42,500', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'AI API Calls (MTD)', value: '84.2k', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'System Health', value: '99.9%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Manage users, monitor AI usage, and view platform analytics.</p>
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mentor Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Pending Mentor Approvals</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">3 Pending</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
              <div>
                <p className="font-bold text-gray-900">Michael Chang</p>
                <p className="text-sm text-gray-500">Ex-Product at Google | 2 Exits</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-sm font-medium transition-colors">Approve</button>
                <button className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors">Reject</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Subscription Upgrades</h2>
            <button className="text-sm font-medium text-[#5B21B6] hover:underline">View all</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">S</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Sarah Jenkins</p>
                  <p className="text-xs text-gray-500">Upgraded to Premium (Annual)</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-600">+$468.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
