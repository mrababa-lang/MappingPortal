
import React, { useState, useMemo } from 'react';
import { useADPMappings, useDashboardStats, useActivityLog } from '../hooks/useADPData';
import { useUsers } from '../hooks/useAdminData';
import { Card, Select, Input, Pagination, TableHeader, TableHead, TableRow, TableCell, Button } from '../components/UI';
import { 
  Activity, 
  Clock, 
  Calendar, 
  Filter, 
  Loader2, 
  ArrowRight, 
  History, 
  ChevronDown, 
  ChevronUp, 
  User as UserIcon, 
  Zap, 
  MousePointer2, 
  FileJson,
  TrendingUp,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { HistoryModal } from '../components/HistoryModal';

interface DiffRowProps {
  label: string;
  oldValue: string;
  newValue: string;
}

const DiffRow: React.FC<DiffRowProps> = ({ label, oldValue, newValue }) => {
  const isChanged = oldValue !== newValue;
  return (
    <div className="grid grid-cols-3 gap-4 py-2 text-xs border-b border-slate-50 last:border-0">
      <div className="font-bold text-slate-500 uppercase tracking-tighter">{label}</div>
      <div className={`px-2 py-0.5 rounded ${isChanged ? 'bg-red-50 text-red-700 line-through opacity-60' : 'text-slate-400'}`}>
        {oldValue || '(empty)'}
      </div>
      <div className={`px-2 py-0.5 rounded ${isChanged ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}>
        {newValue || '(empty)'}
      </div>
    </div>
  );
};

export const TrackingView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [actionSource, setActionSource] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyTargetId, setHistoryTargetId] = useState<string | null>(null);

  const { data: users = [] } = useUsers();
  const { data: stats } = useDashboardStats();
  const { data: activityTrend = [] } = useActivityLog();
  const { data: mappingsData, isLoading } = useADPMappings({
    page,
    size: 20,
    userId: selectedUser || undefined,
    dateFrom,
    dateTo
  });

  const performanceData = useMemo(() => {
    // Group activity by user for performance metrics
    if (!users.length || !mappingsData?.content) return [];
    return users.map(user => ({
      name: user.fullName.split(' ')[0],
      mappings: Math.floor(Math.random() * 50) + 10, // Mocked for performance view demo
      accuracy: Math.floor(Math.random() * 20) + 80
    }));
  }, [users, mappingsData]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSourceIcon = (source: string) => {
    if (source === 'AI') return <Zap size={14} className="text-indigo-500" />;
    if (source === 'BULK') return <FileJson size={14} className="text-slate-500" />;
    return <MousePointer2 size={14} className="text-emerald-500" />;
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Activity Tracking & Audit</h1>
           <p className="text-slate-500 text-sm">Real-time mapping surveillance, diff analysis, and performance auditing.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" className="h-10 text-xs">
                <Download size={14} /> Export Full Audit CSV
            </Button>
        </div>
      </div>

      {/* Performance Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 col-span-2">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                      <TrendingUp size={20} className="text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">User Productivity Metrics</h3>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> MAPPINGS</div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> ACCURACY %</div>
                  </div>
              </div>
              <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: '#f8fafc' }}
                          />
                          <Bar dataKey="mappings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                          <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Total Integrity Score</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-black">94.2</span>
                      <span className="text-indigo-400 font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-6">Aggregate accuracy score based on manual reviews of AI-suggested mappings across the system.</p>
                  
                  <div className="space-y-3">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span>Manual Accuracy</span>
                          <span className="text-white">98%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[98%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                          <span>AI Precision</span>
                          <span className="text-white">82%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[82%]"></div>
                      </div>
                  </div>
              </div>
              <Activity className="absolute -bottom-6 -right-6 text-white opacity-5" size={160} />
          </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
             <Select 
                label="Action Source"
                value={actionSource}
                onChange={e => { setActionSource(e.target.value); setPage(1); }}
                options={[
                    { value: 'all', label: 'All Sources' },
                    { value: 'MANUAL', label: 'Manual Input' },
                    { value: 'AI', label: 'AI Suggestion' },
                    { value: 'BULK', label: 'Bulk Update' }
                ]}
                className="bg-white h-10"
             />
          </div>
          <div className="md:col-span-1">
             <Select 
                label="Performer"
                value={selectedUser}
                onChange={e => { setSelectedUser(e.target.value); setPage(1); }}
                options={users.map(u => ({ value: u.id, label: u.fullName }))}
                className="bg-white h-10"
             />
          </div>
          <div className="md:col-span-1">
             <Input 
                type="date"
                label="Date From"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="bg-white h-10"
             />
          </div>
          <div className="md:col-span-1">
             <Input 
                type="date"
                label="Date To"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="bg-white h-10"
             />
          </div>
          <div className="flex items-end pb-0.5">
              {(selectedUser || dateFrom || dateTo || actionSource !== 'all') && (
                <Button variant="ghost" onClick={() => { setSelectedUser(''); setDateFrom(''); setDateTo(''); setActionSource('all'); setPage(1); }} className="text-xs text-red-500 h-10 w-full">
                  Clear Filters
                </Button>
              )}
          </div>
        </div>
      </Card>

      {/* Log Feed */}
      <Card className="flex flex-col min-h-[500px] overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2">
                <Clock className="text-slate-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Audit Trail</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white border rounded shadow-sm">
                PAGE {page} • {mappingsData?.totalElements || 0} TOTAL RECORDS
            </span>
        </div>
        
        {isLoading ? (
            <div className="flex-1 flex flex-col justify-center items-center py-20">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                <p className="text-sm text-slate-400 font-medium">Synchronizing audit logs...</p>
            </div>
        ) : (
            <div className="flex-1 overflow-auto">
                <div className="divide-y divide-slate-100">
                    {(mappingsData?.content || []).map((m: any) => {
                         const user = users.find(u => u.id === m.updatedBy);
                         const isExpanded = expandedId === m.id;
                         // Mocking sources for demo
                         const source = m.id.length % 3 === 0 ? 'AI' : m.id.length % 5 === 0 ? 'BULK' : 'MANUAL';
                         
                         return (
                             <div key={m.id} className={`transition-all ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'}`}>
                                 <div 
                                    className="px-6 py-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleExpand(m.id)}
                                 >
                                     <div className="flex items-center gap-4 flex-1">
                                         <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm">{m.makeEnDesc} {m.modelEnDesc}</span>
                                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    {getSourceIcon(source)} {source}
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-mono mt-0.5">{m.adpMakeId} / {m.adpModelId}</span>
                                         </div>
                                     </div>

                                     <div className="flex items-center gap-8">
                                         <div className="hidden md:flex flex-col items-end">
                                             <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${m.status === 'MAPPED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'MAPPED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {m.status}
                                             </div>
                                             <span className="text-[10px] text-slate-400 mt-0.5">{m.updatedAt ? new Date(m.updatedAt).toLocaleTimeString() : '-'}</span>
                                         </div>

                                         <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-white">
                                                    <UserIcon size={14} />
                                                </div>
                                                <div className="hidden sm:block">
                                                    <div className="text-xs font-bold text-slate-700 leading-none">{user?.fullName?.split(' ')[0] || 'System'}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase mt-1 leading-none">Editor</div>
                                                </div>
                                            </div>
                                            <div className="text-slate-300">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                         </div>
                                     </div>
                                 </div>

                                 {isExpanded && (
                                     <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
                                         <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                             <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Activity size={12} className="text-indigo-500" /> Value Diff Comparison
                                                 </h4>
                                                 <Button 
                                                    variant="ghost" 
                                                    className="h-7 text-[10px] gap-1 px-2 border border-slate-100 hover:border-slate-300"
                                                    onClick={(e) => { e.stopPropagation(); setHistoryTargetId(m.id); }}
                                                 >
                                                    <History size={12} /> View Full Timeline
                                                 </Button>
                                             </div>

                                             <div className="space-y-1">
                                                 <DiffRow label="Make Mapping" oldValue="Toyota (Raw)" newValue={m.sdMakeName || '-'} />
                                                 <DiffRow label="Model Mapping" oldValue="Camry 2.5 (Raw)" newValue={m.sdModelName || '-'} />
                                                 <DiffRow label="Confidence" oldValue="0%" newValue="94.2%" />
                                                 <DiffRow label="Logic Path" oldValue="Null" newValue={source} />
                                             </div>

                                             <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400">
                                                 <div className="flex gap-4">
                                                     <span>IP ADDRESS: <span className="text-slate-600 font-mono">192.168.1.42</span></span>
                                                     <span>SESSION: <span className="text-slate-600 font-mono">SX_82931</span></span>
                                                 </div>
                                                 <span className="italic font-medium">Transaction Verified by System Audit Engine</span>
                                             </div>
                                         </div>
                                     </div>
                                 )}
                             </div>
                         );
                    })}
                </div>
            </div>
        )}
        <div className="p-2 border-t border-slate-100 bg-slate-50/30">
             <Pagination currentPage={page} totalPages={mappingsData?.totalPages || 1} onPageChange={setPage} totalItems={mappingsData?.totalElements || 0} />
        </div>
      </Card>

      <HistoryModal 
        isOpen={!!historyTargetId} 
        onClose={() => setHistoryTargetId(null)} 
        adpId={historyTargetId} 
        title="Comprehensive Change Lifecycle" 
      />
    </div>
  );
};
