import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Sprout, User, MapPin, Calendar, FileText, Phone } from 'lucide-react';
import { Sector } from '@/app/data/sectors';

interface SectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Sector>) => void;
  initialData?: Sector;
}

// Define the shape of our form data to avoid "any" type errors
type FormData = {
  name: string;
  owner: string;
  phoneNumber: string;
  location: string;
  cropType: string;
  plantingDate: string;
  harvestDate: string;
  description: string;
};

export const SectorFormModal: React.FC<SectorFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const defaultState: FormData = {
    name: '',
    owner: '',
    phoneNumber: '',
    location: '',
    cropType: '',
    plantingDate: '',
    harvestDate: '',
    description: '',
  };

  const [formData, setFormData] = useState<FormData>(defaultState);

  useEffect(() => {
    if (isOpen && initialData) {
      // Support both old and new data structure (Firebase)
      setFormData({
        name: initialData.name,
        owner: initialData.owner?.name || initialData.owner || '',
        phoneNumber: initialData.owner?.phone || initialData.phoneNumber || '',
        location: initialData.owner?.location || initialData.location || '',
        cropType: initialData.plant?.name || initialData.cropType || '',
        plantingDate: initialData.plant?.plantedDate || initialData.plantingDate || '',
        harvestDate: initialData.plant?.expectedHarvest || initialData.harvestDate || '',
        description: initialData.description || '',
      });
    } else if (isOpen && !initialData) {
      setFormData(defaultState);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Cast name to keyof FormData to satisfy TypeScript
    setFormData(prev => ({ ...prev, [name as keyof FormData]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto">
              <form onSubmit={handleSubmit}>
                <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
                  <h2 className="text-xl font-bold text-slate-800">
                    {initialData ? 'Edit Identitas Sektor' : 'Tambah Sektor Baru'}
                  </h2>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* General Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Informasi Umum</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                           Nama Sektor <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Contoh: Sektor A - Padi"
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <MapPin size={14} /> Lokasi
                        </label>
                        <input
                          required
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Contoh: Blok Utara"
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Pemilik</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <User size={14} /> Nama Pemilik
                        </label>
                        <input
                          required
                          name="owner"
                          value={formData.owner}
                          onChange={handleChange}
                          placeholder="Nama lengkap"
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Phone size={14} /> WhatsApp
                        </label>
                        <input
                          required
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          type="tel"
                          placeholder="628..."
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Crop Info */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tanaman</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Sprout size={14} /> Jenis Tanaman
                      </label>
                      <input
                        required
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleChange}
                        placeholder="Contoh: Padi IR64"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Calendar size={14} /> Tanggal Tanam
                        </label>
                        <input
                          type="date"
                          name="plantingDate"
                          value={formData.plantingDate}
                          onChange={handleChange}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Calendar size={14} /> Rencana Panen
                        </label>
                        <input
                          type="date"
                          name="harvestDate"
                          value={formData.harvestDate}
                          onChange={handleChange}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <FileText size={14} /> Deskripsi / Catatan
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Catatan kondisi tanaman..."
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
                  >
                    <Save size={18} />
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};