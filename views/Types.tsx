import React, { useState } from 'react';
import { useTypes, useCreateType, useUpdateType, useDeleteType } from '../hooks/useVehicleData';
import { useAppConfig } from '../hooks/useAdminData';
import { VehicleType } from '../types';
import { Card, Button, Input, Modal, TableHeader, TableHead, TableRow, TableCell, TextArea, EmptyState, Pagination } from '../components/UI';
import { Plus, Trash2, Loader2, Sparkles, Tags, Search, X, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { generateDescription } from '../services/geminiService';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { commonValidators } from '../utils/validation';

const typeSchema = z.object({
  id: commonValidators.numericId,
  name: commonValidators.requiredString,
  description: z.string().optional(),
});
type TypeFormData = z.infer<typeof typeSchema>;

export const TypesView: React.FC = () => {
  const { data: types = [], isLoading } = useTypes();
  const { data: config } = useAppConfig();
  
  const createType = useCreateType();
  const updateType = useUpdateType();
  const deleteType = useDeleteType();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema)
  });
  const currentName = watch('name');

  const handleOpenModal = (type?: VehicleType) => {
    setEditingId(type?.id || null);
    reset(type || { id: '', name: '', description: '' });
    setIsModalOpen(true);
  };

  const onSubmit = (data: TypeFormData) => {
    if (editingId) {
      updateType.mutate({ ...data, id: editingId } as VehicleType, { onSuccess: () => { setIsModalOpen(false); toast.success("Updated"); }});
    } else {
      createType.mutate(data as VehicleType, { onSuccess: () => { setIsModalOpen(false); toast.success("Created"); }});
    }
  };

  const handleDelete = (id: string) => {
      if(window.confirm("Are you sure you want to delete this vehicle type?")) {
          deleteType.mutate(id, {
              onSuccess: () => toast.success("Type deleted")
          });
      }
  }

  const handleAiGenerate = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!currentName) {
          toast.error("Please enter a name first.");
          return;
      }
      setIsAiLoading(true);
      const desc = await generateDescription(currentName, "Vehicle Classification Type");
      setValue('description', desc);
      setIsAiLoading(false);
  };

  // Proper client-side filtering
  const filteredTypes = types.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toString().includes(searchQuery) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredTypes.length / ITEMS_PER_PAGE);
  const paginatedTypes = filteredTypes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Vehicle Types</h1>
            <p className="text-slate-500">Define and manage vehicle body styles and classifications.</p>
         </div>
         <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-slate-900/10">
            <Plus size={18}/> Add Type
         </Button>
      </div>

      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute top-3 left-3 text-slate-400" size={18} />
                <Input 
                    label="" 
                    placeholder="Search by ID or Name..." 
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                    className="pl-10 h-11"
                />
                {searchQuery && (
                    <button 
                        onClick={() => { setSearchQuery(''); setPage(1); }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            <div className="text-sm text-slate-400 font-medium whitespace-nowrap hidden sm:block">
                {filteredTypes.length} types total
            </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200">
         {types.length === 0 ? (
             <EmptyState 
                icon={Tags}
                title="No Types Defined"
                description="Your internal vehicle type list is empty. Body styles like SUV, Sedan, or Hatchback should be defined here."
                action={<Button onClick={() => handleOpenModal()}><Plus size={16}/> Create First Type</Button>}
             />
         ) : filteredTypes.length === 0 ? (
             <EmptyState 
                icon={Search}
                title="No Matches"
                description={`No results found matching "${searchQuery}". Try a different term or ID.`}
                action={<Button variant="ghost" onClick={() => setSearchQuery('')}>Clear Search</Button>}
             />
         ) : (
            <>
            <div className="overflow-x-auto">
            <table className="w-full">
                <TableHeader>
                    <TableHead>ID</TableHead>
                    <TableHead>Classification Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <tbody>
                    {paginatedTypes.map(type => (
                        <TableRow key={type.id} onClick={() => handleOpenModal(type)}>
                            <TableCell>
                                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                    {type.id}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="font-bold text-slate-900">{type.name}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-500 text-sm line-clamp-1 max-w-xs xl:max-w-md" title={type.description}>
                                    {type.description || <span className="italic text-slate-300">No description provided</span>}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenModal(type)}>
                                        <Plus className="rotate-45 text-slate-400 group-hover:text-indigo-600 transition-transform" size={16}/>
                                    </Button>
                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(type.id)}>
                                        <Trash2 size={16} className="text-slate-400 hover:text-red-500 transition-colors"/>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </table>
            </div>
            <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
                totalItems={filteredTypes.length} 
            />
            </>
         )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Vehicle Type' : 'Create New Type'} footer={<Button onClick={handleSubmit(onSubmit)} className="px-8">Save Type</Button>}>
          <div className="space-y-5">
              <Input 
                label="Unique Type ID (Manual)" 
                {...register('id')} 
                disabled={!!editingId} 
                placeholder="e.g. 10" 
                error={errors.id?.message as string} 
                className="font-mono"
              />
              <Input 
                label="Type Name" 
                {...register('name')} 
                placeholder="e.g. Sport Utility Vehicle" 
                error={errors.name?.message as string} 
              />
              <div className="relative">
                 <TextArea 
                    label="Internal Description" 
                    {...register('description')} 
                    rows={4} 
                    placeholder="Describe how this type differs from others..."
                 />
                 {config?.enableAI && (
                     <button 
                       onClick={handleAiGenerate}
                       disabled={isAiLoading || !currentName}
                       className="absolute top-0 right-0 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-1 rounded-bl-lg flex items-center gap-1.5 hover:bg-indigo-100 transition-colors disabled:opacity-50 border-l border-b border-indigo-100 shadow-sm"
                     >
                         {isAiLoading ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />}
                         AI Generate
                     </button>
                 )}
              </div>
          </div>
      </Modal>
    </div>
  );
};