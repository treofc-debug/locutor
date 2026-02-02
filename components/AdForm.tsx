import React, { useState } from 'react';
import { AdCampaign, VoiceOption, UserPlan, PLAN_LIMITS, UserProfile } from '../types';

interface AdFormProps {
  onAddAd: (ad: Omit<AdCampaign, 'id' | 'lastPlayedAt'>) => void;
  userPlan: UserPlan;
  currentAdsCount: number;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenUpgrade: () => void;
}

export const AdForm: React.FC<AdFormProps> = ({ onAddAd, userPlan, currentAdsCount, userProfile, onOpenProfile, onOpenUpgrade }) => {
  const limits = PLAN_LIMITS[userPlan];
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [interval, setInterval] = useState(10);
  const [voice, setVoice] = useState<string>(VoiceOption.Kore);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Check limits based on TOTAL STORED ads, not just active ones
  const isLimitReached = currentAdsCount >= limits.maxStoredAds;
  const isProfileIncomplete = !userProfile.phone || userProfile.phone.trim() === '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached || isProfileIncomplete) return;
    if (!name || !text) return;

    onAddAd({
      name,
      text,
      intervalMinutes: interval,
      active: true,
      voiceName: voice,
      startDate: startDate || null,
      endDate: endDate || null
    });

    // Reset form
    setName('');
    setText('');
    setInterval(10);
    setStartDate('');
    setEndDate('');
    setVoice(limits.allowedVoices[0]);
  };

  if (isProfileIncomplete) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-yellow-600/50 relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <i className="fas fa-plus-circle text-slate-500"></i> Nova Propaganda
        </h3>
        <div className="bg-yellow-900/20 p-4 rounded text-center border border-yellow-700/50">
           <i className="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-2"></i>
           <h4 className="text-white font-bold mb-2">Perfil Incompleto</h4>
           <p className="text-sm text-slate-300 mb-4">
             Para criar anúncios, é obrigatório preencher seus dados de contato (Telefone/WhatsApp) para segurança da plataforma.
           </p>
           <button 
             onClick={onOpenProfile}
             className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded transition-colors"
           >
             Completar Perfil Agora
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 relative overflow-hidden">
      
      {/* Plan Badge */}
      <div className="absolute top-0 right-0 bg-slate-700 text-xs px-2 py-1 rounded-bl text-slate-300 border-b border-l border-slate-600">
        {limits.label}
      </div>

      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <i className="fas fa-plus-circle text-blue-500"></i> Nova Propaganda
      </h3>

      {isLimitReached ? (
        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded text-center">
          <p className="text-red-300 font-bold mb-2">Limite do Plano Atingido</p>
          <p className="text-sm text-slate-400 mb-3">
            Seu plano atual ({limits.label}) permite armazenar apenas {limits.maxStoredAds} propaganda(s).
            Remova uma propaganda antiga ou faça upgrade.
          </p>
          {userPlan !== 'pro' && (
             <button 
               onClick={onOpenUpgrade}
               className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-full text-sm shadow-lg shadow-amber-900/30 transition-all transform hover:scale-105"
             >
               <i className="fas fa-crown mr-1"></i> Faça upgrade para o plano PRO
             </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Campanha</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Promoção Carnes"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Texto do Locutor (IA)</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Escreva o texto que o locutor deve falar..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Intervalo (Minutos)</label>
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Voz do Locutor 
                {userPlan !== 'pro' && <i className="fas fa-lock text-xs ml-2 text-yellow-500" title="Upgrade para desbloquear mais vozes"></i>}
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {/* Only show allowed voices or show all but disable them? Better to show allowed. */}
                {Object.values(VoiceOption).map((v) => {
                  const isAllowed = limits.allowedVoices.includes(v);
                  if (!isAllowed) return null; 
                  return <option key={v} value={v}>{v}</option>
                })}
              </select>
              {userPlan !== 'pro' && (
                <p className="text-[10px] text-slate-500 mt-1 cursor-pointer hover:text-blue-400" onClick={onOpenUpgrade}>
                   <i className="fas fa-arrow-up"></i> Upgrade para liberar mais vozes
                </p>
              )}
            </div>
          </div>

          <div className={`border border-slate-700 rounded p-3 bg-slate-900/30 ${!limits.canScheduleEndDate ? 'opacity-60' : ''}`}>
             <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-medium text-blue-300 flex items-center gap-2">
                    <i className="fas fa-calendar-alt"></i> Agendamento
                 </label>
                 {!limits.canScheduleEndDate && (
                    <span 
                        className="text-yellow-500 text-xs cursor-pointer hover:underline bg-yellow-900/20 px-2 py-1 rounded"
                        onClick={onOpenUpgrade}
                    >
                        <i className="fas fa-crown mr-1"></i> Requer Plano PRO
                    </span>
                 )}
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs text-slate-500 mb-1">Início (Opcional)</label>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={!limits.canScheduleEndDate}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs disabled:cursor-not-allowed"
                    />
                 </div>
                 <div>
                    <label className="block text-xs text-slate-500 mb-1">Término (Opcional)</label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={!limits.canScheduleEndDate}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs disabled:cursor-not-allowed"
                    />
                 </div>
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-save"></i> Agendar Propaganda
          </button>
        </form>
      )}
    </div>
  );
};