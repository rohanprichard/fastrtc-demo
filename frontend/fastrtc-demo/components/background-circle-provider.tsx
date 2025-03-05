"use client"

import { useState, useEffect, useRef } from "react";
import { BackgroundCircles } from "@/components/ui/background-circles";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { WebRTCClient } from "@/lib/webrtc-client";

export function BackgroundCircleProvider() {
    const [currentVariant, setCurrentVariant] = 
        useState<keyof typeof COLOR_VARIANTS>("octonary");
    const [isConnected, setIsConnected] = useState(false);
    const [webrtcClient, setWebrtcClient] = useState<WebRTCClient | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Get all available variants
    const variants = Object.keys(
        COLOR_VARIANTS
    ) as (keyof typeof COLOR_VARIANTS)[];

    // Function to change to the next color variant
    const changeVariant = () => {
        const currentIndex = variants.indexOf(currentVariant);
        const nextVariant = variants[(currentIndex + 1) % variants.length];
        setCurrentVariant(nextVariant);
    };

    useEffect(() => {
        // Initialize WebRTC client
        const client = new WebRTCClient({
            onConnected: () => setIsConnected(true),
            onDisconnected: () => setIsConnected(false),
            onAudioStream: (stream) => {
                if (audioRef.current) {
                    audioRef.current.srcObject = stream;
                }
            },
            onAudioLevel: (level) => {
                setAudioLevel(level);
            }
        });
        setWebrtcClient(client);

        return () => {
            client.disconnect();
        };
    }, []);

    const handleStart = () => {
        webrtcClient?.connect();
    };

    const handleStop = () => {
        webrtcClient?.disconnect();
    };

    return (
        <div 
            className="relative w-full h-full"
            onClick={changeVariant} // Add click handler to change color
        >
            <BackgroundCircles 
                variant={currentVariant} 
                audioLevel={audioLevel}
                isActive={isConnected}
            />
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