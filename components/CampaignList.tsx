import React, { useState } from 'react';
import { AdCampaign } from '../types';

interface CampaignListProps {
  ads: AdCampaign[];
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAd: (id: string, updates: Partial<AdCampaign>) => void;
  onPlayNow: (id: string) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ ads, onToggleActive, onDelete, onUpdateAd, onPlayNow }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');

  const handleStartEdit = (ad: AdCampaign) => {
    if (editingId === ad.id) {
        setEditingId(null);
    } else {
        setEditingId(ad.id);
        setEditDate(ad.endDate || '');
    }
  };

  const handleSaveEdit = (id: string) => {
    onUpdateAd(id, { endDate: editDate || null });
    setEditingId(null);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 h-full overflow-y-auto">
      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <i className="fas fa-list-ul text-green-500"></i> Propagandas Agendadas
      </h3>
      
      {ads.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Nenhuma propaganda agendada.</p>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => {
             const now = Date.now();
             const isExpired = ad.endDate && new Date(ad.endDate).getTime() < now;
             const isScheduledFuture = ad.startDate && new Date(ad.startDate).getTime() > now;
             
             return (
              <div 
                key={ad.id} 
                className={`p-4 rounded border transition-all ${
                  isExpired ? 'bg-red-900/10 border-red-900/30' : 
                  isScheduledFuture ? 'bg-yellow-900/10 border-yellow-700/30' :
                  ad.active ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-bold text-lg ${isExpired ? 'text-red-300' : (isScheduledFuture ? 'text-yellow-200' : 'text-white')}`}>
                        {ad.name}
                        {isExpired && <span className="ml-2 text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded font-bold">EXPIRADO</span>}
                        {isScheduledFuture && <span className="ml-2 text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded font-bold border border-yellow-500/30"><i className="fas fa-hourglass-start mr-1"></i> Aguardando</span>}
                      </h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">
                          <i className="fas fa-clock mr-1"></i> A cada {ad.intervalMinutes} min
                        </span>
                        <span className="text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">
                          <i className="fas fa-microphone mr-1"></i> {ad.voiceName}
                        </span>
                        
                        {ad.startDate && !isExpired && (
                            <span className="text-yellow-300 bg-yellow-900/30 px-2 py-0.5 rounded">
                              <i className="fas fa-play-circle mr-1"></i> Início: {new Date(ad.startDate).toLocaleString()}
                            </span>
                        )}

                        {ad.endDate && !isExpired && (
                            <span className="text-sky-300 bg-sky-900/30 px-2 py-0.5 rounded">
                              <i className="fas fa-hourglass-end mr-1"></i> Até: {new Date(ad.endDate).toLocaleString()}
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => onPlayNow(ad.id)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-lg shadow-blue-900/50"
                      title="Reproduzir Agora"
                    >
                      <i className="fas fa-bullhorn text-xs"></i>
                    </button>

                    <button 
                      onClick={() => handleStartEdit(ad)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          editingId === ad.id ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title="Editar Validade"
                    >
                      <i className="fas fa-pen text-xs"></i>
                    </button>
                    <button 
                      onClick={() => onToggleActive(ad.id)}
                      disabled={!!isExpired}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isExpired 
                           ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                           : ad.active ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                      title={isExpired ? "Expirado" : (ad.active ? "Desativar" : "Ativar")}
                    >
                      <i className={`fas ${ad.active ? 'fa-pause' : 'fa-play'} text-white text-xs`}></i>
                    </button>
                    <button 
                      onClick={() => onDelete(ad.id)}
                      className="w-8 h-8 rounded-full bg-red-900/50 hover:bg-red-900 text-red-400 flex items-center justify-center transition-colors"
                      title="Excluir"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
                
                {editingId === ad.id && (
                    <div className="mb-3 mt-2 bg-slate-900 p-3 rounded border border-blue-500/30 animate-[fadeIn_0.2s_ease-out]">
                        <label className="block text-xs text-blue-300 mb-1">Editar Data de Término</label>
                        <div className="flex gap-2">
                            <input 
                                type="datetime-local" 
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <button 
                                onClick={() => handleSaveEdit(ad.id)}
                                className="bg-green-600 hover:bg-green-500 text-white px-3 rounded text-sm"
                            >
                                <i className="fas fa-check"></i>
                            </button>
                            <button 
                                onClick={() => {
                                    setEditDate(''); // Clear date implies renewal/eternal
                                    onUpdateAd(ad.id, { endDate: null });
                                    setEditingId(null);
                                }}
                                className="bg-slate-600 hover:bg-slate-500 text-white px-3 rounded text-sm"
                                title="Remover data (Tornar Eterna)"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                )}
                
                <p className="text-slate-400 text-sm italic line-clamp-2">"{ad.text}"</p>
                
                <div className="mt-3 text-xs text-slate-500 flex justify-between items-center">
                  <span>Última reprodução: {ad.lastPlayedAt ? new Date(ad.lastPlayedAt).toLocaleTimeString() : 'Nunca'}</span>
                  {ad.active && !isExpired && !isScheduledFuture && <span className="text-green-500 animate-pulse">● Agendado</span>}
                </div>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
};