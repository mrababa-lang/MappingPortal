import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { ADPMapping, Model, ADPMaster, Make } from '../types';
import { Card, Button, Select, Modal, TableHeader, TableHead, TableRow, TableCell, Input } from '../components/UI';
import { Edit2, Link, Unlink, AlertCircle, CheckCircle2, Filter, X, Download } from 'lucide-react';

export const ADPMappingView: React.FC = () => {
  const [adpList, setAdpList] = useState<ADPMaster[]>([]);
  const [mappings, setMappings] = useState<ADPMapping[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdpItem, setEditingAdpItem] = useState<ADPMaster | null>(null);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Form State
  const [selectedMakeId, setSelectedMakeId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAdpList(DataService.getADPMaster());
    setMappings(DataService.getADPMappings());
    setModels(DataService.getModels());
    setMakes(DataService.getMakes());
  };

  const getMappingForAdp = (adpId: string) => {
    return mappings.find(m => m.adpId === adpId);
  };

  const getSDModelDetails = (mapping?: ADPMapping) => {
    if (!mapping) return { makeName: '-', modelName: '-' };
    const model = models.find(m => m.id === mapping.modelId);
    if (!model) return { makeName: 'Unknown', modelName: 'Unknown' };
    const make = makes.find(m => m.id === model.makeId);
    return {
      makeName: make ? make.name : 'Unknown',
      modelName: model.name
    };
  };

  const handleOpenModal = (adpItem: ADPMaster) => {
    setEditingAdpItem(adpItem);
    const mapping = getMappingForAdp(adpItem.id);
    
    if (mapping) {
      const model = models.find(m => m.id === mapping.modelId);
      if (model) {
        setSelectedMakeId(model.makeId);
        setSelectedModelId(model.id);
      } else {
        setSelectedMakeId('');
        setSelectedModelId('');
      }
    } else {
      setSelectedMakeId('');
      setSelectedModelId('');
    }
    
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingAdpItem || !selectedModelId) return;

    const existingMappingIndex = mappings.findIndex(m => m.adpId === editingAdpItem.id);
    let newMappings = [...mappings];
    
    // Simulate current user (Admin)
    const currentUser = '1';
    const timestamp = new Date().toISOString();

    if (existingMappingIndex >= 0) {
      // Update
      newMappings[existingMappingIndex] = {
        ...newMappings[existingMappingIndex],
        modelId: selectedModelId,
        updatedAt: timestamp,
        updatedBy: currentUser,
        reviewedAt: undefined, // Reset review on update
        reviewedBy: undefined
      };
    } else {
      // Create
      newMappings.push({
        id: Date.now().toString(),
        adpId: editingAdpItem.id,
        modelId: selectedModelId,
        updatedAt: timestamp,
        updatedBy: currentUser
      });
    }

    DataService.saveADPMappings(newMappings);
    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteMapping = (adpId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remove this mapping?")) {
      const filtered = mappings.filter(m => m.adpId !== adpId);
      DataService.saveADPMappings(filtered);
      refreshData();
    }
  };

  // Filter models based on selected make
  const availableModels = models.filter(m => m.makeId === selectedMakeId);

  // Filter ADP List based on Date Range of their Mappings
  const filteredAdpList = adpList.filter(item => {
    if (!dateFrom && !dateTo) return true;

    const mapping = getMappingForAdp(item.id);
    
    // If filtering by date, hide items that aren't mapped
    if (!mapping || !mapping.updatedAt) return false;

    const mapDate = new Date(mapping.updatedAt);
    
    if (dateFrom) {
      const start = new Date(dateFrom);
      start.setHours(0,0,0,0);
      if (mapDate < start) return false;
    }
    
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23,59,59,999);
      if (mapDate > end) return false;
    }

    return true;
  });

  const handleExport = () => {
    const csvRows = [];
    
    // Define Headers
    const headers = [
      'ADP Make ID', 'ADP Make En', 'ADP Make Ar',
      'ADP Model ID', 'ADP Model En', 'ADP Model Ar',
      'ADP Type ID', 'ADP Type En', 'ADP Type Ar',
      'SD Make', 'SD Model', 'Status', 
      'Updated By', 'Updated At', 'Reviewed By', 'Reviewed At'
    ];
    csvRows.push(headers.join(','));

    // Generate Data Rows based on filtered list
    filteredAdpList.forEach(adpItem => {
      const mapping = getMappingForAdp(adpItem.id);
      const { makeName, modelName } = getSDModelDetails(mapping);
      const isMapped = !!mapping;
      
      const updatedByName = mapping?.updatedBy ? DataService.getUserName(mapping.updatedBy) : '';
      const reviewedByName = mapping?.reviewedBy ? DataService.getUserName(mapping.reviewedBy) : '';
      
      const row = [
        adpItem.adpMakeId, adpItem.makeEnDesc, adpItem.makeArDesc,
        adpItem.adpModelId, adpItem.modelEnDesc, adpItem.modelArDesc,
        adpItem.adpTypeId, adpItem.typeEnDesc, adpItem.typeArDesc,
        makeName, modelName, isMapped ? 'Mapped' : 'Unmapped',
        updatedByName, mapping?.updatedAt || '', reviewedByName, mapping?.reviewedAt || ''
      ].map(val => `"${String(val || '').replace(/"/g, '""')}"`); // Escape quotes and wrap in quotes

      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adp_mapping_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">ADP Mapping</h1>
           <p className="text-slate-500">Map ADP Master Data to SlashData Vehicle Models.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          {/* Date Filter Toolbar */}
          <div className="flex items-end gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 px-2 text-slate-400 text-sm">
               <Filter size={16} />
               <span className="font-medium text-slate-600 hidden sm:inline">Updated:</span>
             </div>
             <div className="w-32 sm:w-40">
                <Input 
                  label="" 
                  type="date" 
                  className="py-1.5 text-xs" 
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
             </div>
             <span className="text-slate-400 pb-2">-</span>
             <div className="w-32 sm:w-40">
                <Input 
                  label="" 
                  type="date" 
                  className="py-1.5 text-xs"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
             </div>
             {(dateFrom || dateTo) && (
               <button onClick={() => {setDateFrom(''); setDateTo('');}} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                 <X size={16} />
               </button>
             )}
          </div>

          <Button variant="secondary" onClick={handleExport} className="h-[52px] sm:h-[58px] self-stretch flex items-center shadow-sm">
            <Download size={18} />
            Export
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>Make ID (ADP)</TableHead>
              <TableHead>Model ID (ADP)</TableHead>
              <TableHead>Vehicle Desc (ADP)</TableHead>
              <TableHead>SD Make</TableHead>
              <TableHead>SD Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {filteredAdpList.map(adpItem => {
                const mapping = getMappingForAdp(adpItem.id);
                const { makeName, modelName } = getSDModelDetails(mapping);
                const isMapped = !!mapping;

                return (
                  <TableRow key={adpItem.id} onClick={() => handleOpenModal(adpItem)}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {adpItem.adpMakeId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {adpItem.adpModelId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{adpItem.makeEnDesc} - {adpItem.modelEnDesc}</span>
                        <span className="text-xs text-slate-500 font-sans" dir="rtl">{adpItem.makeArDesc} - {adpItem.modelArDesc}</span>
                        <span className="text-xs text-slate-400 mt-1">{adpItem.typeEnDesc}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${isMapped ? 'text-slate-900' : 'text-slate-300'}`}>
                        {makeName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${isMapped ? 'text-slate-900' : 'text-slate-300'}`}>
                        {modelName}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isMapped ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 size={12} /> Mapped
                          </span>
                          {mapping?.updatedAt && (
                             <span className="text-[10px] text-slate-400">
                               {new Date(mapping.updatedAt).toLocaleDateString()}
                             </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <AlertCircle size={12} /> Unmapped
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" className="p-2 h-auto text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); handleOpenModal(adpItem); }}>
                          <Edit2 size={16} />
                        </Button>
                        {isMapped && (
                          <Button variant="ghost" className="p-2 h-auto text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => handleDeleteMapping(adpItem.id, e)}>
                            <Unlink size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredAdpList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingAdpItem ? 'Edit Mapping' : 'Map Vehicle'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!selectedModelId}>Save Mapping</Button>
          </>
        }
      >
        <div className="space-y-6">
          {editingAdpItem && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Target ADP Vehicle</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Make</span>
                  <span className="font-medium text-slate-900">{editingAdpItem.makeEnDesc} <span className="text-slate-400 font-mono">({editingAdpItem.adpMakeId})</span></span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Model</span>
                  <span className="font-medium text-slate-900">{editingAdpItem.modelEnDesc} <span className="text-slate-400 font-mono">({editingAdpItem.adpModelId})</span></span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
             <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Link size={16} className="text-indigo-500" />
                  Map to SlashData Vehicle
                </h4>
                
                <Select 
                  label="Select SD Make"
                  value={selectedMakeId}
                  onChange={e => {
                    setSelectedMakeId(e.target.value);
                    setSelectedModelId(''); // Reset model when make changes
                  }}
                  options={makes.map(m => ({ value: m.id, label: m.name }))}
                />
                
                <Select 
                  label="Select SD Model"
                  value={selectedModelId}
                  onChange={e => setSelectedModelId(e.target.value)}
                  options={availableModels.map(m => ({ value: m.id, label: m.name }))}
                  disabled={!selectedMakeId}
                />
                
                {selectedMakeId && availableModels.length === 0 && (
                   <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                     No models found for this make. Please add models in the "Vehicle Models" section first.
                   </p>
                )}
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};