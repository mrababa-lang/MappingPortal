import React, { useState, useEffect } from 'react';
import { DataService } from '../services/storageService';
import { Make } from '../types';
import { Card, Button, Input, Modal, TableHeader, TableHead, TableRow, TableCell, TextArea } from '../components/UI';
import { Plus, Trash2, Edit2, Globe, Upload } from 'lucide-react';

export const MakesView: React.FC = () => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Make>>({ name: '', country: '', website: '' });
  
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
      setFormData({ name: '', country: '', website: '' });
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
        country: formData.country!,
        website: formData.website || ''
      };
      DataService.saveMakes([...makes, newMake]);
    }
    setIsModalOpen(false);
    refreshData();
  };

  const handleBulkImport = () => {
    if (!bulkData.trim()) return;
    
    const lines = bulkData.split('\n');
    const newMakes: Make[] = [];
    
    lines.forEach(line => {
      // CSV Format: Name, Country, Website
      const parts = line.split(',');
      if (parts.length < 2) return;
      
      const name = parts[0].trim();
      const country = parts[1].trim();
      const website = parts[2] ? parts[2].trim() : '';
      
      if (!name || !country) return;
      
      newMakes.push({
        id: Date.now() + Math.random().toString(),
        name,
        country,
        website
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
              <TableHead>Website</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
              {makes.map(make => (
                <TableRow key={make.id} onClick={() => handleOpenModal(make)}>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-400">{make.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{make.name}</div>
                  </TableCell>
                  <TableCell>{make.country}</TableCell>
                  <TableCell>
                    {make.website ? (
                      <a href={`https://${make.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>
                        <Globe size={14} /> {make.website}
                      </a>
                    ) : '-'}
                  </TableCell>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No makes found. Click "Add Make" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
          <Input 
            label="Make Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Toyota"
          />
          <Input 
            label="Country" 
            value={formData.country} 
            onChange={e => setFormData({...formData, country: e.target.value})}
            placeholder="e.g. Japan"
          />
          <Input 
            label="Website (Optional)" 
            value={formData.website} 
            onChange={e => setFormData({...formData, website: e.target.value})}
            placeholder="toyota.com"
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
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
             <div className="bg-slate-100 p-3 rounded border border-slate-200 font-mono text-xs">
              Format: Name, Country, Website<br/>
              Example: Tesla, USA, tesla.com
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