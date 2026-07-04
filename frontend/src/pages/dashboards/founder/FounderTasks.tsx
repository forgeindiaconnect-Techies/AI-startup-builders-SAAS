import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, AlertCircle, MoreVertical } from 'lucide-react';

type Task = { id: number; title: string; priority: 'High' | 'Medium' | 'Low'; due: string; status: 'todo' | 'in-progress' | 'done' };

const initialTasks: Task[] = [
  { id: 1, title: 'Write executive summary for pitch deck', priority: 'High', due: 'Jul 5', status: 'in-progress' },
  { id: 2, title: 'Set up product analytics dashboard', priority: 'High', due: 'Jul 7', status: 'todo' },
  { id: 3, title: 'Conduct 5 user interviews this week', priority: 'Medium', due: 'Jul 8', status: 'in-progress' },
  { id: 4, title: 'Finalise landing page copy', priority: 'Medium', due: 'Jul 6', status: 'done' },
  { id: 5, title: 'Apply to Y Combinator batch', priority: 'High', due: 'Jul 10', status: 'todo' },
  { id: 6, title: 'Register company entity', priority: 'Low', due: 'Jul 15', status: 'done' },
  { id: 7, title: 'Integrate Stripe payment gateway', priority: 'High', due: 'Jul 12', status: 'todo' },
  { id: 8, title: 'Publish first blog post', priority: 'Low', due: 'Jul 20', status: 'todo' },
];

const priorityColors = { High: 'bg-red-50 text-red-600 border-red-100', Medium: 'bg-yellow-50 text-yellow-600 border-yellow-100', Low: 'bg-green-50 text-green-600 border-green-100' };

const colConfig = [
  { key: 'todo',        label: 'To Do',      icon: AlertCircle,   color: 'text-gray-500',   bg: 'bg-gray-50',    border: 'border-gray-200' },
  { key: 'in-progress', label: 'In Progress', icon: Clock,         color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  { key: 'done',        label: 'Done',        icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
];

const FounderTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const move = (id: number, to: Task['status']) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: to } : t));
  };

  const handleNewTask = () => {
    const title = window.prompt("Enter new task title:");
    if (title) {
      setTasks([...tasks, { 
        id: Date.now(), 
        title, 
        priority: 'Medium', 
        due: 'TBD', 
        status: 'todo' 
      }]);
    }
  };

  const handleTaskOptions = (id: number) => {
    const confirmDelete = window.confirm("Delete this task?");
    if (confirmDelete) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks / Milestones</h1>
          <p className="text-gray-500 mt-1">Manage your startup tasks and track progress across all milestones.</p>
        </div>
        <button onClick={handleNewTask} className="flex items-center px-4 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow text-sm transition-colors">
          <Plus size={16} className="mr-2" /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {colConfig.map(col => {
          const count = tasks.filter(t => t.status === col.key).length;
          return (
            <div key={col.key} className={`${col.bg} border ${col.border} rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-extrabold ${col.color}`}>{count}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{col.label}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {colConfig.map(col => (
          <div key={col.key} className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-gray-200`}>
              <col.icon size={16} className={col.color} />
              <h3 className="font-bold text-gray-700 text-sm">{col.label}</h3>
              <span className="ml-auto bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === col.key).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{task.title}</p>
                    <button onClick={() => handleTaskOptions(task.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><MoreVertical size={14} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">Due {task.due}</span>
                  </div>
                  {/* Move buttons */}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-50">
                    {col.key !== 'todo' && (
                      <button onClick={() => move(task.id, col.key === 'done' ? 'in-progress' : 'todo')}
                        className="flex-1 text-[11px] py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors">
                        ← Back
                      </button>
                    )}
                    {col.key !== 'done' && (
                      <button onClick={() => move(task.id, col.key === 'todo' ? 'in-progress' : 'done')}
                        className="flex-1 text-[11px] py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#5B21B6] font-medium transition-colors">
                        Forward →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.key).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No tasks here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FounderTasks;
