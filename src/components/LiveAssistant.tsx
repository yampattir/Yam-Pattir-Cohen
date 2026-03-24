import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Power, Play, Square, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---
const SAMPLE_RATE = 16000;
const CHUNK_SIZE = 4096;

interface LiveAssistantProps {
  apiKey: string;
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ apiKey }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  // --- Audio Utilities ---
  const floatTo16BitPCM = (float32Array: Float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const base64ToFloat32 = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  };

  // --- Playback Logic ---
  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const ctx = audioContextRef.current;
    const chunk = audioQueueRef.current.shift()!;
    
    const audioBuffer = ctx.createBuffer(1, chunk.length, SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(chunk);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    source.onended = () => {
      playNextInQueue();
    };
  };

  // --- Session Management ---
  const startSession = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `
            You are John, a modern voice assistant for Yam Pattir Cohen.
            Yam is a Fashion Business Student based in Paris.
            
            Key details about Yam:
            - Education: ESMOD Fashion Business (ISEM), Paris (Bachelor degree, 2024-Present); Y"D High School, Tel Aviv (2014-2017).
            - Experience:
                - Owner and Founder of Pinzetta Vintage (2022-Present).
                - Marketing and E-commerce Intern at ADJOAA (June-Sept 2025).
                - Project Analyst at Locusview (2021-2022).
                - Mathematics Teacher (2020-Present).
                - Editorial Assistant and Analyst at Israeli Air Force (2018-2020).
            - Languages: English (Native), Hebrew (Native), French (B1).
            
            Your Persona:
            - Name: John.
            - Style: Modern, professional, helpful, articulate.
            - Language: You speak English and French.
            - Accent: You speak with a refined English accent (British).
            - Initial Greeting: When the session starts, you MUST say: "Hello I'm John, what would you like to know about Yam?"
          `,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            startRecording();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const float32 = base64ToFloat32(part.inlineData.data);
                  audioQueueRef.current.push(float32);
                  if (!isPlayingRef.current) {
                    playNextInQueue();
                  }
                }
              }
            }
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopRecording();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection failed.");
            setIsConnected(false);
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to connect:", err);
      setError("Initialization failed.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopRecording();
    setIsConnected(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(CHUNK_SIZE, 1, 1);
      processorRef.current = processor;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      processor.onaudioprocess = (e) => {
        if (!isMuted && sessionRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 128);

          const pcmBuffer = floatTo16BitPCM(inputData);
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));
          
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError("Microphone required.");
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] w-full p-8 bg-white">
      <div className="w-full max-w-sm space-y-10">
        
        {/* Visualizer Area */}
        <div className="relative flex flex-col items-center justify-center gap-6">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer Ring */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${isConnected ? 'border-indigo-100 scale-110' : 'border-slate-100 scale-100'}`} />
            
            {/* Pulsing Core */}
            <motion.div 
              animate={{ 
                scale: isConnected ? [1, 1.05, 1] : 1,
                opacity: isConnected ? [0.8, 1, 0.8] : 0.5
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-500 ${isConnected ? 'bg-indigo-50' : 'bg-slate-50'}`}
            >
              <AnimatePresence mode="wait">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 h-8">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: isMuted ? 4 : [8, 32, 8],
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.6,
                          delay: i * 0.1 
                        }}
                        className="w-1.5 bg-indigo-600 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-3 h-3 bg-slate-300 rounded-full" />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {isConnected ? 'John is Listening' : 'John is Standby'}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              {isConnected ? 'Ask me anything about Yam' : 'Click start to begin conversation'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={isConnected ? stopSession : startSession}
              className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-bold transition-all ${
                isConnected 
                  ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
              }`}
            >
              {isConnected ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  Stop Session
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Start Session
                </>
              )}
            </button>

            {isConnected && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                  isMuted 
                    ? 'bg-red-50 border-red-100 text-red-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-xs font-bold bg-red-50 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
