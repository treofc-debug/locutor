import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RADIO_STATIONS } from '../constants';
import { generateAdSpeech } from '../services/geminiService';
import { AdCampaign, RadioStation, VolumeSettings } from '../types';

interface PlayerProps {
  ads: AdCampaign[];
  onAdPlayed: (id: string) => void;
  volumes: VolumeSettings;
  manualTrigger: {id: string, ts: number} | null;
}

export const Player: React.FC<PlayerProps> = ({ ads, onAdPlayed, volumes, manualTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentAdText, setCurrentAdText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Aguardando início...");
  
  // Station State
  const [selectedStation, setSelectedStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  
  // HTML Audio element for background music (Radio Stream)
  const musicRef = useRef<HTMLAudioElement | null>(null);
  
  // AudioContext for Voice Ads
  const audioContextRef = useRef<AudioContext | null>(null);

  // Prevent infinite loop on manual trigger
  const lastProcessedTriggerTs = useRef<number>(0);

  // Stale closure fix for error handler
  const currentStationRef = useRef<RadioStation>(RADIO_STATIONS[0]);

  // Sync ref
  useEffect(() => {
    currentStationRef.current = selectedStation;
  }, [selectedStation]);

  // Initialize Music Player
  useEffect(() => {
    musicRef.current = new Audio();
    musicRef.current.loop = true; // For streams this keeps it alive
    musicRef.current.volume = volumes.music; // Initial volume
    
    // Set initial source if not 'off'
    if (selectedStation.url) {
        musicRef.current.src = selectedStation.url;
    }
    
    // Add error handler
    musicRef.current.onerror = (e) => {
      // Only log error if we actually have a URL and we tried to play
      const station = currentStationRef.current;
      if (station.url) {
          // Check event type or message if possible, though 'e' is generic Event
          console.warn("Stream error encountered for:", station.name);
          setStatusMessage("Reconectando...");
          
          // Simple retry logic after 3s
          setTimeout(() => {
             if (musicRef.current && currentStationRef.current.id === station.id && isPlaying) {
                 musicRef.current.load();
                 musicRef.current.play().catch(() => setStatusMessage("Falha na reconexão."));
             }
          }, 3000);
      }
    };

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.src = "";
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []); // Only run once on mount for initialization

  // Update music volume when prop changes, respecting ducking state
  useEffect(() => {
    if (musicRef.current) {
      if (isAdPlaying) {
        // Apply ducking ratio immediately if volume is changed during ad
        musicRef.current.volume = Math.max(0, volumes.music * 0.2);
      } else {
        musicRef.current.volume = volumes.music;
      }
    }
  }, [volumes.music, isAdPlaying]);

  const handleStationChange = (stationId: string) => {
    const station = RADIO_STATIONS.find(s => s.id === stationId);
    if (!station || !musicRef.current) return;

    setSelectedStation(station);

    if (station.id === 'off') {
        musicRef.current.pause();
        musicRef.current.src = ""; // Clear source
        setStatusMessage(isPlaying ? "Sistema Ativo (Apenas Anúncios)" : "Rádio Desligada.");
    } else {
        setStatusMessage(`Carregando ${station.name}...`);
        musicRef.current.src = station.url;
        musicRef.current.load(); // Explicitly load new source
        
        // If system is active, play the new station
        if (isPlaying) {
            musicRef.current.play()
                .then(() => {
                setStatusMessage(`Tocando: ${station.name}`);
                })
                .catch(e => {
                console.error("Playback error on station change:", e);
                setStatusMessage("Erro ao sintonizar estação.");
                });
        } else {
            setStatusMessage("Estação alterada. Pressione Play.");
        }
    }
  };

  const toggleMusic = () => {
    if (!musicRef.current) return;

    if (isPlaying) {
      // STOPPING SYSTEM
      musicRef.current.pause();
      setIsPlaying(false);
      setStatusMessage("Sistema Pausado.");
    } else {
      // STARTING SYSTEM
      
      // AudioContext needs user gesture to start
      if (!audioContextRef.current) {
        const AudioContextPolyfill = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextPolyfill({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume();
      }

      setIsPlaying(true);

      if (selectedStation.id === 'off' || !selectedStation.url) {
         setStatusMessage("Sistema Ativo (Apenas Anúncios)");
      } else {
         setStatusMessage(`Conectando a ${selectedStation.name}...`);
         const playPromise = musicRef.current.play();
         if (playPromise !== undefined) {
            playPromise
            .then(() => {
                setStatusMessage(`No ar: ${selectedStation.name}`);
            })
            .catch(e => {
                console.error("Playback error:", e);
                setStatusMessage("Erro ao iniciar rádio.");
                // Keep isPlaying true so ads still run even if radio fails
            });
         }
      }
    }
  };

  // The logic to play an ad and duck the music
  const playAd = useCallback(async (ad: AdCampaign) => {
    // If context not initialized (system never started), we can't play
    if (!audioContextRef.current && !isPlaying) return;
    
    // If ad is already playing, skip to avoid overlap
    if (isAdPlaying) return;

    try {
      setIsAdPlaying(true);
      setCurrentAdText(`Transmitindo: ${ad.name}...`);
      
      const duckedVolume = Math.max(0, volumes.music * 0.2); // 20% of current volume
      const restoreVolume = volumes.music;
      const isRadioOn = selectedStation.id !== 'off' && selectedStation.url !== '';

      // 1. Duck the music volume (only if radio is on)
      if (musicRef.current && isRadioOn) {
        // Smooth fade out to ducked volume
        const fadeOut = setInterval(() => {
           if (musicRef.current && musicRef.current.volume > duckedVolume + 0.05) {
             musicRef.current.volume -= 0.05;
           } else {
             if(musicRef.current) musicRef.current.volume = duckedVolume;
             clearInterval(fadeOut);
           }
        }, 50);
      }

      // 2. Generate and decode speech
      const audioBuffer = await generateAdSpeech(ad.text, ad.voiceName);

      if (audioBuffer) {
        // Double check audioContext availability
        if (!audioContextRef.current) {
            throw new Error("Audio Context lost");
        }

        // Create source
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;

        // Create GainNode for Ad Volume
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = volumes.ads; // Apply Ad Volume from settings

        // Connect: Source -> Gain -> Destination
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          // 3. Ad finished: Wait 2 seconds (hold ducking), then restore
          setCurrentAdText("Retornando à programação...");
          
          setTimeout(() => {
            if (musicRef.current && isRadioOn) {
               // Smooth fade in to original volume
               const fadeIn = setInterval(() => {
                 if (musicRef.current && musicRef.current.volume < restoreVolume - 0.05) {
                   musicRef.current.volume += 0.05;
                 } else {
                   // Finished fading
                   if(musicRef.current) musicRef.current.volume = restoreVolume;
                   clearInterval(fadeIn);
                   
                   // Update state
                   setIsAdPlaying(false);
                   setCurrentAdText(null);
                   onAdPlayed(ad.id);
                 }
              }, 50);
            } else {
               // No fade in needed if radio is off
               setIsAdPlaying(false);
               setCurrentAdText(null);
               onAdPlayed(ad.id);
            }
          }, 2000); // 2 second delay before restoring volume
        };

        source.start();
      } else {
        // Fallback if gen fails
        setIsAdPlaying(false);
        if (musicRef.current && isRadioOn) musicRef.current.volume = restoreVolume;
      }
    } catch (e) {
      console.error("Ad playback error", e);
      setIsAdPlaying(false);
      if (musicRef.current) musicRef.current.volume = volumes.music;
    }
  }, [isAdPlaying, onAdPlayed, volumes.music, volumes.ads, selectedStation.id, selectedStation.url, isPlaying]);

  // Scheduler Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      if (isAdPlaying) return;

      const now = Date.now();
      
      // Find an ad that is active and due for playback
      const adToPlay = ads.find(ad => {
        if (!ad.active) return false;
        
        // Check Expiration
        if (ad.endDate && new Date(ad.endDate).getTime() < now) return false;

        // Check Start Date (Scheduled for future)
        if (ad.startDate && new Date(ad.startDate).getTime() > now) return false;

        // If never played, play now (with a small initial delay if system just started to avoid blast)
        if (!ad.lastPlayedAt) return true;

        const diffMinutes = (now - ad.lastPlayedAt) / 1000 / 60;
        return diffMinutes >= ad.intervalMinutes;
      });

      if (adToPlay) {
        void playAd(adToPlay);
      }

    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [ads, isPlaying, isAdPlaying, playAd]);

  // Handle Manual Play Trigger
  useEffect(() => {
    // Only proceed if we have a trigger AND it's a new timestamp we haven't processed
    if (manualTrigger && manualTrigger.ts !== lastProcessedTriggerTs.current) {
      
      const ad = ads.find(a => a.id === manualTrigger.id);
      if (ad) {
         // Mark as processed immediately to prevent loops when dependencies change (like ads array after playback)
         lastProcessedTriggerTs.current = manualTrigger.ts;

         if (!audioContextRef.current) {
             setStatusMessage("⚠️ Inicie o sistema para reproduzir");
         } else {
             // If system is paused but context exists, we might need to resume
             if (audioContextRef.current.state === 'suspended') {
                 audioContextRef.current.resume().then(() => playAd(ad));
             } else {
                 playAd(ad);
             }
         }
      }
    }
  }, [manualTrigger, ads, playAd]);

  return (
    <div className="bg-slate-900 border-t border-slate-700 p-4 fixed bottom-0 left-0 w-full z-50 shadow-2xl">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Left: Status & Metadata */}
        <div className="flex items-center gap-4 w-1/3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isPlaying ? 'bg-blue-600 animate-pulse' : 'bg-slate-700'}`}>
            <i className={`fas ${isPlaying ? 'fa-music' : 'fa-radio'} text-white`}></i>
          </div>
          <div className="overflow-hidden w-full">
             {isAdPlaying ? (
                <div className="flex flex-col">
                  <h3 className="text-white font-bold truncate text-yellow-400"><i className="fas fa-bullhorn mr-1"></i> {currentAdText}</h3>
                  <p className="text-xs text-slate-400 truncate">Interrupção Comercial {selectedStation.id !== 'off' && '(Ducking Ativo)'}</p>
                </div>
             ) : (
                <div className="flex flex-col group relative">
                  <label htmlFor="station-select" className="text-xs text-slate-500 absolute -top-3 left-0 opacity-0 group-hover:opacity-100 transition-opacity">Trocar Estação</label>
                  <div className="flex items-center gap-2 w-full">
                    <select 
                      id="station-select"
                      value={selectedStation.id}
                      onChange={(e) => handleStationChange(e.target.value)}
                      className="bg-transparent text-white font-bold border-none outline-none cursor-pointer hover:text-blue-400 transition-colors appearance-none p-0 m-0 w-full truncate pr-4"
                    >
                      {RADIO_STATIONS.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down text-xs text-slate-500 pointer-events-none -ml-4"></i>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {selectedStation.genre} • {statusMessage}
                  </p>
                </div>
             )}
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center justify-center w-1/3 gap-6">
           <button 
             onClick={toggleMusic}
             className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
               isPlaying 
               ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
               : 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
             }`}
             title={isPlaying ? "Pausar Sistema" : "Iniciar Sistema"}
           >
             <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'} text-xl`}></i>
           </button>
        </div>

        {/* Right: Volume / Visualizer Placeholder */}
        <div className="w-1/3 flex justify-end items-center gap-2">
           {isAdPlaying && (
             <div className="flex items-center gap-1 h-8">
               <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite] h-4"></div>
               <div className="w-1 bg-blue-500 animate-[bounce_1.2s_infinite] h-6"></div>
               <div className="w-1 bg-blue-500 animate-[bounce_0.8s_infinite] h-8"></div>
               <div className="w-1 bg-blue-500 animate-[bounce_1.1s_infinite] h-5"></div>
               <div className="w-1 bg-blue-500 animate-[bounce_0.9s_infinite] h-3"></div>
               <span className="ml-2 text-xs text-blue-400 font-mono">ON AIR</span>
             </div>
           )}
           <div className="text-right">
             <div className="text-xs text-slate-500 mb-1">Volumes</div>
             <div className="flex gap-2 text-[10px] text-slate-400">
               <span className={`bg-slate-800 px-1 rounded flex items-center gap-1 ${selectedStation.id === 'off' ? 'opacity-50' : ''}`}>
                 <i className="fas fa-music"></i> {Math.round(volumes.music * 100)}%
               </span>
               <span className="bg-slate-800 px-1 rounded flex items-center gap-1">
                 <i className="fas fa-bullhorn"></i> {Math.round(volumes.ads * 100)}%
               </span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};