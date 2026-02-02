
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, UserPlan } from '../types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = authService.getAllUsers();
    setUsers(allUsers);

    // Calculate Fake Revenue
    const revenue = allUsers.reduce((acc, user) => {
      if (user.role === 'admin') return acc;
      if (user.plan === 'beginner') return acc + 29.90;
      if (user.plan === 'pro') return acc + 59.90;
      return acc;
    }, 0);
    setTotalRevenue(revenue);
  };

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      authService.adminDeleteUser(userId);
      loadData();
    }
  };

  return (
    <div className="container mx-auto p-6 text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-chart-line text-blue-500"></i> Dashboard Administrativo
        </h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <i className="fas fa-user-plus"></i> Novo Usuário
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm uppercase font-bold mb-1">Faturamento Estimado (Mensal)</div>
          <div className="text-4xl font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm uppercase font-bold mb-1">Total de Clientes</div>
          <div className="text-4xl font-bold text-white">{users.filter(u => u.role !== 'admin').length}</div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm uppercase font-bold mb-1">Planos PRO</div>
          <div className="text-4xl font-bold text-blue-400">{users.filter(u => u.plan === 'pro').length}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700 font-bold">Gerenciamento de Usuários</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                <th className="p-4">Empresa / Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Expiração (Trial)</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map(user => {
                if (user.role === 'admin') return null;
                return (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{user.companyName}</div>
                      <div className="text-xs text-slate-500">{user.name}</div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-300">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        user.plan === 'pro' ? 'bg-blue-900 text-blue-200' :
                        user.plan === 'beginner' ? 'bg-green-900 text-green-200' :
                        'bg-slate-600 text-slate-200'
                      }`}>
                        {user.plan === 'pro' ? 'Plano PRO' : user.plan === 'beginner' ? 'Iniciante' : 'Trial'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {user.plan === 'test' ? (
                        <span className={new Date(user.trialEndsAt || '').getTime() < Date.now() ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : 'Expirado'}
                        </span>
                      ) : (
                        <span className="text-green-500"><i className="fas fa-check-circle mr-1"></i> Vitalício</span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                        title="Editar Usuário"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Excluir Usuário"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={handleCloseModal} 
          onSave={() => {
            loadData();
            handleCloseModal();
          }} 
        />
      )}
    </div>
  );
};

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    passwordHash: user?.passwordHash || '',
    companyName: user?.companyName || '',
    plan: (user?.plan || 'test') as UserPlan,
    trialEndsAt: user?.trialEndsAt ? user.trialEndsAt.substring(0, 16) : '',
    emailVerified: user?.emailVerified ?? true
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        authService.adminUpdateUser(user.id, {
          ...formData,
          trialEndsAt: formData.plan === 'test' ? new Date(formData.trialEndsAt).toISOString() : null
        });
      } else {
        authService.adminCreateUser({
          ...formData,
          role: 'client',
          trialEndsAt: formData.plan === 'test' ? new Date(formData.trialEndsAt).toISOString() : null
        });
      }
      onSave();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-900/30 text-red-300 p-2 text-xs rounded border border-red-900/50">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
              <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Empresa</label>
              <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" 
                value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">E-mail</label>
            <input required type="email" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" 
               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Senha (Visível para Admin)</label>
            <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" 
               value={formData.passwordHash} onChange={e => setFormData({...formData, passwordHash: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Plano</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value as UserPlan})}>
                <option value="test">Iniciante (Trial)</option>
                <option value="beginner">Iniciante (Pago)</option>
                <option value="pro">PRO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Verificado</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                value={formData.emailVerified ? 'yes' : 'no'} onChange={e => setFormData({...formData, emailVerified: e.target.value === 'yes'})}>
                <option value="yes">Sim</option>
                <option value="no">Não</option>
              </select>
            </div>
          </div>

          {formData.plan === 'test' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Expiração do Trial</label>
              <input required type="datetime-local" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" 
                value={formData.trialEndsAt} onChange={e => setFormData({...formData, trialEndsAt: e.target.value})} />
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded shadow-lg transition-colors">
              {user ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
