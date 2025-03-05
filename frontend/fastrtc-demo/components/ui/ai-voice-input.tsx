"use client";

import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  isConnected?: boolean;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  isConnected = false,
  className
}: AIVoiceInputProps) {
  const [active, setActive] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (active) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [active]);

  useEffect(() => {
    if (isConnected) {
      setStatus('connected');
      setActive(true);
    } else {
      setStatus('disconnected');
      setActive(false);
    }
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setStatus('connecting');
    onStart?.();
  };

  const handleStop = () => {
    onStop?.(time);
    setStatus('disconnected');
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-4">
        <div className={cn(
          "px-2 py-1 rounded-md text-xs font-medium",
          status === 'connected' ? "bg-green-500/20 text-green-700 dark:text-green-300" :
          status === 'connecting' ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" :
          "bg-red-500/20 text-red-700 dark:text-red-300"
        )}>
          {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </div>

        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            active
              ? "bg-red-500/20 hover:bg-red-500/30"
              : "bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
          )}
          type="button"
          onClick={active ? handleStop : handleStart}
          disabled={status === 'connecting'}
        >
          {status === 'connecting' ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : active ? (
            <Square className="w-6 h-6 text-red-500" />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            active
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                active
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                active && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}