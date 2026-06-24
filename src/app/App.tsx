import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { LoginPage } from '@/app/components/LoginPage';
import { SetupAdminPage } from '@/app/components/SetupAdminPage';
import { UserDashboard } from '@/app/components/UserDashboard';
import { AdminUserManagement } from '@/app/components/AdminUserManagement';
import { LandingPage } from '@/app/components/LandingPage';
import {
  Sprout, LayoutGrid, Search, Plus, RefreshCw, Wifi, WifiOff,
  LogOut, AlertCircle, MessageCircleOff, Users, Shield, Droplets
} from 'lucide-react';
import * as supabaseService from '@/app/services/supabaseService';
import * as whatsappService from '@/app/services/whatsappService';
import * as supabaseAuthService from '@/app/services/supabaseAuthService';
import type { UserProfile } from '@/app/services/supabaseAuthService';
import type { Sector, AdminSettings } from '@/app/types';
import { SectorCard } from '@/app/components/SectorCard';
import { SectorDetail } from '@/app/components/SectorDetail';
import { SectorFormModal } from '@/app/components/SectorFormModal';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { getEnvVar } from '@/app/utils/env';
import { canActivatePump, getWaterLevelInfo, getPumpBlockedMessage } from '@/app/utils/waterLevel';
import { isIoTDataSuspicious, saveLastValidData } from '@/app/utils/iotHealth';

// Threshold level air kritis (cm)
const CRITICAL_WATER_LEVEL = 5;

// Helper function untuk cek apakah pompa harus ON
// Setiap jam pada menit 0-15 (15 MENIT PENUH)
const shouldPumpBeOn = (): boolean => {
  const now = new Date();
  const minute = now.getMinutes();
  return minute >= 0 && minute < 15;
};

