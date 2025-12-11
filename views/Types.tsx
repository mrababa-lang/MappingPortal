import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { generateDescription } from '../services/geminiService';
import { VehicleType } from '../types';
import { Card, Button, Input, TextArea, Modal, TableHeader, TableHead, TableRow, TableCell } from '../components/UI';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';

export const TypesView: React.FC = () => {
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<VehicleType>>({ name: '', description: '' });
  
  // Bulk State
  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setTypes(DataService.getTypes());
  };

  const handleOpenModal = (type?: VehicleType) => {
    if (type) {
      setEditingId(type.id);
      setFormData(type);
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      const updated = types.map(t => t.id === editingId ? { ...t, ...formData } as VehicleType : t);
      DataService.saveTypes(updated);
    } else {
      const newType: VehicleType = {
        id: Date.now().toString(),
        name: formData.name!,
        description: formData.description || ''
      };
      DataService.saveTypes([...types, newType]);
    }
    setIsModalOpen(false);
    refreshData();
  };
  
  const handleBulkImport = () => {
    if (!bulkData.trim()) return;
    
    const lines = bulkData.split('\n');
    const newTypes: VehicleType[] = [];
    
    lines.forEach(line => {
      // CSV Format: Name, Description
      const parts = line.split(',');
      if (parts.length < 1) return;
      
      const name = parts[0].trim();
      const description = parts.slice(1).join(',').trim() || ''; // Join remaining parts for description
      
      if (!name) return;
      
      newTypes.push({
        id: Date.now() + Math.random().toString(),
        name,
        description
      });
    });

    if (newTypes.length > 0) {
      DataService.saveTypes([...types, ...newTypes]);
      refreshData();
      setIsBulkOpen(false);
      setBulkData('');
    } else {
      alert("No valid data found.");
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this vehicle type?")) {
      const filtered = types.filter(t => t.id !== id);
      DataService.saveTypes(filtered);
      refreshData();
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name) {
      alert("Please enter a name first.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateDescription(formData.name, "type");
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Vehicle Types</h1>
           <p className="text-slate-500">Classifications for vehicle body styles.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsBulkOpen(true)}>
            <Upload size={18} />
            Bulk Import
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Add Type
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>ID</TableHead>
              <TableHead>Type Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {types.map(type => (
                <TableRow key={type.id} onClick={() => handleOpenModal(type)}>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-400">{type.id}</span>
                  </TableCell>
                  <TableCell>
                     <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded">{type.name}</span>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xl truncate text-slate-500">{type.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="p-2 h-auto" onClick={(e) => { e.stopPropagation(); handleOpenModal(type); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" className="p-2 h-auto text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => handleDelete(type.id, e)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit/Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Vehicle Type' : 'Add New Type'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Type Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Convertible"
          />
          <div className="relative">
            <TextArea 
              label="Description" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Description of the vehicle type..."
            />
            <div className="absolute top-0 right-0">
               <Button 
                 variant="ai" 
                 type="button" 
                 onClick={handleAIGenerate} 
                 isLoading={isGenerating}
                 className="text-xs py-1 px-2 h-auto"
                 title="Auto-generate description"
               >
                 AI Generate
               </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Import Types"
        footer={
          <>
             <Button variant="secondary" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
             <Button onClick={handleBulkImport}>Import Types</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
             <div className="bg-slate-100 p-3 rounded border border-slate-200 font-mono text-xs">
              Format: Name, Description<br/>
              Example: Station Wagon, A car with a large cargo area.
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