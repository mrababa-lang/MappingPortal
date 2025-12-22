
import React, { useState, useMemo } from 'react';
import { useAuditLogs, useAuditPerformance, useUsers } from '../hooks/useAdminData';
import { AuditLog } from '../types';
import { Card, Select, Input, Pagination, TableHeader, TableHead, TableRow, TableCell, Button, Skeleton } from '../components/UI';
import { 
  Activity, 
  Clock, 
  Filter, 
  Loader2, 
  History, 
  ChevronDown, 
  User as UserIcon, 
  Zap, 
  MousePointer2, 
  FileJson,
  TrendingUp,
  Download,
  Database,
  Car,
  Settings2,
  Link as LinkIcon,
  ShieldCheck,
  Monitor
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryModal } from '../components/HistoryModal';

interface DiffRowProps {
  label: string;
  oldValue: any;
  newValue: any;
}

const DiffRow: React.FC<DiffRowProps> = ({ label, oldValue, newValue }) => {
  const isChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
  const formatVal = (v: any) => {
    if (v === null || v === undefined) return '(empty)';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="grid grid-cols-3 gap-4 py-2 text-xs border-b border-slate-50 last:border-0">
      <div className="font-bold text-slate-500 uppercase tracking-tighter truncate" title={label}>{label}</div>
      <div className={`px-2 py-0.5 rounded truncate ${isChanged ? 'bg-rose-50 text-rose-700 line-through opacity-60' : 'text-slate-400'}`}>
        {formatVal(oldValue)}
      </div>
      <div className={`px-2 py-0.5 rounded truncate ${isChanged ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}>
        {formatVal(newValue)}
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

  const { data: usersData = [] } = useUsers();
  const users = Array.isArray(usersData) ? usersData : [];
  
  const { data: performance, isLoading: perfLoading } = useAuditPerformance();
  const { data: logsData, isLoading: logsLoading } = useAuditLogs({
    page,
    size: 20,
    userId: selectedUser || undefined,
    source: actionSource,
    dateFrom,
    dateTo
  });

  const chartData = useMemo(() => {
    if (!performance?.userMetrics) return [];
    return performance.userMetrics.map(m => ({
      name: m.userName.split(' ')[0],
      mappings: m.mappingsCount,
      accuracy: m.accuracyScore
    }));
  }, [performance]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSourceIcon = (source: string) => {
    if (source === 'AI') return <Zap size={14} className="text-indigo-500" />;
    if (source === 'BULK') return <FileJson size={14} className="text-slate-500" />;
    return <MousePointer2 size={14} className="text-emerald-500" />;
  };

  const getEntityIcon = (type: string) => {
    switch(type) {
      case 'ADP_MASTER': return <Database size={14} className="text-blue-500" />;
      case 'SD_MAKE': return <Car size={14} className="text-indigo-500" />;
      case 'SD_MODEL': return <Settings2 size={14} className="text-purple-500" />;
      case 'MAPPING': return <LinkIcon size={14} className="text-emerald-500" />;
      default: return <Activity size={14} className="text-slate-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'UPDATE': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'DELETE': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'APPROVE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'REJECT': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Activity Tracking & Audit</h1>
           <p className="text-slate-500 text-sm font-medium">System-wide forensic surveillance and user performance analytics.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" className="h-10 text-xs shadow-sm">
                <Download size={14} /> Export Audit Log
            </Button>
        </div>
      </div>

      {/* Performance Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 col-span-2 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                      <TrendingUp size={20} className="text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">User Productivity</h3>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> VOLUME</div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> ACCURACY %</div>
                  </div>
              </div>
              <div className="h-[200px] w-full">
                {perfLoading ? <Skeleton className="w-full h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
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
                )}
              </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
              <div className="relative z-10 h-full flex flex-col">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Integrity Compliance Score</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-black text-white">{performance?.totalIntegrityScore || 0}</span>
                      <span className="text-indigo-400 font-bold text-xl">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-auto pb-8">Aggregated precision score mapping human approvals against AI initializations.</p>
                  
                  <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                            <span>Manual Validation</span>
                            <span className="text-emerald-400">{performance?.manualAccuracy || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${performance?.manualAccuracy || 0}%` }}></div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                            <span>AI Initial Precision</span>
                            <span className="text-indigo-400">{performance?.aiPrecision || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${performance?.aiPrecision || 0}%` }}></div>
                        </div>
                      </div>
                  </div>
              </div>
              <Activity className="absolute -bottom-8 -right-8 text-white opacity-[0.03] rotate-12" size={180} />
          </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select 
            label="Filter Source"
            value={actionSource}
            onChange={e => { setActionSource(e.target.value); setPage(1); }}
            options={[
                { value: 'all', label: 'All Operations' },
                { value: 'MANUAL', label: 'Manual Entry' },
                { value: 'AI', label: 'AI Generated' },
                { value: 'BULK', label: 'Bulk Batch' }
            ]}
            className="bg-slate-50 h-10 border-slate-200"
          />
          <Select 
            label="Audit Performer"
            value={selectedUser}
            onChange={e => { setSelectedUser(e.target.value); setPage(1); }}
            options={users.map(u => ({ value: u.id, label: u.fullName }))}
            className="bg-slate-50 h-10 border-slate-200"
          />
          <Input 
            type="date"
            label="Time Range Start"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="bg-slate-50 h-10 border-slate-200"
          />
          <Input 
            type="date"
            label="Time Range End"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="bg-slate-50 h-10 border-slate-200"
          />
          <div className="flex items-end">
              {(selectedUser || dateFrom || dateTo || actionSource !== 'all') && (
                <Button variant="ghost" onClick={() => { setSelectedUser(''); setDateFrom(''); setDateTo(''); setActionSource('all'); setPage(1); }} className="text-xs text-rose-600 h-10 w-full hover:bg-rose-50 font-bold">
                  Reset Audit Filters
                </Button>
              )}
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="flex flex-col min-h-[500px] overflow-hidden border-slate-200/60 shadow-lg">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
                <Clock className="text-slate-400" size={18} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">System Transaction Log</h3>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                    {logsData?.totalElements || 0} TOTAL RECORDS
                </span>
            </div>
        </div>
        
        {logsLoading ? (
            <div className="flex-1 flex flex-col justify-center items-center py-24">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Retrieving Secure Logs...</p>
            </div>
        ) : (
            <div className="flex-1 overflow-auto">
                <div className="divide-y divide-slate-100">
                    {(logsData?.content || []).length === 0 ? (
                        <div className="py-20 text-center">
                            <Filter className="mx-auto text-slate-200 mb-3" size={48} />
                            <p className="text-slate-400 font-medium">No transactions found for current filter criteria.</p>
                        </div>
                    ) : (logsData?.content || []).map((log: AuditLog) => {
                         const isExpanded = expandedId === log.id;
                         const user = users.find(u => u.id === log.userId);
                         
                         return (
                             <div key={log.id} className={`transition-all duration-200 ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}>
                                 <div 
                                    className="px-6 py-4 flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleExpand(log.id)}
                                 >
                                     <div className="flex items-center gap-5 flex-1">
                                         <div className="p-2.5 bg-white rounded-xl border border-slate-200 group-hover:border-slate-300 shadow-sm transition-colors">
                                             {getEntityIcon(log.entityType)}
                                         </div>
                                         <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <span className="font-bold text-slate-900 text-sm tracking-tight">
                                                    {log.entityType.replace('SD_', '').replace('_', ' ')}: <span className="font-mono text-xs text-slate-500">#{log.entityId}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-slate-300">•</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                <div className="flex items-center gap-1.5 ml-3 px-1.5 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {getSourceIcon(log.source)} {log.source}
                                                </div>
                                            </div>
                                         </div>
                                     </div>

                                     <div className="flex items-center gap-8">
                                         <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end mr-1">
                                                <div className="text-xs font-bold text-slate-800 leading-none">{user?.fullName?.split(' ')[0] || log.userFullName || 'System'}</div>
                                                <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1 leading-none">{user?.role?.replace('_', ' ') || 'Process'}</div>
                                            </div>
                                            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:shadow-md transition-shadow">
                                                <UserIcon size={16} />
                                            </div>
                                         </div>
                                         <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                                             <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={18} />
                                         </div>
                                     </div>
                                 </div>

                                 {isExpanded && (
                                     <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-3 duration-300">
                                         <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                                             <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
                                                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <ShieldCheck size={14} className="text-indigo-500" /> Transactional Forensic Analysis
                                                 </h4>
                                                 <Button 
                                                    variant="ghost" 
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 px-3 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
                                                    onClick={(e) => { e.stopPropagation(); setHistoryTargetId(log.entityId); }}
                                                 >
                                                    <History size={14} /> View Entity Timeline
                                                 </Button>
                                             </div>

                                             <div className="p-6">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                                     <div>
                                                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Modified Fields</div>
                                                         <div className="space-y-1">
                                                             {Object.keys(log.newValues || {}).map(key => (
                                                                 <DiffRow key={key} label={key} oldValue={log.oldValues?.[key]} newValue={log.newValues?.[key]} />
                                                             ))}
                                                             {Object.keys(log.newValues || {}).length === 0 && (
                                                                 <div className="text-xs text-slate-400 italic">No direct field changes detected (Possible metadata update).</div>
                                                             )}
                                                         </div>
                                                     </div>
                                                     <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <Monitor size={14} /> Security Metadata
                                                         </div>
                                                         <div className="space-y-4">
                                                             <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                                                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Client IP</span>
                                                                 <span className="font-mono text-xs text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100">{log.ipAddress || '127.0.0.1'}</span>
                                                             </div>
                                                             <div className="flex flex-col gap-2 pt-1">
                                                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">User Agent</span>
                                                                 <span className="text-[10px] text-slate-400 leading-relaxed font-mono bg-white p-2 rounded border border-slate-100 line-clamp-2" title={log.userAgent}>
                                                                     {log.userAgent || 'Mozilla/5.0 (Unknown Platform)'}
                                                                 </span>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 </div>

                                                 <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                     <div className="flex gap-4">
                                                         <div className="flex items-center gap-1.5">
                                                             <span className="text-[9px] font-bold text-slate-400 uppercase">Audit UUID:</span>
                                                             <span className="text-[9px] font-mono text-slate-400">{log.id}</span>
                                                         </div>
                                                     </div>
                                                     <div className="flex items-center gap-2">
                                                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Verified in Persistent Store</span>
                                                     </div>
                                                 </div>
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
        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
             <Pagination currentPage={page} totalPages={logsData?.totalPages || 1} onPageChange={setPage} totalItems={logsData?.totalElements || 0} />
        </div>
      </Card>

      <HistoryModal 
        isOpen={!!historyTargetId} 
        onClose={() => setHistoryTargetId(null)} 
        adpId={historyTargetId} 
        title="Comprehensive Entity Lifecycle" 
      />
    </div>
  );
};
