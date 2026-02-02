import React, { useState } from 'react';
import { UserPlan } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpgrade: (plan: UserPlan) => void;
}

type PurchaseOption = 'beginner' | 'pro_monthly' | 'pro_annual';

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onConfirmUpgrade }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedOption, setSelectedOption] = useState<PurchaseOption>('pro_annual');

  if (!isOpen) return null;

  const handlePurchase = () => {
    setStatus('processing');
    // Determine the actual plan type (UserPlan) based on selection
    const planType: UserPlan = selectedOption === 'beginner' ? 'beginner' : 'pro';

    // Simulate API call / Payment gateway
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onConfirmUpgrade(planType);
        setStatus('idle');
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(30,58,138,0.2)] w-full max-w-5xl overflow-hidden relative animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[95vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>

        {status === 'processing' ? (
           <div className="p-12 flex flex-col items-center justify-center text-center h-[500px]">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-white mb-2">Processando Pagamento Seguro...</h3>
              <p className="text-slate-400">Aguarde enquanto confirmamos sua assinatura.</p>
           </div>
        ) : status === 'success' ? (
           <div className="p-12 flex flex-col items-center justify-center text-center h-[500px]">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mb-6 animate-[bounce_0.5s_ease-out]">
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Compra Realizada com Sucesso!</h3>
              <p className="text-slate-300">Seu plano foi atualizado. Aproveite!</p>
           </div>
        ) : (
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-8 text-center bg-slate-800 border-b border-slate-700">
               <h2 className="text-3xl font-bold text-white mb-2">Escolha o plano ideal para sua empresa</h2>
               <p className="text-slate-400">Desbloqueie recursos e aumente suas vendas com anúncios inteligentes.</p>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-6 bg-slate-900">
               
               {/* Option 1: Iniciante */}
               <div 
                 onClick={() => setSelectedOption('beginner')}
                 className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col ${selectedOption === 'beginner' ? 'border-green-500 bg-green-900/10 shadow-lg' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
               >
                  <h3 className="text-xl font-bold text-white mb-2">Iniciante</h3>
                  <div className="text-3xl font-bold text-white mb-4">R$ 29,90<span className="text-sm font-normal text-slate-400">/mês</span></div>
                  <ul className="text-sm text-slate-300 space-y-3 mb-8 flex-1">
                    <li><i className="fas fa-check text-green-500 mr-2"></i> 1 Propaganda Ativa</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i> Limite de 3 Salvas</li>
                    <li><i className="fas fa-check text-green-500 mr-2"></i> Voz Padrão (Kore)</li>
                    <li className="text-slate-500"><i className="fas fa-times mr-2"></i> Sem agendamento de data</li>
                  </ul>
                  <div className={`w-full py-2 rounded text-center font-bold text-sm ${selectedOption === 'beginner' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {selectedOption === 'beginner' ? 'Selecionado' : 'Selecionar'}
                  </div>
               </div>

               {/* Option 2: Pro Monthly */}
               <div 
                 onClick={() => setSelectedOption('pro_monthly')}
                 className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col ${selectedOption === 'pro_monthly' ? 'border-blue-500 bg-blue-900/10 shadow-lg' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
               >
                  <h3 className="text-xl font-bold text-white mb-2">Pro Mensal</h3>
                  <div className="text-3xl font-bold text-white mb-4">R$ 59,90<span className="text-sm font-normal text-slate-400">/mês</span></div>
                  <ul className="text-sm text-slate-300 space-y-3 mb-8 flex-1">
                    <li><i className="fas fa-check text-blue-500 mr-2"></i> <strong>Propagandas Ilimitadas</strong></li>
                    <li><i className="fas fa-check text-blue-500 mr-2"></i> <strong>5 Vozes Neurais</strong></li>
                    <li><i className="fas fa-check text-blue-500 mr-2"></i> Agendamento Completo</li>
                    <li><i className="fas fa-check text-blue-500 mr-2"></i> Suporte Prioritário</li>
                  </ul>
                  <div className={`w-full py-2 rounded text-center font-bold text-sm ${selectedOption === 'pro_monthly' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {selectedOption === 'pro_monthly' ? 'Selecionado' : 'Selecionar'}
                  </div>
               </div>

               {/* Option 3: Pro Annual */}
               <div 
                 onClick={() => setSelectedOption('pro_annual')}
                 className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col transform md:-translate-y-4 shadow-xl ${selectedOption === 'pro_annual' ? 'border-purple-500 bg-purple-900/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
               >
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest rounded-t-lg">
                    Mais Vendido - Economize 17%
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 mt-4">Pro Anual</h3>
                  <div className="text-3xl font-bold text-white mb-1">R$ 49,90<span className="text-sm font-normal text-slate-400">/mês</span></div>
                  <div className="text-xs text-purple-300 mb-4 font-bold">Cobrado R$ 598,80 anualmente</div>
                  
                  <ul className="text-sm text-slate-300 space-y-3 mb-8 flex-1">
                    <li><i className="fas fa-star text-yellow-400 mr-2"></i> <strong>Tudo do Pro Mensal</strong></li>
                    <li><i className="fas fa-check text-purple-400 mr-2"></i> <strong>Melhor Custo-Benefício</strong></li>
                    <li><i className="fas fa-check text-purple-400 mr-2"></i> Setup Inicial Grátis</li>
                  </ul>
                  <div className={`w-full py-2 rounded text-center font-bold text-sm ${selectedOption === 'pro_annual' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {selectedOption === 'pro_annual' ? 'Selecionado' : 'Selecionar'}
                  </div>
               </div>

            </div>

            <div className="p-6 bg-slate-800 border-t border-slate-700 mt-auto">
               <button 
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
               >
                  <span>Confirmar Assinatura ({selectedOption === 'beginner' ? 'Iniciante' : selectedOption === 'pro_annual' ? 'Pro Anual' : 'Pro Mensal'})</span>
                  <i className="fas fa-arrow-right"></i>
               </button>
               <p className="text-center text-xs text-slate-500 mt-4">
                 Pagamento seguro processado via SSL. Cancelamento disponível a qualquer momento para planos mensais.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};