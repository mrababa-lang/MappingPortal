import React, { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useAdminData';
import { User } from '../types';
import { Card, Button, Input, Modal, TableHeader, TableHead, TableRow, TableCell, Select } from '../components/UI';
import { Plus, Trash2, Edit2, Loader2, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const UsersView: React.FC = () => {
  const { data: usersData, isLoading } = useUsers();
  // Defensive check: Ensure users is always an array to prevent .map() crashes
  const users = Array.isArray(usersData) ? usersData : [];

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<User>();

  const handleOpenModal = (user?: User) => {
    setEditingId(user?.id || null);
    reset(user || { fullName: '', email: '', role: 'MAPPING_USER', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const onSubmit = (data: User) => {
    if (editingId) {
      updateUser.mutate({ ...data, id: editingId }, { onSuccess: () => { setIsModalOpen(false); toast.success("Updated"); }});
    } else {
      createUser.mutate(data, { onSuccess: () => { setIsModalOpen(false); toast.success("Created"); }});
    }
  };

  const handleDelete = (id: string) => {
      if(window.confirm("Delete User?")) deleteUser.mutate(id, { onSuccess: () => toast.success("Deleted") });
  }

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm">Manage system access and roles.</p>
         </div>
         <Button onClick={() => handleOpenModal()}><Plus size={18}/> Add User</Button>
      </div>

      <Card className="overflow-hidden">
         <table className="w-full">
            <TableHeader>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
            </TableHeader>
            <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id} onClick={() => handleOpenModal(user)}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                   <UserCircle size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{user.fullName}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                             {user.role === 'ADMIN' ? 'Admin' : user.role === 'MAPPING_ADMIN' ? 'Mapping Admin' : 'Mapping User'}
                           </span>
                        </TableCell>
                        <TableCell>
                           <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                             {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                           </span>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenModal(user)}><Edit2 size={16} className="text-slate-500 hover:text-indigo-600"/></Button>
                                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}><Trash2 size={16} className="text-slate-400 hover:text-red-500"/></Button>
                            </div>
                        </TableCell>
                    </TableRow>
                  ))
                )}
            </tbody>
         </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit User' : 'Add New User'} footer={
         <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save User</Button>
         </>
      }>
          <div className="space-y-4">
              <Input label="Full Name" {...register('fullName')} placeholder="e.g. John Doe" />
              <Input label="Email Address" type="email" {...register('email')} placeholder="john@slashdata.ae" />
              {!editingId && <Input label="Password" type="password" {...register('password')} placeholder="••••••••" />}
              <Select label="Role" {...register('role')} options={[
                {value:'ADMIN', label:'Admin'}, 
                {value:'MAPPING_ADMIN', label:'Mapping Admin'},
                {value:'MAPPING_USER', label:'Mapping User'}
              ]} />
              <Select label="Status" {...register('status')} options={[{value:'ACTIVE', label:'Active'}, {value:'INACTIVE', label:'Inactive'}]} />
          </div>
      </Modal>
    </div>
  );
};