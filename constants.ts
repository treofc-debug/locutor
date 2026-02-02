import { RadioStation } from './types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'lofi',
    name: 'Lofi / Chill (Ambiente)',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    genre: 'Relaxamento'
  },
  {
    id: 'sertanejo',
    name: 'Sertanejo (Hunter FM)',
    url: 'https://live.hunter.fm/sertanejo_high',
    genre: 'Sertanejo'
  },
  {
    id: 'hits-brasil',
    name: 'MPB (Hunter FM)',
    url: 'https://live.hunter.fm/mpb_high',
    genre: 'MPB / Clássicos'
  },
  {
    id: 'pop',
    name: 'Pop Internacional',
    url: 'https://live.hunter.fm/pop_high',
    genre: 'Pop'
  },
  {
    id: '80s',
    name: 'Anos 80 (Hunter FM)',
    url: 'https://live.hunter.fm/80s_high',
    genre: 'Flashback / 80s'
  },
  {
    id: 'jazz-lounge',
    name: 'Jazz & Swing (Public Domain)',
    url: 'https://relay.publicdomainradio.org/jazz_swing.mp3',
    genre: 'Jazz / Vintage'
  },
  {
    id: 'classical-chill',
    name: 'Clássica Relax (Public Domain)',
    url: 'https://relay.publicdomainradio.org/classical.mp3',
    genre: 'Instrumental / Calmo'
  },
  {
    id: 'off',
    name: '🔴 Rádio Desligada (Apenas Anúncios)',
    url: '',
    genre: 'Silêncio'
  }
];

export const DEFAULT_RADIO_STREAM = RADIO_STATIONS[0].url;

export const SAMPLE_ADS = [
  {
    id: 'c7b3d8e0-5e0f-4f53-8bbf-3998f2f9a6aa',
    name: 'Promoção Relâmpago',
    text: 'Atenção clientes! Promoção relâmpago no setor de bebidas. Cerveja gelada pela metade do preço nos próximos trinta minutos. Aproveite!',
    intervalMinutes: 5,
    lastPlayedAt: null,
    active: true,
    voiceName: 'Fenrir'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Horário de Funcionamento',
    text: 'Lembramos a todos que nossa loja fecha às vinte e duas horas. Façam suas últimas compras com tranquilidade.',
    intervalMinutes: 15,
    lastPlayedAt: null,
    active: false,
    voiceName: 'Kore'
  }
];