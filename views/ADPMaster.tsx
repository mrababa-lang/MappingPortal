import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { ADPMaster } from '../types';
import { Card, Button, Input, Modal, TableHeader, TableHead, TableRow, TableCell, TextArea } from '../components/UI';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';

export const ADPMasterView: React.FC = () => {
  const [adpList, setAdpList] = useState<ADPMaster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkData, setBulkData] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<ADPMaster>>({ 
    adpMakeId: '', makeEnDesc: '', makeArDesc: '', 
    adpModelId: '', modelEnDesc: '', modelArDesc: '',
    adpTypeId: '', typeEnDesc: '', typeArDesc: ''
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAdpList(DataService.getADPMaster());
  };

  const handleOpenModal = (item?: ADPMaster) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ 
        adpMakeId: '', makeEnDesc: '', makeArDesc: '', 
        adpModelId: '', modelEnDesc: '', modelArDesc: '',
        adpTypeId: '', typeEnDesc: '', typeArDesc: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.adpMakeId || !formData.adpModelId || !formData.adpTypeId) return;

    if (editingId) {
      const updated = adpList.map(item => item.id === editingId ? { ...item, ...formData } as ADPMaster : item);
      DataService.saveADPMaster(updated);
    } else {
      const newItem: ADPMaster = {
        id: Date.now().toString(),
        adpMakeId: formData.adpMakeId!,
        makeEnDesc: formData.makeEnDesc!,
        makeArDesc: formData.makeArDesc!,
        adpModelId: formData.adpModelId!,
        modelEnDesc: formData.modelEnDesc!,
        modelArDesc: formData.modelArDesc!,
        adpTypeId: formData.adpTypeId!,
        typeEnDesc: formData.typeEnDesc!,
        typeArDesc: formData.typeArDesc!
      };
      DataService.saveADPMaster([...adpList, newItem]);
    }
    setIsModalOpen(false);
    refreshData();
  };

  const handleBulkImport = () => {
    if (!bulkData.trim()) return;
    
    const lines = bulkData.split('\n');
    const newItems: ADPMaster[] = [];
    
    lines.forEach(line => {
      // CSV: MakeID, MakeEn, MakeAr, ModelID, ModelEn, ModelAr, TypeID, TypeEn, TypeAr
      const parts = line.split(',');
      if (parts.length < 9) return;
      
      newItems.push({
        id: Date.now() + Math.random().toString(),
        adpMakeId: parts[0].trim(),
        makeEnDesc: parts[1].trim(),
        makeArDesc: parts[2].trim(),
        adpModelId: parts[3].trim(),
        modelEnDesc: parts[4].trim(),
        modelArDesc: parts[5].trim(),
        adpTypeId: parts[6].trim(),
        typeEnDesc: parts[7].trim(),
        typeArDesc: parts[8].trim()
      });
    });

    if (newItems.length > 0) {
      DataService.saveADPMaster([...adpList, ...newItems]);
      refreshData();
      setIsBulkOpen(false);
      setBulkData('');
    } else {
      alert("No valid data found or invalid format.");
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this ADP entry? This may affect existing mappings.")) {
      const filtered = adpList.filter(item => item.id !== id);
      DataService.saveADPMaster(filtered);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">ADP Master List</h1>
           <p className="text-slate-500">Manage ADP Make, Model, and Type definitions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsBulkOpen(true)}>
            <Upload size={18} />
            Bulk Upload
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Add Entry
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {adpList.map(item => (
                <TableRow key={item.id} onClick={() => handleOpenModal(item)}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-500 mb-1">{item.adpMakeId}</span>
                      <span className="font-medium text-slate-900">{item.makeEnDesc}</span>
                      <span className="text-xs text-slate-500" dir="rtl">{item.makeArDesc}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-500 mb-1">{item.adpModelId}</span>
                      <span className="font-medium text-slate-900">{item.modelEnDesc}</span>
                      <span className="text-xs text-slate-500" dir="rtl">{item.modelArDesc}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-500 mb-1">{item.adpTypeId}</span>
                      <span className="font-medium text-slate-900">{item.typeEnDesc}</span>
                      <span className="text-xs text-slate-500" dir="rtl">{item.typeArDesc}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="p-2 h-auto" onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" className="p-2 h-auto text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => handleDelete(item.id, e)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {adpList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No ADP entries found.
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
        title={editingId ? 'Edit ADP Entry' : 'Add ADP Entry'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Make Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">Make Details</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input label="ID" value={formData.adpMakeId} onChange={e => setFormData({...formData, adpMakeId: e.target.value})} placeholder="TOY" />
              <Input label="Desc (En)" value={formData.makeEnDesc} onChange={e => setFormData({...formData, makeEnDesc: e.target.value})} placeholder="Toyota" />
              <Input label="Desc (Ar)" value={formData.makeArDesc} onChange={e => setFormData({...formData, makeArDesc: e.target.value})} placeholder="تويوتا" dir="rtl" />
            </div>
          </div>

          {/* Model Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">Model Details</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input label="ID" value={formData.adpModelId} onChange={e => setFormData({...formData, adpModelId: e.target.value})} placeholder="CAM" />
              <Input label="Desc (En)" value={formData.modelEnDesc} onChange={e => setFormData({...formData, modelEnDesc: e.target.value})} placeholder="Camry" />
              <Input label="Desc (Ar)" value={formData.modelArDesc} onChange={e => setFormData({...formData, modelArDesc: e.target.value})} placeholder="كامري" dir="rtl" />
            </div>
          </div>

          {/* Type Section */}
          <div className="space-y-2">
             <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">Type Details</h4>
             <div className="grid grid-cols-3 gap-3">
              <Input label="ID" value={formData.adpTypeId} onChange={e => setFormData({...formData, adpTypeId: e.target.value})} placeholder="SED" />
              <Input label="Desc (En)" value={formData.typeEnDesc} onChange={e => setFormData({...formData, typeEnDesc: e.target.value})} placeholder="Sedan" />
              <Input label="Desc (Ar)" value={formData.typeArDesc} onChange={e => setFormData({...formData, typeArDesc: e.target.value})} placeholder="سيدان" dir="rtl" />
            </div>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Import ADP Data"
        footer={
          <>
             <Button variant="secondary" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
             <Button onClick={handleBulkImport}>Import Data</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
             <div className="bg-slate-100 p-3 rounded border border-slate-200 font-mono text-xs overflow-x-auto whitespace-pre">
              Order: MakeID, MakeEn, MakeAr, ModelID, ModelEn, ModelAr, TypeID, TypeEn, TypeAr<br/>
              Example: TOY,Toyota,تويوتا,CAM,Camry,كامري,SED,Sedan,سيدان
            </div>
          </div>
          <TextArea 
            label="CSV Data"
            placeholder="Paste CSV data here..."
            value={bulkData}
            onChange={e => setBulkData(e.target.value)}
            className="font-mono text-xs min-h-[200px]"
          />
        </div>
      </Modal>
    </div>
  );
};