import React, { useState } from 'react';
import { useSlashMasterData, downloadSlashMasterReport } from '../hooks/useVehicleData';
import { Card, Button, Input, Pagination, TableHeader, TableHead, TableRow, TableCell } from '../components/UI';
import { Download, Loader2, Search, Database, Tag, Car } from 'lucide-react';
import { toast } from 'sonner';

export const SlashMasterDataView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useSlashMasterData({ 
      page, 
      size: 20, 
      q: searchQuery 
  });

  const handleExport = async () => {
      setIsExporting(true);
      try {
          await downloadSlashMasterReport();
          toast.success("Master data exported successfully");
      } catch (e) {
          toast.error("Failed to export master data");
      } finally {
          setIsExporting(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">SlashData Master Data</h1>
           <p className="text-slate-500">Consolidated view of internal Makes, Models, and Types.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport} isLoading={isExporting}>
                <Download size={18} /> Export CSV
            </Button>
        </div>
      </div>

      <Card className="p-4 bg-white border border-slate-200">
        <div className="relative max-w-md">
             <Search className="absolute top-3 left-3 text-slate-400" size={18} />
             <Input 
               label="" 
               placeholder="Search Make or Model..." 
               value={searchQuery}
               onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
               className="pl-10"
             />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div> : (
        <>
            <div className="overflow-x-auto">
            <table className="w-full">
                <TableHeader>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Assigned Type</TableHead>
                </TableHeader>
                <tbody>
                    {(data?.content || []).length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-8 text-slate-500">No vehicles found.</td></tr>
                    ) : (data?.content || []).map((row: any) => (
                        <TableRow key={`${row.makeId}-${row.modelId}`}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Car size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{row.makeName}</div>
                                        <div className="text-xs text-slate-400 font-mono">{row.makeId}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium text-slate-900">{row.modelName}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-400 font-mono">{row.modelId}</span>
                                        {row.modelNameAr && <span className="text-xs text-slate-500 font-sans" dir="rtl">{row.modelNameAr}</span>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                                    <Tag size={12} className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">{row.typeName || '-'}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </table>
            </div>
            <Pagination currentPage={page} totalPages={data?.totalPages || 1} onPageChange={setPage} totalItems={data?.totalElements || 0} />
        </>
        )}
      </Card>
    </div>
  );
};
