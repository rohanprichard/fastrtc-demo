"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { BackgroundCircles } from "@/components/ui/background-circles";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { AudioDeviceSelector } from "@/components/ui/audio-device-selector";
import { WebRTCClient } from "@/lib/webrtc-client";

export function BackgroundCircleProvider() {
    const [currentVariant, setCurrentVariant] = 
        useState<keyof typeof COLOR_VARIANTS>("octonary");
    const [isConnected, setIsConnected] = useState(false);
    const [webrtcClient, setWebrtcClient] = useState<WebRTCClient | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const clientRef = useRef<WebRTCClient | null>(null);
    const outputDeviceIdRef = useRef<string | undefined>(undefined);

    // Memoize callbacks to prevent recreation on each render
    const handleConnected = useCallback(() => setIsConnected(true), []);
    const handleDisconnected = useCallback(() => setIsConnected(false), []);
    
    const handleAudioStream = useCallback((stream: MediaStream) => {
        if (!audioRef.current) return;
        
        audioRef.current.srcObject = stream;
        
        // If the browser supports setSinkId and we have an output device ID
        if ('setSinkId' in HTMLAudioElement.prototype && outputDeviceIdRef.current) {
            try {
                (audioRef.current as any).setSinkId(outputDeviceIdRef.current)
                    .catch((err: any) => {
                        console.error('Error setting audio output device:', err);
                    });
            } catch (err) {
                console.error('Error applying setSinkId:', err);
            }
        }
    }, []);
    
    const handleAudioLevel = useCallback((level: number) => {
        // Apply some smoothing to the audio level
        setAudioLevel(prev => prev * 0.7 + level * 0.3);
    }, []);

    // Get all available variants
    const variants = Object.keys(
        COLOR_VARIANTS
    ) as (keyof typeof COLOR_VARIANTS)[];

    // Function to change to the next color variant - for background click
    const changeVariant = useCallback(() => {
        const currentIndex = variants.indexOf(currentVariant);
        const nextVariant = variants[(currentIndex + 1) % variants.length];
        setCurrentVariant(nextVariant);
    }, [currentVariant, variants]);

    useEffect(() => {
        // Initialize WebRTC client with memoized callbacks
        const client = new WebRTCClient({
            onConnected: handleConnected,
            onDisconnected: handleDisconnected,
            onAudioStream: handleAudioStream,
            onAudioLevel: handleAudioLevel
        });
        
        setWebrtcClient(client);
        clientRef.current = client;

        return () => {
            client.disconnect();
            clientRef.current = null;
        };
    }, [handleConnected, handleDisconnected, handleAudioStream, handleAudioLevel]);

    const handleStart = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.connect().catch(error => {
                console.error('Failed to connect:', error);
            });
        }
    }, []);

    const handleStop = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
        }
    }, []);

    // Handle device change
    const handleDeviceChange = useCallback((deviceId: string, type: 'input' | 'output') => {
        if (!clientRef.current) return;
        
        if (type === 'input') {
            clientRef.current.setAudioInputDevice(deviceId);
        } else if (type === 'output') {
            clientRef.current.setAudioOutputDevice(deviceId);
            outputDeviceIdRef.current = deviceId;
            
            // If we're already connected, try to apply the output device
            if (audioRef.current && audioRef.current.srcObject && 
                'setSinkId' in HTMLAudioElement.prototype) {
                try {
                    (audioRef.current as any).setSinkId(deviceId)
                        .catch((err: any) => {
                            console.error('Error setting audio output device:', err);
                        });
                } catch (err) {
                    console.error('Error applying setSinkId:', err);
                }
            }
        }
    }, []);

    return (
        <div 
            className="relative w-full h-full" 
            onClick={changeVariant} // Keep click handler to change color on background click
        >
            <BackgroundCircles 
                variant={currentVariant} 
                audioLevel={audioLevel}
                isActive={isConnected}
            />
            
            {/* Audio Device Selector - Responsive positioning */}
            <div className="absolute top-12 left-0 right-0 p-4 z-10 flex justify-center pointer-events-none">
                <div className="w-full max-w-[250px] sm:max-w-[400px] pointer-events-auto">
                    <AudioDeviceSelector onChange={handleDeviceChange} />
                </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
                <AIVoiceInput 
                    onStart={handleStart}
                    onStop={handleStop}
                    isConnected={isConnected}
                />
            </div>
            <audio ref={audioRef} autoPlay hidden />
        </div>
    );
}

export default { BackgroundCircleProvider }

const COLOR_VARIANTS = {
    primary: {
        border: [
            "border-emerald-500/60",
            "border-cyan-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-emerald-500/30",
    },
    secondary: {
        border: [
            "border-violet-500/60",
            "border-fuchsia-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-violet-500/30",
    },
    senary: {
        border: [
            "border-blue-500/60",
            "border-sky-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-blue-500/30",
    }, // blue
    octonary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    },
} as const;