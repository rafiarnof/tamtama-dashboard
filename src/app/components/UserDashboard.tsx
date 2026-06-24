import { useState, useEffect } from 'react';
import {
  Sprout, LogOut, RefreshCw, Wifi, WifiOff, Search,
  LayoutGrid, User, Droplets, Power, Thermometer, Sun, AlertCircle
} from 'lucide-react';
import { SectorCard } from './SectorCard';
import { SectorDetail } from './SectorDetail';
import { LoadingSpinner } from './LoadingSpinner';
import * as supabaseService from '@/app/services/supabaseService';
import type { UserProfile } from '@/app/services/supabaseAuthService';
import type { Sector } from '@/app/types';
import { canActivatePump, getPumpBlockedMessage } from '@/app/utils/waterLevel';

interface UserDashboardProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export function UserDashboard({ userProfile, onLogout }: UserDashboardProps) {
  const [allSectors, setAllSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dan subscribe ke data sektor
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const data = await supabaseService.getAllSectors();
        setAllSectors(data);
        setIsConnected(true);
      } catch (err) {
        console.error('Error loading sectors:', err);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Polling setiap 5 detik
  useEffect(() => {
    const unsubscribe = supabaseService.subscribeSectors(data => {
      setAllSectors(data);
      setIsConnected(true);
      setLastSyncTime(new Date());
    }, 5000);
    return () => unsubscribe();
  }, []);

  // Filter hanya sektor yang di-assign ke user ini
  const mySectors = allSectors.filter(s =>
    userProfile.assignedSectors.includes(s.sectorId)
  );

  const filteredSectors = mySectors.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSector = allSectors.find(s => s.id === selectedSectorId) || null;

  const handleTogglePump = async (id: string) => {
    const sector = allSectors.find(s => s.id === id);
    if (!sector) return;

    const newStatus = sector.data.pumpStatus === 'ON' ? 'OFF' : 'ON';

    if (newStatus === 'ON' && !canActivatePump(sector.data.waterLevel)) {
      alert(getPumpBlockedMessage(sector.data.waterLevel));
      return;
    }

    try {
      await supabaseService.controlPump(sector.sectorId, newStatus);
      await supabaseService.addPumpHistory(sector.sectorId, newStatus, 'manual');
    } catch (err) {
      console.error('Error toggling pump:', err);
      alert('Gagal mengubah status pompa');
    }
  };

  const pumpOnCount = mySectors.filter(s => s.data.pumpStatus === 'ON').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-[#026644] p-2 rounded-lg text-white">
                <Sprout size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight hidden sm:block">Tamtama</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Sektor Hidroponik Saya</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari sektor..."
                  className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-[#026644] focus:outline-none w-48 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Connection Status */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected ? 'bg-[#e6f2ec] text-[#026644]' : 'bg-red-50 text-red-600'
              }`}>
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span className="hidden sm:inline">{isConnected ? 'Terhubung' : 'Terputus'}</span>
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-700 truncate max-w-28">{userProfile.name}</span>
                  <span className="text-xs text-slate-500">Petani</span>
                </div>
                <div className="w-8 h-8 bg-[#026644] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={onLogout}
                  className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-lg transition-all group"
                  title="Logout"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#026644] to-[#025538] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8fc4aa] text-sm mb-1">Selamat datang,</p>
              <h2 className="text-2xl font-bold">{userProfile.name}</h2>
              <p className="text-[#8fc4aa] text-sm mt-1">
                Anda memiliki <strong className="text-white">{mySectors.length} sektor</strong> yang diassign
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-lg">{pumpOnCount}</span>
                <span className="ml-1 text-[#8fc4aa]">Pompa ON</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-lg">{mySectors.length - pumpOnCount}</span>
                <span className="ml-1 text-[#8fc4aa]">Pompa OFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Error */}
        {!isConnected && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <WifiOff className="text-red-500 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Koneksi terputus</p>
              <p className="text-xs text-red-600 mt-0.5">Mencoba menghubungkan kembali...</p>
            </div>
            <button onClick={() => window.location.reload()} className="text-red-600 hover:text-red-700 text-xs underline flex items-center gap-1">
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : mySectors.length === 0 ? (
          /* No sectors assigned */
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-100 inline-flex p-5 rounded-full mb-4">
              <Sprout size={36} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Sektor</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Anda belum memiliki sektor yang diassign. Hubungi administrator untuk mendapatkan akses sektor.
            </p>
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 inline-flex items-center gap-2 text-sm text-emerald-700">
              <AlertCircle size={16} />
              <span>Hubungi admin untuk assign sektor</span>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Title */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={20} className="text-slate-400" />
                Sektor Saya
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm font-medium">
                  {filteredSectors.length} dari {mySectors.length} sektor
                </span>
                <span className="text-slate-400">
                  Diperbarui: {lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Mobile search */}
            <div className="relative sm:hidden mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sektor..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#026644] focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sector Grid */}
            {filteredSectors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500">Tidak ada sektor yang cocok dengan pencarian</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredSectors.map(sector => (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    onClick={s => setSelectedSectorId(s.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sector Detail Modal */}
      {selectedSector && (
        <SectorDetail
          sector={selectedSector}
          onClose={() => setSelectedSectorId(null)}
          onTogglePump={handleTogglePump}
          onEdit={() => {}} // Users cannot edit sector info
          onDelete={undefined}
        />
      )}
    </div>
  );
}