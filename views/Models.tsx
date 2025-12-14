import React, { useState } from 'react';
import { useModels, useMakes, useTypes, useCreateModel, useUpdateModel, useDeleteModel, useBulkImportModels } from '../hooks/useVehicleData';
import { Model } from '../types';
import { Card, Button, Input, Select, Modal, TableHeader, TableHead, TableRow, TableCell, Pagination, InfoTooltip } from '../components/UI';
import { Plus, Trash2, Edit2, Upload, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const ModelsView: React.FC = () => {
  const { data: models = [], isLoading } = useModels();
  const { data: makes = [] } = useMakes();
  const { data: types = [] } = useTypes();
  
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const deleteModel = useDeleteModel();
  const bulkImport = useBulkImportModels();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const { register, handleSubmit, reset } = useForm<Model>();

  // Helper to extract ID robustly from flat fields, nested objects, or snake_case
  const getSafeId = (item: any, idField: string, nestedObjField?: string) => {
      if (item[idField]) return item[idField];
      if (nestedObjField && item[nestedObjField] && item[nestedObjField].id) return item[nestedObjField].id;
      // Try snake case (e.g., makeId -> make_id)
      const snake = idField.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (item[snake]) return item[snake];
      return '';
  };

  const handleOpenModal = (model?: any) => {
    setEditingId(model?.id || null);
    
    // Robustly find IDs for the form
    const makeId = model ? getSafeId(model, 'makeId', 'make') : '';
    const typeId = model ? getSafeId(model, 'typeId', 'type') : '';
    
    reset({
        name: model?.name || '', 
        nameAr: model?.nameAr || '', 
        makeId: makeId, 
        typeId: typeId 
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: Model) => {
    if (editingId) {
      updateModel.mutate({ ...data, id: editingId }, {
        onSuccess: () => { setIsModalOpen(false); toast.success("Model updated"); }
      });
    } else {
      createModel.mutate(data, {
        onSuccess: () => { setIsModalOpen(false); toast.success("Model created"); }
      });
    }
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Delete this model?")) {
        deleteModel.mutate(id, { onSuccess: () => toast.success("Model deleted") });
    }
  };
  
  const handleBulk = () => {
      if(bulkFile) {
          bulkImport.mutate(bulkFile, { onSuccess: () => { setIsBulkOpen(false); toast.success("Importing..."); } });
      }
  }

  // Helper to display Make Name
  const getMakeName = (model: any) => {
      if (model.make?.name) return model.make.name;
      const id = getSafeId(model, 'makeId', 'make');
      // Use loose equality (==) to handle string/number mismatch
      return makes.find(m => m.id == id)?.name || id || '-';
  };

  // Helper to display Type Name
  const getTypeName = (model: any) => {
      if (model.type?.name) return model.type.name;
      if (model.vehicleType?.name) return model.vehicleType.name;
      const id = getSafeId(model, 'typeId', 'type');
      return types.find(t => t.id == id)?.name || id || '-';
  };

  const filteredModels = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginated = filteredModels.slice((currentPage - 1) * 20, currentPage * 20);

  if (isLoading) return <Loader2 className="animate-spin m-auto" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
         <h1 className="text-2xl font-bold">Vehicle Models</h1>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsBulkOpen(true)}><Upload size={18}/> Import</Button>
            <Button onClick={() => handleOpenModal()}><Plus size={18}/> Add Model</Button>
         </div>
      </div>
      
      <Input label="" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

      <Card>
         <table className="w-full">
            <TableHeader>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
                {paginated.map(model => (
                    <TableRow key={model.id} onClick={() => handleOpenModal(model)}>
                        <TableCell><span className="font-mono text-xs text-slate-400">{model.id}</span></TableCell>
                        <TableCell>{model.name}</TableCell>
                        <TableCell>{getMakeName(model)}</TableCell>
                        <TableCell>{getTypeName(model)}</TableCell>
                        <TableCell>
                            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(model.id); }}><Trash2 size={16} className="text-red-500"/></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </tbody>
         </table>
         <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredModels.length/20)} onPageChange={setCurrentPage} totalItems={filteredModels.length} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit' : 'Add'} footer={<Button onClick={handleSubmit(onSubmit)}>Save</Button>}>
          <div className="space-y-4">
              <Select label="Make" {...register('makeId')} options={makes.map(m => ({ value: m.id, label: m.name }))} />
              <Select label="Type" {...register('typeId')} options={types.map(t => ({ value: t.id, label: t.name }))} />
              <Input label="Name (En)" {...register('name')} />
              <Input label="Name (Ar)" {...register('nameAr')} />
          </div>
      </Modal>
      
      <Modal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} title="Bulk Import" footer={<Button onClick={handleBulk}>Upload</Button>}>
          <input type="file" onChange={e => setBulkFile(e.target.files?.[0] || null)} />
      </Modal>
    </div>
  );
};