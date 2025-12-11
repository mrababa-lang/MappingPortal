import React from 'react';
import { DataService } from '../services/storageService';
import { Card } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Car, Tags, Settings2, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const makes = DataService.getMakes();
  const models = DataService.getModels();
  const types = DataService.getTypes();

  // Prepare general chart data
  const chartData = makes.map(make => ({
    name: make.name,
    models: models.filter(m => m.makeId === make.id).length
  }));

  const stats = [
    { label: 'Total Makes', value: makes.length, icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Models', value: models.length, icon: Settings2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Vehicle Types', value: types.length, icon: Tags, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Avg Models/Make', value: (models.length / (makes.length || 1)).toFixed(1), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6 flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Models Distribution by Make</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="models" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0F172A' : '#E11D48'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Insights</h3>
          <div className="space-y-4">
            {chartData.sort((a,b) => b.models - a.models).slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="text-sm text-slate-500 font-mono">{item.models} models</span>
              </div>
            ))}
            {chartData.length === 0 && <p className="text-slate-400 text-sm">No data available.</p>}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                <p className="font-medium mb-1">AI Assistant Ready</p>
                <p className="text-xs opacity-80">Use Gemini to generate descriptions and suggest models in the edit screens.</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};