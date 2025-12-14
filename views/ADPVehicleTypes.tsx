import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { ADPTypeMapping, VehicleType } from '../types';
import { Card, Button, Modal, TableHeader, TableHead, TableRow, TableCell, Pagination, SearchableSelect, Input } from '../components/UI';
import { Link, CheckCircle2, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

interface UniqueADPType {
  adpTypeId: string;
  typeEnDesc: string;
  typeArDesc: string;
  sdTypeId?: string; // If mapped
}

export const ADPVehicleTypesView: React.FC = () => {
  const [uniqueTypes, setUniqueTypes] = useState<UniqueADPType[]>([]);
  const [sdTypes, setSdTypes] = useState<VehicleType[]>([]);
  const [typeMappings, setTypeMappings] = useState<ADPTypeMapping[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdpType, setSelectedAdpType] = useState<UniqueADPType | null>(null);
  const [selectedSdTypeId, setSelectedSdTypeId] = useState<string>('');

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    refreshData();
  }, []);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const refreshData = () => {
    const masterData = DataService.getADPMaster();
    const mappings = DataService.getADPTypeMappings();
    const types = DataService.getTypes();

    setSdTypes(types);
    setTypeMappings(mappings);

    // Extract unique types from ADP Master
    const uniqueMap = new Map<string, UniqueADPType>();
    masterData.forEach(item => {
      if (!uniqueMap.has(item.adpTypeId)) {
        const mappedSdId = mappings.find(m => m.adpTypeId === item.adpTypeId)?.sdTypeId;
        uniqueMap.set(item.adpTypeId, {
          adpTypeId: item.adpTypeId,
          typeEnDesc: item.typeEnDesc,
          typeArDesc: item.typeArDesc,
          sdTypeId: mappedSdId
        });
      }
    });

    setUniqueTypes(Array.from(uniqueMap.values()));
  };

  const handleOpenModal = (item: UniqueADPType) => {
    setSelectedAdpType(item);
    setSelectedSdTypeId(item.sdTypeId || '');
    setIsModalOpen(true);
  };

  const handleSaveMapping = () => {
    if (!selectedAdpType || !selectedSdTypeId) return;

    // Save the Global Type Mapping
    const newMapping: ADPTypeMapping = {
      adpTypeId: selectedAdpType.adpTypeId,
      sdTypeId: selectedSdTypeId,
      updatedAt: new Date().toISOString()
    };

    // Update or Add to local mapping list
    const updatedMappings = [...typeMappings.filter(m => m.adpTypeId !== selectedAdpType.adpTypeId), newMapping];
    DataService.saveADPTypeMappings(updatedMappings);

    setIsModalOpen(false);
    refreshData();
    toast.success("Type mapping saved successfully.");
  };

  // Filter Logic
  const filteredTypes = uniqueTypes.filter(item => {
     const query = searchQuery.toLowerCase();
     return item.adpTypeId.toLowerCase().includes(query) ||
            item.typeEnDesc.toLowerCase().includes(query) ||
            (item.typeArDesc && item.typeArDesc.includes(searchQuery));
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTypes.length / ITEMS_PER_PAGE);
  const paginatedTypes = filteredTypes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">ADP Vehicle Types</h1>
           <p className="text-slate-500">Map unique ADP Vehicle Types to Internal Classification.</p>
        </div>
        <Button onClick={refreshData} variant="secondary">
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <div className="max-w-sm relative">
        <Search className="absolute top-3 left-3 text-slate-400" size={18} />
        <Input 
          label="" 
          placeholder="Search by ID or description..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>ADP Type ID</TableHead>
              <TableHead>English Description</TableHead>
              <TableHead>Arabic Description</TableHead>
              <TableHead>SlashData Mapping</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {paginatedTypes.map(item => {
                const mappedSdType = sdTypes.find(t => t.id === item.sdTypeId);
                
                return (
                  <TableRow key={item.adpTypeId} onClick={() => handleOpenModal(item)}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {item.adpTypeId}
                      </span>
                    </TableCell>
                    <TableCell><span className="font-medium text-slate-900">{item.typeEnDesc}</span></TableCell>
                    <TableCell><span className="text-slate-600 font-sans" dir="rtl">{item.typeArDesc}</span></TableCell>
                    <TableCell>
                      {mappedSdType ? (
                        <div className="flex items-center gap-2 text-indigo-700 font-medium">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          {mappedSdType.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Mapped</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {mappedSdType ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                           Mapped
                        </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                           <AlertTriangle size={12} /> Pending
                         </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" className="p-2 h-auto text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}>
                        <Link size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredTypes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredTypes.length}
        />
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Map ADP Vehicle Type"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMapping} disabled={!selectedSdTypeId}>Save Mapping</Button>
          </>
        }
      >
        <div className="space-y-6">
          {selectedAdpType && (
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">ADP Source Data</div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="text-xs text-slate-500 block">Type ID</span>
                     <span className="font-mono font-medium text-slate-900">{selectedAdpType.adpTypeId}</span>
                   </div>
                   <div>
                     <span className="text-xs text-slate-500 block">English Desc</span>
                     <span className="font-medium text-slate-900">{selectedAdpType.typeEnDesc}</span>
                   </div>
                   <div className="col-span-2">
                     <span className="text-xs text-slate-500 block">Arabic Desc</span>
                     <span className="font-medium text-slate-900" dir="rtl">{selectedAdpType.typeArDesc}</span>
                   </div>
                </div>
             </div>
          )}

          <div className="space-y-2">
            <SearchableSelect 
               label="Map to Internal Vehicle Type"
               value={selectedSdTypeId}
               onChange={value => setSelectedSdTypeId(value)}
               options={sdTypes.map(t => ({ value: t.id, label: t.name }))}
               placeholder="Search for type..."
            />
            <p className="text-xs text-slate-500 mt-2">
               Select the standard vehicle type that corresponds to this ADP entry.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};