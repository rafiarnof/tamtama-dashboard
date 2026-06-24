import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Pencil, Trash2, X, Check, UserCheck, UserX,
  Mail, Phone, Sprout, Search, ChevronDown, ChevronUp, Shield, User
} from 'lucide-react';
import * as supabaseAuthService from '@/app/services/supabaseAuthService';
import type { UserProfile } from '@/app/services/supabaseAuthService';
import type { Sector } from '@/app/types';

interface AdminUserManagementProps {
  accessToken: string;
  sectors: Sector[];
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  assignedSectors: string[];
}

const defaultForm: UserFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  assignedSectors: [],
};

export function AdminUserManagement({ accessToken, sectors }: AdminUserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserFormData>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userList = await supabaseAuthService.getAllUsers(accessToken);
      setUsers(userList);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(defaultForm);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      assignedSectors: user.assignedSectors || [],
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setForm(defaultForm);
    setError('');
  };

  const toggleSectorAssignment = (sectorId: string) => {
    setForm(prev => ({
      ...prev,
      assignedSectors: prev.assignedSectors.includes(sectorId)
        ? prev.assignedSectors.filter(id => id !== sectorId)
        : [...prev.assignedSectors, sectorId],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nama wajib diisi'); return; }
    if (!editingUser && !form.email.trim()) { setError('Email wajib diisi'); return; }
    if (!editingUser && (!form.password || form.password.length < 6)) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (editingUser) {
        // Update user
        const result = await supabaseAuthService.updateUser(
          editingUser.userId,
          {
            name: form.name.trim(),
            phone: form.phone.trim(),
            assignedSectors: form.assignedSectors,
          },
          accessToken
        );
        if (result.success) {
          setSuccess('User berhasil diupdate');
          await loadUsers();
          closeModal();
        } else {
          setError(result.error || 'Gagal mengupdate user');
        }
      } else {
        // Create user
        const result = await supabaseAuthService.createUser(
          {
            email: form.email.trim(),
            password: form.password,
            name: form.name.trim(),
            phone: form.phone.trim(),
            assignedSectors: form.assignedSectors,
          },
          accessToken
        );
        if (result.success) {
          setSuccess('User berhasil dibuat');
          await loadUsers();
          closeModal();
        } else {
          setError(result.error || 'Gagal membuat user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`Hapus user "${user.name}" (${user.email})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setDeletingUserId(user.userId);
    try {
      const result = await supabaseAuthService.deleteUser(user.userId, accessToken);
      if (result.success) {
        setSuccess(`User ${user.name} berhasil dihapus`);
        await loadUsers();
      } else {
        alert(result.error || 'Gagal menghapus user');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const getSectorName = (sectorId: string) => {
    return sectors.find(s => s.sectorId === sectorId)?.name || sectorId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6f2ec] p-2.5 rounded-xl">
            <Users size={22} className="text-[#026644]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manajemen User</h2>
            <p className="text-sm text-slate-500">{users.length} user terdaftar</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#026644] hover:bg-[#025538] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="bg-[#e6f2ec] border border-[#c2dfd0] text-[#026644] px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari user berdasarkan nama atau email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#026644] focus:outline-none"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#026644] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="bg-slate-100 inline-flex p-4 rounded-full mb-3">
            <Users size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">
            {searchTerm ? 'Tidak ada user yang cocok' : 'Belum ada user'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {searchTerm ? 'Coba kata kunci lain' : 'Tambahkan user baru untuk memulai'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => {
            const isExpanded = expandedUser === user.userId;
            const isAdmin = user.role === 'admin';
            const assignedSectorNames = (user.assignedSectors || []).map(getSectorName);

            return (
              <div key={user.userId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : user.userId)}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isAdmin ? 'bg-purple-500' : 'bg-[#026644]'}`}>
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 truncate">{user.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-[#e6f2ec] text-[#026644]'}`}>
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>

                  {/* Sector count */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Sprout size={12} className="text-[#026644]" />
                    <span>{isAdmin ? 'Semua' : `${user.assignedSectors?.length || 0} sektor`}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-2" onClick={e => e.stopPropagation()}>
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-slate-500 hover:text-[#026644] hover:bg-[#e6f2ec] rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingUserId === user.userId}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus user"
                        >
                          {deletingUserId === user.userId ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Mail size={12} /> Email
                        </p>
                        <p className="text-sm font-medium text-slate-700">{user.email}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Phone size={12} /> Telepon
                        </p>
                        <p className="text-sm font-medium text-slate-700">{user.phone || '-'}</p>
                      </div>
                    </div>

                    {/* Assigned Sectors */}
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                        <Sprout size={12} /> Sektor yang diassign
                      </p>
                      {isAdmin ? (
                        <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                          <Shield size={14} /> Admin dapat mengakses semua sektor
                        </p>
                      ) : assignedSectorNames.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Belum ada sektor diassign</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedSectorNames.map((name, i) => (
                            <span key={i} className="bg-[#e6f2ec] text-[#026644] px-2.5 py-1 rounded-full text-xs font-medium">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      Dibuat: {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-[#e6f2ec] p-2 rounded-xl">
                  {editingUser ? <Pencil size={18} className="text-[#026644]" /> : <Plus size={18} className="text-[#026644]" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {editingUser ? 'Edit User' : 'Tambah User Baru'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editingUser ? `Mengedit ${editingUser.name}` : 'Buat akun user baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(''); }}
                    placeholder="Nama lengkap user"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white text-sm transition-all"
                  />
                </div>
              </div>

              {/* Email (only for create) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); }}
                      placeholder="user@email.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor HP</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password (only for create) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#026644] focus:border-[#026644] outline-none bg-slate-50 focus:bg-white text-sm transition-all"
                  />
                </div>
              )}

              {/* Assign Sectors */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign Sektor <span className="text-slate-400 font-normal text-xs">({form.assignedSectors.length} dipilih)</span>
                </label>
                <div className="bg-slate-50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5">
                  {sectors.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-2">Belum ada sektor tersedia</p>
                  ) : (
                    sectors.map(sector => {
                      const isSelected = form.assignedSectors.includes(sector.sectorId);
                      return (
                        <button
                          key={sector.sectorId}
                          type="button"
                          onClick={() => toggleSectorAssignment(sector.sectorId)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                            isSelected
                              ? 'bg-[#e6f2ec] border border-[#8fc4aa] text-[#025538]'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-[#8fc4aa] hover:bg-[#e6f2ec]/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-[#026644] border-[#026644]' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{sector.name}</p>
                            <p className="text-xs text-slate-400 truncate">{sector.sectorId} • {sector.plant?.name || 'N/A'}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-[#026644] hover:bg-[#025538] text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{editingUser ? 'Simpan Perubahan' : 'Buat User'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}