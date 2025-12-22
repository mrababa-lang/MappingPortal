
import React, { useState, useEffect, useRef } from 'react';
import { useADPMappedVehicles, downloadMappedVehiclesReport } from '../hooks/useADPData';
import { Card, Button, Input, Pagination, TableHeader, TableHead, TableRow, TableCell, HighlightText, TableSkeleton } from '../components/UI';
import { Download, Loader2, Search, CheckCircle2, Calendar, X, Clock, History } from 'lucide-react';
import { toast } from 'sonner';
import { useVirtualizer } from '@tanstack/react-virtual';
import { HistoryModal } from '../components/HistoryModal';

export const ADPMappedVehiclesView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useADPMappedVehicles({ 
      page, 
      size: 100, // Large page size for virtualization
      q: debouncedSearch, 
      dateFrom, 
      dateTo,
      status: 'MAPPED'
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rows = data?.content || [];

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Increased for larger button
    overscan: 10
  });

  const handleExport = async () => {
      setIsExporting(true);
      try {
          await downloadMappedVehiclesReport(dateFrom, dateTo, 'MAPPED');
          toast.success("Report downloaded successfully");
      } catch (e) {
          toast.error("Failed to download report");
      } finally {
          setIsExporting(false);
      }
  };

  const handleOpenHistory = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsHistoryOpen(true);
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">ADP Mapped Vehicles</h1>
           <p className="text-slate-500">View and export all successfully mapped ADP records.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport} isLoading={isExporting}>
                <Download size={18} /> Export CSV
            </Button>
        </div>
      </div>

      <Card className="p-4 bg-white border border-slate-200 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
           <div className="relative flex-1">
             <Search className="absolute top-3 left-3 text-slate-400" size={18} />
             <Input label="" placeholder="Search Make/Model..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
           </div>
           <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              <Input type="date" label="" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-36" />
              <span className="text-slate-400">-</span>
              <Input type="date" label="" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-36" />
           </div>
           {(dateFrom || dateTo || searchQuery) && (
             <Button variant="ghost" onClick={() => { setDateFrom(''); setDateTo(''); setSearchQuery(''); setDebouncedSearch(''); }} className="text-red-500"><X size={16}/></Button>
           )}
        </div>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {isLoading ? <TableSkeleton rows={10} cols={4} /> : (
        <>
            <div ref={parentRef} className="flex-1 overflow-auto">
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                <table className="w-full">
                  <TableHeader>
                      <TableHead className="w-[30%]">ADP Source</TableHead>
                      <TableHead className="w-[30%]">SlashData Mapping</TableHead>
                      <TableHead className="w-[15%]">Status</TableHead>
                      <TableHead className="w-[25%] text-right pr-10">Actions</TableHead>
                  </TableHeader>
                  <tbody>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index];
                      return (
                        <tr
                          key={virtualRow.key}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`
                          }}
                          className="border-b border-slate-100 hover:bg-slate-50 flex items-center px-4"
                        >
                          <td className="w-[30%] px-6 py-2">
                              <div className="truncate">
                                  <div className="font-medium text-slate-900"><HighlightText text={`${row.makeEnDesc} ${row.modelEnDesc}`} highlight={debouncedSearch} /></div>
                                  <span className="text-[10px] text-slate-400 font-mono">{row.adpMakeId} / {row.adpModelId}</span>
                              </div>
                          </td>
                          <td className="w-[30%] px-6 py-2">
                              <div className="truncate font-medium text-indigo-700">{row.sdMakeName}</div>
                              <div className="text-[11px] text-slate-600 truncate">{row.sdModelName || '-'}</div>
                          </td>
                          <td className="w-[15%] px-6 py-2">
                              <span className="text-emerald-600 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                <CheckCircle2 size={12}/> Mapped
                              </span>
                          </td>
                          <td className="w-[25%] px-6 py-2 text-right pr-10">
                              <div className="flex justify-end items-center gap-4">
                                  <div className="hidden xl:flex flex-col items-end">
                                      <span className="text-[10px] text-slate-400 uppercase font-bold">Synchronized</span>
                                      <span className="text-[11px] text-slate-600">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}</span>
                                  </div>
                                  <Button 
                                      variant="secondary" 
                                      className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-2" 
                                      onClick={(e) => handleOpenHistory(e, row)}
                                  >
                                      <History size={12} /> Audit Log
                                  </Button>
                              </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination currentPage={page} totalPages={data?.totalPages || 1} onPageChange={setPage} totalItems={data?.totalElements || 0} />
        </>
        )}
      </Card>
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} adpId={selectedItem?.adpId || selectedItem?.id} />
    </div>
  );
};