function AppContent() {
  // ========================================
  // AUTH STATE
  // ========================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Landing page — tampilkan di awal jika belum pernah login
  const [showLanding, setShowLanding] = useState(true);

  // Active view for admin: 'sectors' | 'users'
  const [activeView, setActiveView] = useState<'sectors' | 'users'>('sectors');

  // Main state
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Track sectors yang sudah dikasih alert (agar tidak spam)
  const [alertedSectors, setAlertedSectors] = useState<Set<string>>(new Set());

  // Admin settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    id: 'settings',
    adminName: getEnvVar('VITE_ADMIN_NAME') || 'Admin Desa',
    adminPhone: getEnvVar('VITE_ADMIN_PHONE') || '081234567890',
    enableAdminAlert: true,
    enableWargaAlert: true,
    waterThreshold: 5
  });

  // ========================================
  // CHECK AUTH ON MOUNT
  // ========================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek sesi Supabase Auth
        const session = await supabaseAuthService.getSession();
        if (session) {
          const token = session.access_token;
          setAccessToken(token);

          // Ambil profil user
          const profile = await supabaseAuthService.getMyProfile();
          if (profile) {
            setUserProfile(profile);
            setIsAuthenticated(true);
          } else {
            // Sesi ada tapi profil tidak ada
            await supabaseAuthService.logout();
          }
        }

        // Cek apakah setup diperlukan (belum ada admin)
        const { needsSetup: setupRequired } = await supabaseAuthService.checkSetupStatus();
        setNeedsSetup(setupRequired);
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch sectors from Supabase on mount (admin only)
  useEffect(() => {
    if (!isAuthenticated || userProfile?.role !== 'admin') return;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        setIsConnected(true);

        const sectorsData = await supabaseService.getAllSectors();

        if (sectorsData.length === 0) {
          console.log('⚠️  No sectors found. Initializing all 10 default sectors...');
          await supabaseService.forceInitializeAllSectors();
          const newSectors = await supabaseService.getAllSectors();
          setSectors(newSectors);
        } else if (sectorsData.length < 10) {
          console.log(`⚠️  Only ${sectorsData.length} sectors found. Force re-initializing...`);
          await supabaseService.forceInitializeAllSectors();
          const newSectors = await supabaseService.getAllSectors();
          setSectors(newSectors);
        } else {
          setSectors(sectorsData);
        }

        setLastSyncTime(new Date());
      } catch (error) {
        console.error('Error initializing data:', error);
        setIsConnected(false);
        setConnectionError('Gagal menghubungkan ke server. Coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [isAuthenticated, userProfile?.role]);

  // Real-time polling setiap 5 detik (admin only)
  useEffect(() => {
    if (!isAuthenticated || userProfile?.role !== 'admin') return;

    console.log('📡 Setting up Supabase polling (every 5 seconds)...');

    const unsubscribe = supabaseService.subscribeSectors(
      (sectorsData) => {
        try {
          setIsConnected(true);
          setSectors(sectorsData);
          setLastSyncTime(new Date());

          sectorsData.forEach(sector => {
            // Simpan data valid ke cache (untuk fallback saat IoT offline)
            if (!isIoTDataSuspicious(sector.data)) {
              saveLastValidData(sector.sectorId, sector.data, sector.lastUpdate);
            }
            checkSensorConditionsAndAlert(sector);
          });

          console.log(`✅ Polling update: ${sectorsData.length} sectors`);
        } catch (error) {
          console.error('Error processing sectors:', error);
          setIsConnected(false);
          setConnectionError('Gagal menghubungkan ke server.');
        }
      },
      5000
    );

    return () => {
      console.log('🔌 Stopping Supabase polling...');
      unsubscribe();
    };
  }, [isAuthenticated, userProfile?.role]);

  // Load admin settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        setAdminSettings(JSON.parse(savedSettings));
      } catch {}
    }
    whatsappService.logWhatsAppSetupInstructions();
  }, []);

  // Auto-schedule pump system - runs every 30 seconds (admin only)
  useEffect(() => {
    if (!isAuthenticated || userProfile?.role !== 'admin') return;

    const checkAndUpdatePumps = async () => {
      const targetStatus = shouldPumpBeOn() ? 'ON' : 'OFF';

      setSectors(prevSectors =>
        prevSectors.map(sector => {
          if (sector.data.pumpStatus !== targetStatus) {
            if (targetStatus === 'ON' && !canActivatePump(sector.data.waterLevel)) {
              const wlInfo = getWaterLevelInfo(sector.data.waterLevel);
              // Hanya log warning jika benar-benar rendah (bukan "no data")
              if (wlInfo.status === 'rendah') {
                console.warn(
                  `🚫 [AUTO-SCHEDULE] Pompa ${sector.sectorId} (${sector.name}) DIBLOKIR.\n` +
                  `   Level Air: ${sector.data.waterLevel} cm → Status: ${wlInfo.label}`
                );
              }
              return sector;
            }

            const newHistoryEntry = {
              timestamp: new Date().toISOString(),
              action: targetStatus,
              triggeredBy: 'auto' as const
            };

            supabaseService.controlPump(sector.sectorId, targetStatus)
              .catch(err => console.error(`Failed to control pump for ${sector.sectorId}:`, err));

            supabaseService.storePumpHistory(sector.sectorId, targetStatus, 'auto')
              .catch(err => console.error(`Failed to store history for ${sector.sectorId}:`, err));

            sendPumpNotification(sector, targetStatus, 'auto');

            return {
              ...sector,
              data: { ...sector.data, pumpStatus: targetStatus },
              pumpHistory: [newHistoryEntry, ...(sector.pumpHistory || [])]
            };
          }
          return sector;
        })
      );
    };

    checkAndUpdatePumps();
    const interval = setInterval(checkAndUpdatePumps, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, userProfile?.role]);

  // ========================================
  // HELPERS
  // ========================================

  const checkSensorConditionsAndAlert = async (sector: Sector) => {
    try {
      if (adminSettings?.enableAdminAlert || adminSettings?.enableWargaAlert) {
        await whatsappService.checkSensorConditionsAndAlert(
          sector,
          adminSettings.adminPhone,
          adminSettings.adminName
        );
      }
    } catch (error) {
      console.error('Error checking sensor conditions alert:', error);
    }
  };

  const sendPumpNotification = async (
    sector: Sector,
    pumpStatus: 'ON' | 'OFF',
    source: 'manual' | 'auto'
  ) => {
    try {
      const hasValidSectorName = sector.name && sector.name.trim().length > 0;
      const hasValidOwner = sector.owner && sector.owner.phone &&
        sector.owner.phone.trim() !== '-' &&
        sector.owner.phone.trim().toLowerCase() !== 'n/a' &&
        sector.owner.phone.replace(/\D/g, '').length >= 10;

      if (!hasValidSectorName) return;

      if (adminSettings?.enableWargaAlert && hasValidOwner) {
        await whatsappService.sendPumpNotificationToOwner(sector, pumpStatus, source);
      }

      if (adminSettings?.enableAdminAlert && adminSettings?.adminPhone) {
        await whatsappService.sendPumpNotificationToAdmin(
          adminSettings.adminPhone,
          adminSettings.adminName,
          sector,
          pumpStatus,
          source
        );
      }
    } catch (error) {
      console.error('Error mengirim notifikasi pompa:', error);
    }
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const result = await supabaseAuthService.login(email, password);
    if (result.success) {
      const token = await supabaseAuthService.getAccessToken();
      setAccessToken(token);

      // Coba ambil profil user dari server
      const profile = await supabaseAuthService.getMyProfile();
      if (profile) {
        setUserProfile(profile);
        setIsAuthenticated(true);
        // Pastikan setup flag tersimpan
        localStorage.setItem('admin_setup_done', 'true');
        return true;
      }

      // Login Supabase Auth berhasil tapi profil tidak ditemukan di KV store
      // Ini bisa terjadi jika KV store belum ter-populate
      console.error('❌ Login Supabase Auth berhasil, tapi profil tidak ditemukan di KV store.');
      console.error('   Kemungkinan: Setup admin belum selesai, atau ada masalah sinkronisasi data.');
      await supabaseAuthService.logout();
      return false;
    }

    // Login gagal - tampilkan error dari Supabase
    console.error('Login failed:', result.error);
    return false;
  };

  const handleLogout = async () => {
    await supabaseAuthService.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setAccessToken(null);
    setActiveView('sectors');
  };

  const handleSetupComplete = async () => {
    // After setup, get session and profile
    const token = await supabaseAuthService.getAccessToken();
    setAccessToken(token);
    const profile = await supabaseAuthService.getMyProfile();
    if (profile) {
      setUserProfile(profile);
      setIsAuthenticated(true);
    }
    setNeedsSetup(false);
  };

  const handleTogglePump = async (id: string) => {
    const sector = sectors.find(s => s.id === id);
    if (!sector) return;

    const newStatus = sector.data.pumpStatus === 'ON' ? 'OFF' : 'ON';

    if (newStatus === 'ON' && !canActivatePump(sector.data.waterLevel)) {
      const wlInfo = getWaterLevelInfo(sector.data.waterLevel);
      console.warn(
        `🚫 [MANUAL] Pompa ${sector.sectorId} (${sector.name}) DIBLOKIR.\n` +
        `   Level Air: ${sector.data.waterLevel} cm → Status: ${wlInfo.label}`
      );
      alert(getPumpBlockedMessage(sector.data.waterLevel));
      return;
    }

    try {
      await supabaseService.controlPump(sector.sectorId, newStatus);
      await supabaseService.addPumpHistory(sector.sectorId, newStatus, 'manual');
      await sendPumpNotification(sector, newStatus, 'manual');
      console.log(`✅ Pompa ${newStatus} untuk sektor ${sector.name}`);
    } catch (error) {
      console.error('Error toggling pump:', error);
      alert('Gagal mengubah status pompa');
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    try {
      await supabaseService.deleteSector(sector.sectorId);
      console.log(`✅ Sektor ${sector.name} berhasil dihapus`);
      setSectors(prev => prev.filter(s => s.id !== sector.id));
      if (selectedSectorId === sector.id) setSelectedSectorId(null);
    } catch (error) {
      console.error('Error deleting sector:', error);
      alert('Gagal menghapus sektor. Silakan coba lagi.');
    }
  };

  const handleAddClick = () => {
    setEditingSector(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (sector: Sector) => {
    setEditingSector(sector);
    setIsFormOpen(true);
  };

  const handleSaveSector = async (formData: Partial<any>) => {
    try {
      if (editingSector) {
        const updateData = {
          name: formData.name || editingSector.name,
          owner: {
            name: formData.owner || editingSector.owner?.name || '',
            phone: formData.phoneNumber || editingSector.owner?.phone || '',
            location: formData.location || editingSector.owner?.location || ''
          },
          plant: {
            name: formData.cropType || editingSector.plant?.name || '',
            type: formData.cropType?.split(' ')[0] || editingSector.plant?.type || '',
            plantedDate: formData.plantingDate || editingSector.plant?.plantedDate || '',
            expectedHarvest: formData.harvestDate || editingSector.plant?.expectedHarvest || ''
          }
        };

        await supabaseService.updateSector(editingSector.sectorId, updateData);
        setSectors(prev => prev.map(s =>
          s.sectorId === editingSector.sectorId ? { ...s, ...updateData } as Sector : s
        ));
        console.log('✅ Sektor berhasil diupdate di Supabase');
      } else {
        const newId = `SEC-${Date.now().toString().slice(-6)}`;
        const newSectorData = {
          sectorId: newId,
          name: formData.name || 'Sektor Baru',
          owner: {
            name: formData.owner || 'Belum ada pemilik',
            phone: formData.phoneNumber || '',
            location: formData.location || ''
          },
          plant: {
            name: formData.cropType || '',
            type: formData.cropType?.split(' ')[0] || '',
            plantedDate: formData.plantingDate || new Date().toISOString().split('T')[0],
            expectedHarvest: formData.harvestDate || ''
          },
          data: {
            temperature: 0,
            humidity: 0,
            lightLevel: 0,
            waterLevel: 0,
            pumpStatus: 'OFF' as const
          },
          schedule: {
            enabled: true,
            startHour: 4,
            endHour: 19,
            duration: 15
          }
        };

        await supabaseService.createSector(newSectorData);
        const updatedSectors = await supabaseService.getAllSectors();
        setSectors(updatedSectors);
        console.log('✅ Sektor baru berhasil disimpan ke Supabase:', newId);
      }

      setIsFormOpen(false);
      setEditingSector(null);
    } catch (error) {
      console.error('❌ Error menyimpan sektor ke Supabase:', error);
      alert('Gagal menyimpan data. Cek console untuk detail error.');
    }
  };

  const filteredSectors = sectors.filter(sector =>
    sector?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector?.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSector = sectors.find(s => s.id === selectedSectorId) || null;

  // ========================================
  // CONDITIONAL RENDERING
  // ========================================

  // Loading spinner saat cek auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Setup admin pertama kali
  if (needsSetup) {
    return (
      <SetupAdminPage
        onSetupComplete={handleSetupComplete}
        onGoToLogin={() => setNeedsSetup(false)}
      />
    );
  }

  // Login page
  if (!isAuthenticated) {
    // Tampilkan landing page dulu sebelum login
    if (showLanding) {
      return (
        <LandingPage onGoToLogin={() => setShowLanding(false)} />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToSetup={() => setNeedsSetup(true)}
      />
    );
  }

  // Dashboard untuk regular user
  if (userProfile?.role === 'user') {
    return (
      <UserDashboard
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    );
  }

  // ========================================
  // ADMIN DASHBOARD
  // ========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              
              <h1 className="text-xl font-black hidden sm:block text-[#026644]">
                Tam<span className="026644">tama</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Nav Tabs (Admin) */}
              <nav className="hidden sm:flex items-center bg-slate-100 rounded-full p-1">
                <button
                  onClick={() => setActiveView('sectors')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeView === 'sectors'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Sektor</span>
                </button>
                <button
                  onClick={() => setActiveView('users')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeView === 'users'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Users size={14} />
                  <span>Users</span>
                </button>
              </nav>

              {/* Search (only in sectors view) */}
              {activeView === 'sectors' && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Cari sektor atau pemilik..."
                    className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none w-56 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              {/* Add Sector button (only in sectors view) */}
              {activeView === 'sectors' && (
                <button
                  onClick={handleAddClick}
                  className="hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow-md bg-[#026644]"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Tambah Sektor</span>
                </button>
              )}

              {/* Admin Info & Logout */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-700 truncate max-w-28">{userProfile?.name || 'Admin'}</span>
                  
                </div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-lg transition-all group"
                  title="Logout"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="sm:hidden flex items-center gap-2 pb-3">
            <button
              onClick={() => setActiveView('sectors')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeView === 'sectors'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Sektor</span>
            </button>
            <button
              onClick={() => setActiveView('users')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeView === 'users'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Users size={14} />
              <span>Users</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ---- USER MANAGEMENT VIEW ---- */}
        {activeView === 'users' && accessToken && (
          <AdminUserManagement
            accessToken={accessToken}
            sectors={sectors}
          />
        )}

        {/* ---- SECTORS VIEW ---- */}
        {activeView === 'sectors' && (
          <>
            {/* DEV MODE Banner */}
            {getEnvVar('DEV_MODE') === 'true' && (
              <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">🎭 Development Mode Aktif</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Menggunakan data dummy. ESP32 tidak akan terhubung.
                  </p>
                </div>
              </div>
            )}

            {/* WhatsApp Disabled Banner */}
            {getEnvVar('ENABLE_WHATSAPP') !== 'true' && (
              <div className="mb-6 bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center gap-3">
                <MessageCircleOff className="text-gray-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">WhatsApp Alert Dimatikan</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Notifikasi WhatsApp tidak aktif. Ubah ENABLE_WHATSAPP ke true di /env.config.js
                  </p>
                </div>
              </div>
            )}

            {/* Connection Error Banner */}
            {!isConnected && connectionError && (
              <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-amber-100 p-3 rounded-full">
                    <WifiOff className="text-amber-600" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-800 text-lg mb-2">Koneksi Server Terputus</h3>
                    <p className="text-sm text-amber-700 mb-3">
                      Tidak dapat menghubungi Edge Function. Data terakhir mungkin tidak terbaru.
                    </p>
                    <p className="text-xs text-amber-600 mb-3 font-mono bg-amber-100 p-2 rounded">
                      {connectionError}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <RefreshCw size={16} />
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            )}

            {/* Dashboard Content */}
            {!isLoading && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <LayoutGrid className="text-slate-400" />
                    Dashboard Sektor
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      Total: {filteredSectors.length} Sektor
                    </span>
                    {filteredSectors.length > 0 && (
                      <span className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs text-emerald-700 font-medium hidden sm:flex">
                        Sync: {lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSectors.map((sector) => (
                    <SectorCard
                      key={sector.id}
                      sector={sector}
                      onClick={(s) => setSelectedSectorId(s.id)}
                    />
                  ))}
                </div>

                {filteredSectors.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
                        <Sprout size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Tidak ada sektor ditemukan</h3>
                      <p className="text-slate-500 mb-6">Coba kata kunci lain atau tambahkan sektor baru.</p>
                      <button
                        onClick={handleAddClick}
                        className="text-emerald-600 font-medium hover:underline"
                      >
                        Tambah Sektor Baru
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      <SectorDetail
        sector={selectedSector}
        onClose={() => setSelectedSectorId(null)}
        onTogglePump={handleTogglePump}
        onEdit={handleEditClick}
        onDelete={handleDeleteSector}
      />

      {/* Add/Edit Form Modal */}
      <SectorFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSector(null);
        }}
        onSave={handleSaveSector}
        initialData={editingSector || undefined}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}