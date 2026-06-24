import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Thermometer, Droplets, Waves, Power, User, MapPin, 
  Clock, Calendar, Sprout, MessageCircle, Info, Pencil, History, Sun, Trash2, TrendingUp,
  ShieldAlert, AlertTriangle, CheckCircle2, WifiOff, RefreshCw
} from 'lucide-react';
import type { Sector } from '@/app/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getWaterLevelInfo, canActivatePump, WATER_LEVEL_THRESHOLDS } from '@/app/utils/waterLevel';
import {
  isIoTDataSuspicious,
  getLastValidData,
  formatTimeSince,
  formatFullTimestamp,
  type CachedSensorData,
} from '@/app/utils/iotHealth';

interface SectorDetailProps {
  sector: Sector | null;
  onClose: () => void;
  onTogglePump: (id: string) => void;
  onEdit: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

interface SensorHistoryData {
  timestamp: string;
  temperature: number;
  humidity: number;
  waterLevel: number;
  lightLevel: number;
  pumpStatus: string;
}

// Format timestamp for chart display
const formatChartTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export const SectorDetail: React.FC<SectorDetailProps> = ({ sector, onClose, onTogglePump, onEdit, onDelete }) => {
  const [sensorHistory, setSensorHistory] = useState<SensorHistoryData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts'>('overview');
  
  // ✅ PERBAIKAN: Optimistic update untuk pump status
  const [optimisticPumpStatus, setOptimisticPumpStatus] = useState<'ON' | 'OFF' | null>(null);
  const [isPumpToggling, setIsPumpToggling] = useState(false);

  // Reset optimistic status when sector changes
  useEffect(() => {
    setOptimisticPumpStatus(null);
    setIsPumpToggling(false);
  }, [sector?.sectorId]);

  // Determine current pump status (optimistic or actual)
  const currentPumpStatus = optimisticPumpStatus || sector?.data.pumpStatus || 'OFF';

  // Fetch sensor history when sector changes
  useEffect(() => {
    if (sector && activeTab === 'charts') {
      fetchSensorHistory();
    }
  }, [sector?.sectorId, activeTab]);

  const fetchSensorHistory = async () => {
    if (!sector) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5aa965b0/iot/sensor-history/${sector.sectorId}?hours=24`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSensorHistory(result.data || []);
      } else {
        console.error('Failed to fetch sensor history');
      }
    } catch (error) {
      console.error('Error fetching sensor history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!sector) return null;

  // Ensure pumpHistory exists with default empty array
  const pumpHistory = sector.pumpHistory || [];

  // ── IoT Health Check ──────────────────────────────────────
  const isOffline = isIoTDataSuspicious(sector.data);
  const cachedData: CachedSensorData | null = isOffline ? getLastValidData(sector.sectorId) : null;
  const isUsingCache = isOffline && !!cachedData;
  // Data yang ditampilkan: cache saat offline, live saat online
  const displayData = isUsingCache && cachedData ? cachedData : sector.data;
  // ─────────────────────────────────────────────────────────

  const handleWhatsApp = () => {
    const message = `Halo ${sector.owner?.name || ''}, saya ingin menanyakan kondisi ${sector.plant?.name || 'tanaman'} di ${sector.name}.`;
    const phone = sector.owner?.phone?.replace(/\D/g, '') || '';
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Apakah Anda yakin ingin menghapus sektor "${sector.name}"?\n\nSemua data sensor, histori pompa, dan konfigurasi akan terhapus permanen.`)) {
      onDelete(sector);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {sector && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {sector.name}
                  </h2>
                  {/* Sector ID Badge - Very Prominent */}
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-emerald-200">
                    <span className="text-sm font-bold tracking-wide">{sector.sectorId || sector.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(sector)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Pencil size={16} />
                    Edit Identitas
                  </button>
                  {onDelete && (
                    <>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                        title="Hapus Sektor"
                      >
                        <Trash2 size={16} />
                        Hapus Sektor
                      </button>
                    </>
                  )}
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                
                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-200 -mt-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'overview'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Info size={16} className="inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('charts')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'charts'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <TrendingUp size={16} className="inline mr-2" />
                    Grafik 24 Jam
                  </button>
                </div>

                {/* Tab Content: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Top Section: Crop Info & Pump Control */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Crop Details */}
                      <div className="lg:col-span-2 bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                        <h3 className="text-emerald-800 font-semibold mb-3 flex items-center gap-2">
                          <Sprout size={20} /> Informasi Tanaman
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-emerald-600 mb-1">Jenis Tanaman</p>
                            <p className="font-medium text-emerald-900 text-lg">{sector.plant?.name || 'N/A'}</p>
                          </div>
                          <div>
                             <p className="text-sm text-emerald-600 mb-1">Tipe</p>
                             <p className="text-sm text-emerald-800 leading-relaxed">{sector.plant?.type || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-lg">
                            <Calendar size={16} className="text-emerald-600" />
                            <div>
                              <p className="text-xs text-emerald-600">Tanggal Tanam</p>
                              <p className="font-medium text-emerald-900">
                                {sector.plant?.plantedDate ? new Date(sector.plant.plantedDate).toLocaleDateString('id-ID') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-lg">
                            <Clock size={16} className="text-emerald-600" />
                            <div>
                              <p className="text-xs text-emerald-600">Rencana Panen</p>
                              <p className="font-medium text-emerald-900">
                                {sector.plant?.expectedHarvest ? new Date(sector.plant.expectedHarvest).toLocaleDateString('id-ID') : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pump Control Override */}
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <h3 className="text-slate-800 font-semibold mb-1 flex items-center gap-2">
                            <Power size={20} className={currentPumpStatus === 'ON' ? 'text-emerald-500' : 'text-slate-400'} />
                            Kontrol Pompa
                          </h3>
                          <p className="text-sm text-slate-500 mb-4">Override manual status pompa air.</p>
                        </div>

                        {/* ✅ Water Level Safety Indicator */}
                        {(() => {
                          const wlInfo = getWaterLevelInfo(sector.data.waterLevel);
                          const StatusIcon = wlInfo.status === 'normal'
                            ? CheckCircle2
                            : wlInfo.status === 'sedang'
                              ? AlertTriangle
                              : ShieldAlert;
                          return (
                            <div className={`flex items-start gap-2 p-3 rounded-lg border mb-3 ${wlInfo.bgColor} ${wlInfo.borderColor}`}>
                              <StatusIcon size={16} className={`mt-0.5 flex-shrink-0 ${wlInfo.textColor}`} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-bold ${wlInfo.textColor}`}>
                                    Level Air: {wlInfo.label}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${wlInfo.badgeBg} ${wlInfo.badgeText}`}>
                                    {sector.data.waterLevel.toFixed(1)} cm
                                  </span>
                                </div>
                                <p className={`text-xs mt-0.5 ${wlInfo.textColor} opacity-80`}>
                                  {wlInfo.status === 'normal'
                                    ? `< ${WATER_LEVEL_THRESHOLDS.NORMAL_MAX} cm — pompa aman`
                                    : wlInfo.status === 'sedang'
                                      ? `${WATER_LEVEL_THRESHOLDS.NORMAL_MAX}–${WATER_LEVEL_THRESHOLDS.SEDANG_MAX} cm — pompa aman`
                                      : `> ${WATER_LEVEL_THRESHOLDS.SEDANG_MAX} cm — air rendah`
                                  }
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ scale: currentPumpStatus === 'ON' ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 0.3 }}
                                className={`w-3 h-3 rounded-full ${currentPumpStatus === 'ON' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                              />
                              <span className={`font-bold text-lg ${currentPumpStatus === 'ON' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {currentPumpStatus === 'ON' ? 'MENYALA' : 'MATI'}
                              </span>
                            </div>
                            
                            {/* Toggle button — disabled when water level rendah and pump is OFF (would turn ON) */}
                            {(() => {
                              const wlInfo = getWaterLevelInfo(sector.data.waterLevel);
                              const wouldTurnOn = currentPumpStatus === 'OFF';
                              const isBlocked = wouldTurnOn && !wlInfo.canPump;
                              return (
                                <button
                                  onClick={() => {
                                    if (isBlocked) return; // Blokir di level UI juga
                                    const newStatus = currentPumpStatus === 'ON' ? 'OFF' : 'ON';
                                    setOptimisticPumpStatus(newStatus);
                                    setIsPumpToggling(true);
                                    onTogglePump(sector.id);
                                    setTimeout(() => {
                                      setOptimisticPumpStatus(null);
                                      setIsPumpToggling(false);
                                    }, 10000);
                                  }}
                                  disabled={isPumpToggling || isBlocked}
                                  title={isBlocked ? `Level air rendah (${sector.data.waterLevel.toFixed(1)} cm) — isi ulang sumber air` : undefined}
                                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                                    isBlocked
                                      ? 'bg-red-200 opacity-60 focus:ring-red-400'
                                      : currentPumpStatus === 'ON'
                                        ? 'bg-emerald-500 focus:ring-emerald-500'
                                        : 'bg-slate-300 focus:ring-emerald-500'
                                  } ${isPumpToggling ? 'opacity-50' : ''}`}
                                >
                                  <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-300 shadow-md ${currentPumpStatus === 'ON' ? 'translate-x-11' : 'translate-x-1'}`}>
                                    {isPumpToggling && (
                                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-full h-full flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                      </motion.div>
                                    )}
                                  </span>
                                </button>
                              );
                            })()}
                          </div>
                          
                          {/* Blocked warning banner */}
                          {(() => {
                            const wlInfo = getWaterLevelInfo(sector.data.waterLevel);
                            const wouldTurnOn = currentPumpStatus === 'OFF';
                            if (!wouldTurnOn || wlInfo.canPump) return null;
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-2 text-xs text-red-700 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200"
                              >
                                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                                <span>
                                  <strong>Pompa diblokir.</strong> Level air terlalu rendah ({sector.data.waterLevel.toFixed(1)} cm &gt; 25 cm). Isi ulang sumber air.
                                </span>
                              </motion.div>
                            );
                          })()}

                          {isPumpToggling && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                              <span>Mengirim perintah ke ESP32...</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── IoT Offline Banner ─────────────────────────── */}
                    {isOffline && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-orange-300 bg-orange-50 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-3 bg-orange-100 border-b border-orange-200">
                          <div className="p-1.5 bg-orange-500 rounded-lg">
                            <WifiOff size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-orange-800 text-sm">ESP32 Tidak Merespons</p>
                            <p className="text-xs text-orange-600">
                              Sensor mengirimkan nilai 0 — perangkat mungkin mati atau putus koneksi
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-orange-200 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-orange-700">OFFLINE</span>
                          </div>
                        </div>
                        {/* Body */}
                        <div className="px-5 py-4">
                          {isUsingCache && cachedData ? (
                            <>
                              <div className="flex items-center gap-2 mb-3">
                                <RefreshCw size={14} className="text-orange-500" />
                                <p className="text-sm font-medium text-orange-800">
                                  Menampilkan data terakhir yang valid
                                </p>
                                <span className="ml-auto text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                                  {formatTimeSince(cachedData.cachedAt)} yang lalu
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                  { label: 'Suhu', value: `${cachedData.temperature}°C`, icon: '🌡️' },
                                  { label: 'Cahaya', value: `${cachedData.lightLevel} lux`, icon: '☀️' },
                                  { label: 'Level Air', value: `${cachedData.waterLevel} cm`, icon: '🌊' },
                                ].map(item => (
                                  <div key={item.label} className="bg-white rounded-lg p-3 border border-orange-200 text-center">
                                    <p className="text-lg mb-1">{item.icon}</p>
                                    <p className="text-base font-bold text-orange-800">{item.value}</p>
                                    <p className="text-[10px] text-orange-500">{item.label}</p>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-orange-500 mt-3 text-center">
                                Terakhir diperbarui: {formatFullTimestamp(cachedData.cachedAt)}
                              </p>
                            </>
                          ) : (
                            <div className="text-center py-3">
                              <p className="text-sm text-orange-700 font-medium">Belum ada data sebelumnya yang tersimpan</p>
                              <p className="text-xs text-orange-500 mt-1">
                                Data akan tersimpan otomatis saat ESP32 kembali aktif
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MetricCard 
                        label="Suhu Lingkungan" 
                        value={`${displayData.temperature}°C`} 
                        icon={<Thermometer size={24} />} 
                        color="text-orange-500" 
                        bgColor="bg-orange-50"
                      />
                      <MetricCard 
                        label="Intensitas Cahaya" 
                        value={`${displayData.lightLevel} lux`} 
                        icon={<Sun size={24} />} 
                        color="text-yellow-500" 
                        bgColor="bg-yellow-50"
                      />
                      <MetricCard 
                        label="Level Air Irigasi" 
                        value={`${displayData.waterLevel} cm`} 
                        icon={<Waves size={24} />} 
                        color="text-cyan-500" 
                        bgColor="bg-cyan-50"
                      />
                    </div>

                    {/* Owner Identity & Actions (Moved to Bottom) */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
                        <User size={20} /> Identitas Pemilik & Kontak
                      </h3>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold">
                            {sector.owner?.name?.charAt(0) || ''}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg">{sector.owner?.name || ''}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1"><MapPin size={14} /> {sector.owner?.location || 'N/A'}</span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> Update: {sector.lastUpdate ? new Date(sector.lastUpdate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleWhatsApp}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center"
                        >
                          <MessageCircle size={20} />
                          Hubungi via WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Pump History */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
                        <History size={20} className="text-violet-600" /> Riwayat Aktivitas Pompa
                      </h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {pumpHistory.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <Power size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada riwayat aktivitas pompa</p>
                          </div>
                        ) : (
                          pumpHistory.map((entry, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  entry.action === 'ON' 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-slate-200 text-slate-600'
                                }`}>
                                  <Power size={18} />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">
                                    Pompa <span className={entry.action === 'ON' ? 'text-emerald-600' : 'text-slate-600'}>
                                      {entry.action === 'ON' ? 'DIHIDUPKAN' : 'DIMATIKAN'}
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {formatTimestamp(entry.timestamp)}
                                  </p>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                entry.triggeredBy === 'manual' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {entry.triggeredBy === 'manual' ? 'Manual' : 'Otomatis'}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab Content: Charts */}
                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                      </div>
                    ) : sensorHistory.length === 0 ? (
                      <div className="text-center py-20 text-slate-400">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Belum ada data sensor 24 jam terakhir</p>
                        <p className="text-sm mt-2">Data akan muncul setelah ESP32 mengirimkan data sensor</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <p className="text-sm text-slate-600">
                            <strong>Total Data Points:</strong> {sensorHistory.length} readings dari 24 jam terakhir
                          </p>
                        </div>

                        {/* Temperature Chart */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <h4 className="text-base font-semibold mb-4 text-slate-800 flex items-center gap-2">
                            <Thermometer size={20} className="text-orange-500"/> Grafik Suhu (24 Jam)
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={sensorHistory}>
                              <defs>
                                <linearGradient id="colorTemp24" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis 
                                dataKey="timestamp" 
                                tickFormatter={formatChartTime}
                                tick={{ fontSize: 12 }}
                                stroke="#94a3b8"
                              />
                              <YAxis 
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tick={{ fontSize: 12 }}
                                stroke="#94a3b8"
                                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip 
                                labelFormatter={(label) => `Waktu: ${formatChartTime(label)}`}
                                formatter={(value: any) => [`${value}°C`, 'Suhu']}
                                contentStyle={{ 
                                  borderRadius: '8px', 
                                  border: 'none', 
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                  backgroundColor: 'white'
                                }} 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="temperature" 
                                stroke="#f97316" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorTemp24)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Water Level & Light Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Water Level */}
                          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="text-base font-semibold mb-4 text-slate-800 flex items-center gap-2">
                              <Waves size={20} className="text-cyan-500"/> Level Air (24 Jam)
                            </h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis 
                                  dataKey="timestamp" 
                                  tickFormatter={formatChartTime}
                                  tick={{ fontSize: 11 }}
                                  stroke="#94a3b8"
                                />
                                <YAxis 
                                  tick={{ fontSize: 11 }}
                                  stroke="#94a3b8"
                                  label={{ value: 'cm', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip 
                                  labelFormatter={(label) => `Waktu: ${formatChartTime(label)}`}
                                  formatter={(value: any) => [`${value} cm`, 'Level Air']}
                                  contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'white'
                                  }} 
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="waterLevel" 
                                  stroke="#06b6d4" 
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Light Level */}
                          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="text-base font-semibold mb-4 text-slate-800 flex items-center gap-2">
                              <Sun size={20} className="text-yellow-500"/> Cahaya (24 Jam)
                            </h4>
                            <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis 
                                  dataKey="timestamp" 
                                  tickFormatter={formatChartTime}
                                  tick={{ fontSize: 11 }}
                                  stroke="#94a3b8"
                                />
                                <YAxis 
                                  tick={{ fontSize: 11 }}
                                  stroke="#94a3b8"
                                  label={{ value: 'lux', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip 
                                  labelFormatter={(label) => `Waktu: ${formatChartTime(label)}`}
                                  formatter={(value: any) => [`${value} lux`, 'Cahaya']}
                                  contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'white'
                                  }} 
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="lightLevel" 
                                  stroke="#eab308" 
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Pump Status Timeline */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <h4 className="text-base font-semibold mb-4 text-slate-800 flex items-center gap-2">
                            <Power size={20} className="text-emerald-500"/> Status Pompa (24 Jam)
                          </h4>
                          <div className="overflow-x-auto">
                            <div className="flex items-center gap-2 min-w-full">
                              {sensorHistory.map((data, index) => (
                                <div 
                                  key={index}
                                  className={`flex-shrink-0 w-2 h-12 rounded-sm ${
                                    data.pumpStatus === 'ON' ? 'bg-emerald-500' : 'bg-slate-200'
                                  }`}
                                  title={`${formatChartTime(data.timestamp)} - ${data.pumpStatus}`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                                <span className="text-sm text-slate-600">Pompa ON</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-200 rounded"></div>
                                <span className="text-sm text-slate-600">Pompa OFF</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MetricCard = ({ label, value, icon, color, bgColor }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`${bgColor} ${color} p-3 rounded-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);