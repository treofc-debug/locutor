export interface AdCampaign {
  id: string;
  name: string;
  text: string;
  intervalMinutes: number;
  lastPlayedAt: number | null;
  active: boolean;
  voiceName: string;
  startDate?: string | null; // ISO string for start schedule
  endDate?: string | null; // ISO string for expiration
}

export enum VoiceOption {
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Puck = 'Puck',
  Charon = 'Charon',
  Zephyr = 'Zephyr'
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isAdPlaying: boolean;
  currentAdName?: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  genre: string;
}

export interface UserProfile {
  companyName: string;
  email: string;
  // Extended Details
  cnpj?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  description?: string;
}

export interface VolumeSettings {
  music: number;
  ads: number;
}

// --- New Auth & Plan Types ---

export type UserRole = 'admin' | 'client';
export type UserPlan = 'test' | 'beginner' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean; // New field for verification status
  passwordHash: string; // Simulated hash
  role: UserRole;
  plan: UserPlan;
  trialEndsAt?: string | null; // For 'test' plan
  createdAt: string;
  companyName?: string;
}

export const PLAN_LIMITS = {
  test: {
    maxActiveAds: 1,
    maxStoredAds: 3, // Total allowed to create/store
    allowedVoices: [VoiceOption.Kore],
    canScheduleEndDate: false,
    label: 'Plano Iniciante (Trial)'
  },
  beginner: {
    maxActiveAds: 1,
    maxStoredAds: 3,
    allowedVoices: [VoiceOption.Kore],
    canScheduleEndDate: false,
    label: 'Plano Iniciante'
  },
  pro: {
    maxActiveAds: 9999,
    maxStoredAds: 9999,
    allowedVoices: Object.values(VoiceOption),
    canScheduleEndDate: true,
    label: 'Plano PRO'
  }
};