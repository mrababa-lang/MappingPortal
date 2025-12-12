import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { Make } from '../types';
import { Card, Button, Input, Modal, TableHeader, TableHead, TableRow, TableCell, TextArea, Pagination } from '../components/UI';
import { Plus, Trash2, Edit2, Upload, FileText } from 'lucide-react';

export const MakesView: React.FC = () => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  // Form State
  const [formData, setFormData] = useState<Partial<Make>>({ name: '', nameAr: '', country: '' });
  
  // Bulk State
  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMakes(DataService.getMakes());
  };

  const handleOpenModal = (make?: Make) => {
    if (make) {
      setEditingId(make.id);
      setFormData(make);
    } else {
      setEditingId(null);
      setFormData({ name: '', nameAr: '', country: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.country) return;

    if (editingId) {
      const updated = makes.map(m => m.id === editingId ? { ...m, ...formData } as Make : m);
      DataService.saveMakes(updated);
    } else {
      const newMake: Make = {
        id: Date.now().toString(),
        name: formData.name!,
        nameAr: formData.nameAr || '',
        country: formData.country!
      };
      DataService.saveMakes([...makes, newMake]);
    }
    setIsModalOpen(false);
    refreshData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkData(content);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    if (!bulkData.trim()) return;
    
    const lines = bulkData.split('\n');
    const newMakes: Make[] = [];
    
    lines.forEach(line => {
      // CSV Format: Name, Country
      const parts = line.split(',');
      if (parts.length < 2) return;
      
      const name = parts[0].trim();
      const country = parts[1].trim();
      
      if (!name || !country) return;
      
      newMakes.push({
        id: Date.now() + Math.random().toString(),
        name,
        country
      });
    });

    if (newMakes.length > 0) {
      DataService.saveMakes([...makes, ...newMakes]);
      refreshData();
      setIsBulkOpen(false);
      setBulkData('');
    } else {
      alert("No valid data found. Check formatting.");
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? This may affect linked models.")) {
      const filtered = makes.filter(m => m.id !== id);
      DataService.saveMakes(filtered);
      refreshData();
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(makes.length / ITEMS_PER_PAGE);
  const paginatedMakes = makes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Vehicle Makes</h1>
           <p className="text-slate-500">Manage manufacturers and their origins.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsBulkOpen(true)}>
            <Upload size={18} />
            Bulk Import
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Add Make
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>ID</TableHead>
              <TableHead>Make Name</TableHead>
              <TableHead>Country of Origin</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {paginatedMakes.map(make => (
                <TableRow key={make.id} onClick={() => handleOpenModal(make)}>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-400">{make.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <div className="font-medium text-slate-900">{make.name}</div>
                        {make.nameAr && <div className="text-xs text-slate-500" dir="rtl">{make.nameAr}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{make.country}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="p-2 h-auto" onClick={(e) => { e.stopPropagation(); handleOpenModal(make); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" className="p-2 h-auto text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => handleDelete(make.id, e)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {makes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No makes found. Click "Add Make" to create one.
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
          totalItems={makes.length}
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Make' : 'Add New Make'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <Input 
                label="Make Name (En)" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Toyota"
              />
              <Input 
                label="Make Name (Ar)" 
                value={formData.nameAr} 
                onChange={e => setFormData({...formData, nameAr: e.target.value})}
                placeholder="تويوتا"
                dir="rtl"
              />
          </div>
          <Input 
            label="Country" 
            value={formData.country} 
            onChange={e => setFormData({...formData, country: e.target.value})}
            placeholder="e.g. Japan"
          />
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Import Makes"
        footer={
          <>
             <Button variant="secondary" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
             <Button onClick={handleBulkImport}>Import Makes</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="flex items-center gap-2 mb-3">
               <FileText size={18} className="text-slate-500" />
               <h4 className="font-semibold text-slate-700 text-sm">Upload CSV File</h4>
             </div>
             <input 
               type="file" 
               accept=".csv,.txt"
               onChange={handleFileUpload}
               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-700 file:shadow-sm hover:file:bg-slate-100 cursor-pointer"
             />
             <div className="mt-3 text-xs text-slate-500 font-mono bg-slate-100 p-2 rounded">
              Format: Name, Country<br/>
              Example: Tesla, USA
            </div>
          </div>
          
          <div className="relative border-t border-slate-200 pt-6">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium text-slate-400">OR PASTE MANUALY</div>
             <TextArea 
                label="CSV Content"
                placeholder="Paste CSV data here..."
                value={bulkData}
                onChange={e => setBulkData(e.target.value)}
                className="font-mono text-xs min-h-[150px]"
             />
          </div>
        </div>
      </Modal>
    </div>
  );
};