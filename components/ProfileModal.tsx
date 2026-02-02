import React, { useState } from 'react';
import { UserProfile, VolumeSettings } from '../types';
import { authService } from '../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  volumes: VolumeSettings;
  onUpdateVolumes: (v: VolumeSettings) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  volumes,
  onUpdateVolumes,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'security'>('general');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');

  if (!isOpen) return null;

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setSecurityMsg('As senhas não conferem.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    // In a real app, we would get the ID from context, but here we can assume the logged in user
    // For this mock, we get currentUser from service to get ID
    const user = authService.getCurrentUser();
    if (user) {
        authService.changePassword(user.id, newPassword);
        setSecurityMsg('Senha alterada com sucesso! Um e-mail de confirmação foi enviado.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSecurityMsg(''), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="bg-slate-800 p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-sliders-h text-blue-500"></i> Configurações & Perfil
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
           <button 
             onClick={() => setActiveTab('general')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
           >
             Dados da Empresa
           </button>
           <button 
             onClick={() => setActiveTab('audio')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'audio' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
           >
             Áudio & Volume
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
           >
             Segurança
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          
          {activeTab === 'audio' && (
              <div className="animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
                <i className="fas fa-volume-up mr-2"></i>Controle de Áudio
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                    {/* Music Volume */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between mb-3">
                        <label className="text-white font-medium flex items-center gap-2">
                        <i className="fas fa-music text-green-400"></i> Música Ambiente
                        </label>
                        <span className="text-slate-300 font-mono text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{Math.round(volumes.music * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volumes.music}
                        onChange={(e) => onUpdateVolumes({ ...volumes, music: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    </div>

                    {/* Ad Volume */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between mb-3">
                        <label className="text-white font-medium flex items-center gap-2">
                        <i className="fas fa-bullhorn text-blue-400"></i> Locutor (IA)
                        </label>
                        <span className="text-slate-300 font-mono text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{Math.round(volumes.ads * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volumes.ads}
                        onChange={(e) => onUpdateVolumes({ ...volumes, ads: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    </div>
                </div>
              </div>
          )}

          {activeTab === 'general' && (
              <div className="animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
                <i className="fas fa-building mr-2"></i>Dados da Empresa
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Nome Fantasia</label>
                    <div className="relative">
                        <i className="fas fa-store absolute left-3 top-3 text-slate-500"></i>
                        <input
                            type="text"
                            value={profile.companyName}
                            onChange={(e) => onUpdateProfile({ ...profile, companyName: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Ex: Supermercado Preço Bom"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">CNPJ</label>
                    <div className="relative">
                        <i className="fas fa-file-invoice absolute left-3 top-3 text-slate-500"></i>
                        <input
                            type="text"
                            value={profile.cnpj || ''}
                            onChange={(e) => onUpdateProfile({ ...profile, cnpj: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="00.000.000/0001-00"
                        />
                    </div>
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Slogan / Descrição Curta</label>
                    <textarea
                        value={profile.description || ''}
                        onChange={(e) => onUpdateProfile({ ...profile, description: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none transition-all"
                        placeholder="Ex: O melhor preço da região você encontra aqui..."
                    />
                </div>

                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 mt-6">
                <i className="fas fa-map-marker-alt mr-2"></i>Contato & Localização
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">E-mail</label>
                    <div className="relative">
                        <i className="fas fa-envelope absolute left-3 top-3 text-slate-500"></i>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-3 py-2 text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase font-bold flex gap-2">
                        Telefone / WhatsApp <span className="text-red-500 text-[10px] bg-red-900/20 px-1 rounded">*Obrigatório</span>
                    </label>
                    <div className="relative">
                        <i className="fas fa-phone absolute left-3 top-3 text-slate-500"></i>
                        <input
                            type="tel"
                            value={profile.phone || ''}
                            onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 11) v = v.slice(0, 11);
                                
                                if (v.length > 10) {
                                    v = v.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
                                } else if (v.length > 5) {
                                    v = v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
                                } else if (v.length > 2) {
                                    v = v.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
                                } else if (v.length > 0) {
                                     v = `(${v}`;
                                }
                                
                                onUpdateProfile({ ...profile, phone: v });
                            }}
                            className={`w-full bg-slate-800 border rounded pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${!profile.phone ? 'border-red-500/50 ring-1 ring-red-900' : 'border-slate-700'}`}
                            placeholder="(00) 90000-0000"
                            required
                        />
                    </div>
                    </div>
                    
                    <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Website / Instagram</label>
                    <div className="relative">
                        <i className="fas fa-globe absolute left-3 top-3 text-slate-500"></i>
                        <input
                            type="text"
                            value={profile.website || ''}
                            onChange={(e) => onUpdateProfile({ ...profile, website: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="@suaempresa"
                        />
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Endereço</label>
                        <input
                            type="text"
                            value={profile.address || ''}
                            onChange={(e) => onUpdateProfile({ ...profile, address: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Rua, Número, Bairro"
                        />
                    </div>
                    <div className="col-span-8 md:col-span-4">
                        <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Cidade</label>
                        <input
                            type="text"
                            value={profile.city || ''}
                            onChange={(e) => onUpdateProfile({ ...profile, city: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">UF</label>
                        <input
                            type="text"
                            maxLength={2}
                            value={profile.state || ''}
                            onChange={(e) => onUpdateProfile({ ...profile, state: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none text-center transition-all"
                            placeholder="SP"
                        />
                    </div>
                </div>
              </div>
          )}

          {activeTab === 'security' && (
              <div className="animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
                     <i className="fas fa-lock mr-2"></i>Alterar Senha
                  </h3>
                  
                  {securityMsg && (
                      <div className={`p-3 rounded mb-4 text-sm ${securityMsg.includes('sucesso') ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                          {securityMsg}
                      </div>
                  )}

                  <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Nova Senha</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      
                      <div className="pt-2">
                          <button 
                             onClick={handlePasswordChange}
                             disabled={!newPassword || !confirmPassword}
                             className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-900 py-2 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             <i className="fas fa-key mr-2"></i> Atualizar Senha
                          </button>
                      </div>
                      
                      <div className="mt-6 bg-slate-800 p-4 rounded text-xs text-slate-400">
                          <p><i className="fas fa-info-circle text-blue-400 mr-1"></i> Por segurança, ao alterar sua senha, um e-mail de confirmação será enviado para <strong>{profile.email}</strong>.</p>
                      </div>
                  </div>
              </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-800 border-t border-slate-700 text-right shrink-0">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-8 rounded-lg transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2 ml-auto"
          >
            <i className="fas fa-check"></i> Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
};