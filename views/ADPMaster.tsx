import React, { useState } from 'react';
import { useADPMaster, useBulkImportADPMaster } from '../hooks/useADPData';
import { ADPMaster } from '../types';
import { Card, Button, Input, Modal, InfoTooltip, TableHeader, TableHead, TableRow, TableCell, Pagination } from '../components/UI';
import { Upload, Search, Loader2, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const ADPMasterView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const { data, isLoading } = useADPMaster({ page, size: 20, q: search });
  const bulkImport = useBulkImportADPMaster();

  const handleBulk = () => {
      if(bulkFile) {
          bulkImport.mutate(bulkFile, { 
              onSuccess: (response: any) => { 
                  const resultData = response.data || response;
                  setUploadResult(resultData);
                  setBulkFile(null);
                  toast.success("Upload processed"); 
              },
              onError: (err: any) => toast.error(err.message || "Upload failed")
          });
      }
  }

  const handleCloseBulk = () => {
    setIsBulkOpen(false);
    setBulkFile(null);
    setUploadResult(null);
    bulkImport.reset();
  };

  const handleDownloadSample = () => {
    const headers = "adpMakeId,makeEnDesc,makeArDesc,adpModelId,modelEnDesc,modelArDesc,adpTypeId,typeEnDesc,typeArDesc";
    const sample = "TOY-01,Toyota,تويوتا,LC-200,Land Cruiser,لاند كروزر,SUV,SUV,دفع رباعي";
    const csvContent = "\uFEFF" + headers + "\n" + sample;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "adp_master_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">ADP Master List</h1>
           <p className="text-slate-500">View source data from ADP.</p>
        </div>
        <Button variant="secondary" onClick={() => setIsBulkOpen(true)}><Upload size={18} /> Bulk Upload</Button>
      </div>

      <div className="max-w-sm relative">
        <Search className="absolute top-3 left-3 text-slate-400" size={18} />
        <Input label="" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10"/>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div> : (
        <>
            <div className="overflow-x-auto">
            <table className="w-full">
                <TableHeader>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                </TableHeader>
                <tbody>
                    {(data?.content || []).map((item: ADPMaster) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="font-medium text-slate-900">{item.makeEnDesc}</div>
                                <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{item.adpMakeId}</span>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-slate-900">{item.modelEnDesc}</div>
                                <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{item.adpModelId}</span>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-slate-900">{item.typeEnDesc}</div>
                                <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{item.adpTypeId}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </table>
            </div>
            <Pagination 
                currentPage={page} 
                totalPages={data?.totalPages || 1} 
                onPageChange={setPage} 
                totalItems={data?.totalElements || 0} 
            />
        </>
        )}
      </Card>

      <Modal isOpen={isBulkOpen} onClose={handleCloseBulk} title="Bulk Import" footer={
          !uploadResult ? (
             <><Button variant="secondary" onClick={handleCloseBulk}>Cancel</Button><Button onClick={handleBulk} isLoading={bulkImport.isPending}>Upload</Button></>
          ) : (
             <Button onClick={handleCloseBulk}>Close</Button>
          )
      }>
         {!uploadResult ? (
             <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded">
                     <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">Download Template</span>
                        <span className="text-xs text-slate-500">Get the expected CSV format.</span>
                     </div>
                     <Button variant="secondary" onClick={handleDownloadSample} className="h-8 text-xs gap-2">
                        <Download size={14}/> Download .csv
                     </Button>
                 </div>
                 
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                     <p className="text-sm font-medium text-slate-700 mb-2">Upload File</p>
                     <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files?.[0] || null)} />
                     <p className="text-xs text-slate-500 mt-2">Accepted file type: .csv</p>
                 </div>
             </div>
         ) : (
             <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${uploadResult.recordsSkipped > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                   <div className="flex items-center gap-2 mb-1">
                       {uploadResult.recordsSkipped > 0 ? <AlertTriangle size={18} className="text-amber-600"/> : <CheckCircle2 size={18} className="text-emerald-600"/>}
                       <h3 className="font-bold text-slate-800">Import Processed</h3>
                   </div>
                   <p className="text-sm text-slate-600">{uploadResult.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                      <span className="block text-2xl font-bold text-emerald-600">{uploadResult.recordsAdded || 0}</span>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Added</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                      <span className="block text-2xl font-bold text-amber-500">{uploadResult.recordsSkipped || 0}</span>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Skipped</span>
                   </div>
                </div>

                {uploadResult.skipReasons && uploadResult.skipReasons.length > 0 && (
                  <div className="mt-2">
                     <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Skip Details</h4>
                     <div className="max-h-40 overflow-y-auto bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-1">
                        {uploadResult.skipReasons.map((reason: string, i: number) => (
                           <div key={i} className="flex gap-2">
                              <span className="text-slate-400">•</span>
                              <span>{reason}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>
         )}
      </Modal>
    </div>
  );
};