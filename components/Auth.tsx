import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'verify'>('landing');
  const [formData, setFormData] = useState({ name: '', company: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const user = authService.login(formData.email, formData.password);
        if (user) {
          onLogin(user);
        } else {
          setError('E-mail ou senha inválidos.');
        }
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authService.register(formData.name, formData.email, formData.password, formData.company);
      setView('verify');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSimulateVerification = () => {
      authService.verifyUserEmail(formData.email);
      // Auto login after verify for UX
      const user = authService.login(formData.email, formData.password);
      if(user) onLogin(user);
  };

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="text-center max-w-4xl animate-[fadeIn_0.5s_ease-out]">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-2xl shadow-blue-900/50">
           <i className="fas fa-bullhorn"></i>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">PromoCaster <span className="text-blue-500">AI</span></h1>
        <p className="text-xl text-slate-400 mb-8">
          Automatize sua rádio indoor com inteligência artificial. 
          Crie anúncios com voz neural, agende campanhas e aumente suas vendas.
        </p>
        
        <div className="flex gap-4 justify-center mb-16">
          <button onClick={() => setView('login')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-full transition-all border border-slate-700">
            Entrar
          </button>
          <button onClick={() => setView('register')} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105">
            Testar Grátis
          </button>
        </div>

        {/* Pricing Cards - Highlight Free Trial as Entry, show paid options as future */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {/* Trial / Iniciante */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-green-900/50 hover:border-green-500/50 transition-colors flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-white">Iniciante</h3>
            <div className="text-3xl font-bold mb-1">Grátis</div>
            <div className="text-sm text-green-400 font-bold mb-4 uppercase tracking-wider">Teste por 3 Dias</div>
            <p className="text-xs text-slate-500 mb-4">Após o teste: R$ 29,90/mês</p>
            <ul className="text-sm text-slate-400 space-y-3 mb-6 flex-1">
              <li><i className="fas fa-check text-green-500 mr-2"></i> 1 Propaganda Simultânea</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Limite de 3 Anúncios Salvos</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Voz Padrão (Kore)</li>
            </ul>
            <button onClick={() => setView('register')} className="w-full py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-colors">
              Começar Teste Grátis
            </button>
          </div>

          {/* Pro Monthly */}
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-slate-300">Pro Mensal</h3>
            <div className="text-3xl font-bold mb-1">R$ 59,90</div>
            <div className="text-sm text-slate-500 mb-4">cobrado mensalmente</div>
            <ul className="text-sm text-slate-400 space-y-3 mb-6 flex-1">
              <li><i className="fas fa-check text-blue-500 mr-2"></i> <strong>Propagandas Ilimitadas</strong></li>
              <li><i className="fas fa-check text-blue-500 mr-2"></i> <strong>Todas as 5 Vozes Neurais</strong></li>
              <li><i className="fas fa-check text-blue-500 mr-2"></i> Agendamento de Data/Hora</li>
            </ul>
            <button onClick={() => setView('register')} className="w-full py-2 rounded border border-slate-600 hover:bg-slate-800 text-sm font-bold transition-colors">
              Criar Conta
            </button>
          </div>

          {/* Pro Annual */}
          <div className="bg-gradient-to-b from-purple-900/10 to-slate-900/80 p-6 rounded-xl border border-purple-500/30 hover:border-purple-400 transition-colors flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl">
              MAIS VENDIDO
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Pro Anual</h3>
            <div className="text-3xl font-bold mb-1">R$ 49,90</div>
            <div className="text-sm text-purple-300 mb-4 font-bold">mês (Cobrado anualmente)</div>
            <ul className="text-sm text-slate-400 space-y-3 mb-6 flex-1">
              <li><i className="fas fa-check text-purple-400 mr-2"></i> <strong>Tudo do Plano Pro</strong></li>
              <li><i className="fas fa-check text-purple-400 mr-2"></i> <strong>Economia de 17%</strong></li>
              <li><i className="fas fa-check text-purple-400 mr-2"></i> Pagamento único anual</li>
            </ul>
            <button onClick={() => setView('register')} className="w-full py-2 rounded border border-purple-500/50 hover:bg-purple-900/20 text-purple-200 text-sm font-bold transition-colors">
              Garantir Oferta
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="bg-slate-900 p-8 rounded-lg shadow-2xl border border-slate-800 w-full max-w-md animate-[fadeIn_0.2s_ease-out] text-center">
         <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
             <i className="fas fa-envelope-open-text text-2xl"></i>
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h2>
         <p className="text-slate-400 mb-6">
             Enviamos um link de confirmação para <strong>{formData.email}</strong>. 
             Por favor, confirme seu cadastro para continuar.
         </p>
         
         <div className="bg-slate-800 p-4 rounded text-xs text-slate-500 mb-6 border border-slate-700 border-dashed">
             <p className="mb-2"><strong>Simulação de Sistema:</strong></p>
             <p>Como este é um ambiente de demonstração sem backend de e-mail, clique abaixo para simular a validação.</p>
         </div>

         <button 
           onClick={handleSimulateVerification}
           className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors"
         >
           Simular "Confirmar E-mail"
         </button>
      </div>
    </div>
  );

  const renderForm = (type: 'login' | 'register') => (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="bg-slate-900 p-8 rounded-lg shadow-2xl border border-slate-800 w-full max-w-md animate-[fadeIn_0.2s_ease-out]">
        <button onClick={() => setView('landing')} className="mb-6 text-slate-500 hover:text-white flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Voltar
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">
          {type === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
        </h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={type === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {type === 'register' && (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome Completo</label>
                <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome da Empresa</label>
                <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" 
                  value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">E-mail</label>
            <input required type="email" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" 
               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input required type="password" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none" 
               value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded mt-4 transition-colors">
            {type === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          {type === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'} {' '}
          <button onClick={() => { setError(''); setView(type === 'login' ? 'register' : 'login'); }} className="text-blue-400 hover:underline">
            {type === 'login' ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );

  if (view === 'landing') return renderLanding();
  if (view === 'verify') return renderVerify();
  return renderForm(view);
};