
import { User, UserRole, UserPlan } from '../types';
import { generateId } from '../utils/idGenerator';

const USERS_KEY = 'promo_users';
const CURRENT_USER_KEY = 'promo_current_user';

// Initialize with a default admin if empty
const initAuth = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const adminUser: User = {
      id: generateId(),
      name: 'Administrador',
      email: 'admin@promocaster.com',
      passwordHash: 'admin123', // In real app, perform hashing
      role: 'admin',
      plan: 'pro',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      companyName: 'PromoCaster HQ'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
  }
};

initAuth();

export const authService = {
  login: (email: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.passwordHash === password);
    
    if (user) {
      if (!user.emailVerified && user.role !== 'admin') {
        throw new Error("E-mail não verificado. Por favor, confirme seu cadastro.");
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  register: (name: string, email: string, password: string, companyName: string): User => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error("E-mail já cadastrado.");
    }

    const newUser: User = {
      id: generateId(),
      name,
      email,
      passwordHash: password,
      role: 'client',
      plan: 'test',
      emailVerified: false,
      trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      companyName
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  verifyUserEmail: (email: string) => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map(u => {
      if (u.email === email) return { ...u, emailVerified: true };
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  },

  changePassword: (userId: string, newPassword: string) => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === userId) return { ...u, passwordHash: newPassword };
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.passwordHash = newPassword;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  },

  // Admin Methods
  getAllUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  adminCreateUser: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find(u => u.email === userData.email)) {
      throw new Error("E-mail já cadastrado.");
    }

    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  adminUpdateUser: (userId: string, updates: Partial<User>): User[] => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    // Update session if self-updating
    const current = authService.getCurrentUser();
    if (current && current.id === userId) {
      const updatedMe = updatedUsers.find(u => u.id === userId);
      if (updatedMe) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedMe));
    }

    return updatedUsers;
  },

  adminDeleteUser: (userId: string): User[] => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return updatedUsers;
  },

  updateUserPlan: (userId: string, plan: UserPlan, trialEndsAt?: string | null): User[] => {
    return authService.adminUpdateUser(userId, { plan, trialEndsAt });
  }
};
