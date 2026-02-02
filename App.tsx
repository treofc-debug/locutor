import React, { useState, useEffect } from 'react';
import { AdForm } from './components/AdForm';
import { CampaignList } from './components/CampaignList';
import { Player } from './components/Player';
import { ProfileModal } from './components/ProfileModal';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { UpgradeModal } from './components/UpgradeModal';
import { AdCampaign, UserProfile, VolumeSettings, User, UserPlan } from './types';
import { SAMPLE_ADS } from './constants';
import { generateId } from './utils/idGenerator';
import { authService } from './services/authService';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // App Data State
  const [ads, setAds] = useState<AdCampaign[]>([]);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    companyName: '', 
    email: '',
    cnpj: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    website: '',
    description: ''
  });
  
  const [volumes, setVolumes] = useState<VolumeSettings>({ music: 0.5, ads: 1.0 });
  
  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  
  // Manual Trigger State (Id and Timestamp to force updates)
  const [manualAdTrigger, setManualAdTrigger] = useState<{id: string, ts: number} | null>(null);

  // Initialize Auth
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setCurrentUser(user);
    setLoading(false);
  }, []);

  // Load User Data when logged in
  useEffect(() => {
    if (currentUser && currentUser.role === 'client') {
       const uid = currentUser.id;
       
       const savedAds = localStorage.getItem(`promo_ads_${uid}`);
       setAds(savedAds ? JSON.parse(savedAds) : []); 

       const savedProfile = localStorage.getItem(`promo_profile_${uid}`);
       // Merge saved profile with default structure to ensure new fields exist
       const defaultProfile: UserProfile = {
           companyName: currentUser.companyName || 'Minha Empresa',
           email: currentUser.email,
           cnpj: '',
           phone: '',
           address: '',
           city: '',
           state: '',
           website: '',
           description: ''
       };
       
       if (savedProfile) {
           setUserProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
       } else {
           setUserProfile(defaultProfile);
       }

       const savedVolumes = localStorage.getItem(`promo_volumes_${uid}`);
       setVolumes(savedVolumes ? JSON.parse(savedVolumes) : { music: 0.5, ads: 1.0 });
    }
  }, [currentUser]);

  // Persist User Data
  useEffect(() => {
    if (currentUser && currentUser.role === 'client') {
      const uid = currentUser.id;
      localStorage.setItem(`promo_ads_${uid}`, JSON.stringify(ads));
      localStorage.setItem(`promo_profile_${uid}`, JSON.stringify(userProfile));
      localStorage.setItem(`promo_volumes_${uid}`, JSON.stringify(volumes));
    }
  }, [ads, userProfile, volumes, currentUser]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAds([]); // Clear state
  };

  const handleUpgradeSuccess = (plan: UserPlan) => {
    if (currentUser) {
      // Simulate backend update
      authService.updateUserPlan(currentUser.id, plan);
      // Update local state
      const updated = authService.getCurrentUser();
      setCurrentUser(updated);
    }
  };

  // --- Ad Handlers ---
  const handleAddAd = (newAd: Omit<AdCampaign, 'id' | 'lastPlayedAt'>) => {
    const ad: AdCampaign = {
      ...newAd,
      id: generateId(),
      lastPlayedAt: null,
    };
    setAds(prev => [...prev, ad]);
  };

  const handleToggleActive = (id: string) => {
    const ad = ads.find(a => a.id === id);
    if (!ad) return;

    // If we are activating, check limits
    if (!ad.active) {
      // Logic handled inside CampaignList? No, logic is usually here or checked before
      // But limits are on "active" or "stored"? 
      // The requirement was: "ao atingir o limite mesmo se pausar tambem mantenha o limite do plano"
      // This usually means Stored Limit. The AdForm blocks creation.
      // But for activation, we should probably check MAX ACTIVE just in case.
      // PLAN_LIMITS has maxActiveAds. 
      // Test/Beginner: maxActiveAds = 1.
      
      const limits = currentUser ? (currentUser.plan === 'pro' ? { maxActiveAds: 9999 } : { maxActiveAds: 1 }) : { maxActiveAds: 1 };
      const currentActive = ads.filter(a => a.active).length;
      
      if (currentActive >= limits.maxActiveAds) {
        alert(`Seu plano permite apenas ${limits.maxActiveAds} propaganda(s) ativa(s) simultaneamente. Pause outra para ativar esta.`);
        return;
      }
    }

    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, active: !ad.active } : ad
    ));
  };

  const handleDelete = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  const handleUpdateAd = (id: string, updates: Partial<AdCampaign>) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, ...updates } : ad
    ));
  };

  const handleAdPlayed = (id: string) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, lastPlayedAt: Date.now() } : ad
    ));
  };

  const handlePlayNow = (id: string) => {
    setManualAdTrigger({ id, ts: Date.now() });
  };

  // --- Views ---

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando...</div>;

  // 1. Not Logged In -> Auth / Landing
  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  // 2. Admin View
  if (currentUser.role === 'admin') {
    return (
        <div className="min-h-screen bg-slate-950">
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md">
                <div className="font-bold text-white text-xl">PromoCaster <span className="text-blue-500">Admin</span></div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">Olá, {currentUser.name}</span>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm"><i className="fas fa-sign-out-alt"></i> Sair</button>
                </div>
            </header>
            <AdminDashboard />
        </div>
    );
  }

  // 3. Client View (The Main App)
  const isTrialExpired = currentUser.plan === 'test' && currentUser.trialEndsAt && new Date(currentUser.trialEndsAt).getTime() < Date.now();

  return (
    <div className="min-h-screen pb-24 font-sans bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
               <i className="fas fa-bullhorn"></i>
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white tracking-tight">PromoCaster AI</h1>
               <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Plano:</span>
                  <span className={`uppercase font-bold ${currentUser.plan === 'pro' ? 'text-blue-400' : (currentUser.plan === 'beginner' ? 'text-green-400' : 'text-slate-400')}`}>
                    {currentUser.plan === 'test' ? 'Iniciante (Trial)' : (currentUser.plan === 'beginner' ? 'Iniciante' : 'PRO')}
                  </span>
                  {isTrialExpired && <span className="text-red-500 font-bold ml-2">EXPIRADO</span>}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-white">{userProfile.companyName || currentUser.name}</div>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 transition-colors">Sair</button>
            </div>

            {currentUser.plan !== 'pro' && (
              <button 
                onClick={() => setIsUpgradeOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white text-sm font-bold py-2 px-4 rounded-full shadow-lg shadow-amber-900/40 animate-pulse transition-all"
              >
                <i className="fas fa-crown mr-1"></i> {isTrialExpired ? 'Assinar Agora' : 'Seja PRO'}
              </button>
            )}
            
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-blue-400 transition-colors shadow-sm"
              title="Configurações"
            >
              <i className="fas fa-user-cog"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4 space-y-6">
          {isTrialExpired ? (
              <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-lg text-center">
                  <i className="fas fa-clock text-4xl text-red-500 mb-4"></i>
                  <h2 className="text-xl font-bold text-white mb-2">Período de Teste Finalizado</h2>
                  <p className="text-slate-300 mb-4">Seu período de teste expirou. Escolha um plano para continuar usando o sistema.</p>
                  <button 
                    onClick={() => setIsUpgradeOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold w-full shadow-lg"
                  >
                    <i className="fas fa-rocket mr-2"></i> Ver Planos Disponíveis
                  </button>
              </div>
          ) : (
            <>
              <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                <h2 className="text-blue-200 font-semibold mb-2"><i className="fas fa-info-circle mr-2"></i>Status da Rádio</h2>
                <p className="text-sm text-slate-400">
                  Sistema ativo. O player abaixo gerencia a música e os anúncios automaticamente.
                </p>
              </div>
              <AdForm 
                onAddAd={handleAddAd} 
                userPlan={currentUser.plan} 
                currentAdsCount={ads.length} // Send total count (active + paused) for maxStoredAds check
                userProfile={userProfile}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
              />
            </>
          )}
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-8 h-[600px]">
          <CampaignList 
            ads={ads} 
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            onUpdateAd={handleUpdateAd}
            onPlayNow={handlePlayNow}
          />
        </div>

      </main>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={userProfile}
        onUpdateProfile={setUserProfile}
        volumes={volumes}
        onUpdateVolumes={setVolumes}
      />

      <UpgradeModal 
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onConfirmUpgrade={handleUpgradeSuccess}
      />

      {/* Player Footer */}
      <Player 
        ads={ads} 
        onAdPlayed={handleAdPlayed} 
        volumes={volumes}
        manualTrigger={manualAdTrigger}
      />
    </div>
  );
};

export default App;