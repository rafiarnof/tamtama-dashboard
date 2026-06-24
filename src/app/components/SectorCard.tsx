import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Thermometer, Activity, Power, Sprout, Sun, WifiOff, Clock } from 'lucide-react';
import type { Sector } from '@/app/types';
import {
  isIoTDataSuspicious,
  getLastValidData,
  formatTimeSince,
} from '@/app/utils/iotHealth';

interface SectorCardProps {
  sector: Sector;
  onClick: (sector: Sector) => void;
}

export const SectorCard: React.FC<SectorCardProps> = ({ sector, onClick }) => {
  const isOffline = isIoTDataSuspicious(sector.data);
  const cachedData = isOffline ? getLastValidData(sector.sectorId) : null;

  const displayData = isOffline && cachedData ? cachedData : sector.data;
  const isUsingCache = isOffline && !!cachedData;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full ${
        isOffline ? 'border-orange-300' : 'border-slate-200'
      }`}
      onClick={() => onClick(sector)}
    >
      {/* IoT Offline Banner */}
      {isOffline && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
          <WifiOff size={13} className="text-orange-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-orange-700">IoT Tidak Merespons</span>
          {isUsingCache && cachedData && (
            <span className="ml-auto text-[10px] text-orange-500 flex items-center gap-1 flex-shrink-0">
              <Clock size={10} />
              {formatTimeSince(cachedData.cachedAt)}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1">
        {/* Header: nama + badge ID & pompa */}
        <div className="flex justify-between items-start mb-4">
          {/* Kiri: nama sektor + tanaman */}
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-lg text-slate-800 truncate">{sector.name}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Sprout size={14} className="text-[#026644] flex-shrink-0" />
              {sector.plant?.name || 'N/A'}
            </p>
          </div>

          {/* Kanan: badge ID + status pompa */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="bg-gradient-to-r from-[#026644] to-[#025538] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md border-2 border-white">
              {sector.sectorId || sector.id}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              sector.data.pumpStatus === 'ON'
                ? 'bg-[#e6f2ec] text-[#026644]'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <Power size={12} />
              {sector.data.pumpStatus}
            </div>
          </div>
        </div>

        {/* Grid Sensor */}
        <div className="grid grid-cols-3 gap-2">
          {/* Suhu */}
          <div className={`p-2 rounded-lg text-center ${isOffline ? 'bg-orange-50/60' : 'bg-slate-50'}`}>
            <div className={`flex justify-center mb-1 ${isOffline ? 'text-orange-400' : 'text-orange-500'}`}>
              <Thermometer size={18} />
            </div>
            <p className={`text-sm font-semibold ${isOffline ? 'text-orange-700' : 'text-slate-700'}`}>
              {displayData.temperature?.toFixed(1) || 0}°C
            </p>
            <p className={`text-[10px] ${isOffline ? 'text-orange-400' : 'text-slate-400'}`}>Suhu</p>
          </div>



          {/* Cahaya */}
          <div className={`p-2 rounded-lg text-center ${isOffline ? 'bg-orange-50/60' : 'bg-slate-50'}`}>
            <div className={`flex justify-center mb-1 ${isOffline ? 'text-orange-400' : 'text-yellow-500'}`}>
              <Sun size={18} />
            </div>
            <p className={`text-sm font-semibold ${isOffline ? 'text-orange-700' : 'text-slate-700'}`}>
              {displayData.lightLevel?.toFixed(0) || 0}
            </p>
            <p className={`text-[10px] ${isOffline ? 'text-orange-400' : 'text-slate-400'}`}>Cahaya</p>
          </div>

          {/* Level Air */}
          <div className={`p-2 rounded-lg text-center ${
            isOffline ? 'bg-orange-50/60' : displayData.waterLevel < 5 ? 'bg-red-50' : 'bg-slate-50'
          }`}>
            <div className={`flex justify-center mb-1 ${
              isOffline ? 'text-orange-400' : displayData.waterLevel < 5 ? 'text-red-500' : 'text-[#026644]'
            }`}>
              <Activity size={18} />
            </div>
            <p className={`text-sm font-semibold ${
              isOffline ? 'text-orange-700' : displayData.waterLevel < 5 ? 'text-red-700' : 'text-slate-700'
            }`}>
              {displayData.waterLevel?.toFixed(1) || 0} cm
            </p>
            <p className={`text-[10px] ${
              isOffline ? 'text-orange-400' : displayData.waterLevel < 5 ? 'text-red-400' : 'text-slate-400'
            }`}>Air</p>
          </div>
        </div>

        {/* Keterangan cache */}
        {isOffline && !cachedData && (
          <p className="text-[10px] text-orange-500 text-center mt-2">
            Belum ada data sebelumnya tersimpan
          </p>
        )}
        {isUsingCache && (
          <p className="text-[10px] text-orange-400 text-center mt-2 italic">
            * Menampilkan data terakhir yang valid
          </p>
        )}
      </div>

      {/* Footer */}
      <div className={`px-5 py-2 border-t text-xs flex justify-between items-center ${
        isOffline ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}>
        <span>{sector.owner?.name || 'N/A'}</span>
        <span>
          {isUsingCache && cachedData
            ? new Date(cachedData.cachedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : sector.lastUpdate
              ? new Date(sector.lastUpdate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              : 'N/A'
          }
        </span>
      </div>
    </motion.div>
  );
};
