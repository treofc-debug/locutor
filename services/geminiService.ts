import { GoogleGenAI, Modality } from "@google/genai";

// Lazy Initialize Gemini Client
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (aiInstance) return aiInstance;

  const key = import.meta.env.VITE_API_KEY;
  if (!key) {
    return null;
  }

  aiInstance = new GoogleGenAI({ apiKey: key });
  return aiInstance;
};

// Helper to decode Base64 to ArrayBuffer
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode audio data for the browser
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateAdSpeech = async (text: string, voiceName: string): Promise<AudioBuffer | null> => {
  try {
    const prompt = `Fale a seguinte mensagem promocional com entusiasmo e energia de um locutor de rádio profissional: "${text}"`;

    const ai = getAi();
    if (!ai) {
      throw new Error("Chave de API do Gemini não configurada (VITE_API_KEY).");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from Gemini");
    }

    // Prepare Audio Context for decoding (using a temporary context just for decoding if needed, 
    // but usually we use the main context. Here we create one just to decode the buffer).
    const AudioContextPolyfill = window.AudioContext || (window as any).webkitAudioContext;
    const tempCtx = new AudioContextPolyfill({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      tempCtx,
      24000,
      1
    );

    // Clean up temp context
    if (tempCtx.state !== 'closed') {
      void tempCtx.close();
    }

    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};