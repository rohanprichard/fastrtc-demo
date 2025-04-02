"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Speaker, Mic } from "lucide-react";

interface DeviceOption {
  deviceId: string;
  label: string;
}

interface AudioDeviceSelectorProps {
  onChange?: (deviceId: string, type: 'input' | 'output') => void;
  className?: string;
}

export function AudioDeviceSelector({
  onChange,
  className
}: AudioDeviceSelectorProps) {
  const [inputDevices, setInputDevices] = useState<DeviceOption[]>([]);
  const [outputDevices, setOutputDevices] = useState<DeviceOption[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>("");
  const [selectedOutput, setSelectedOutput] = useState<string>("");
  const [audioInputLevel, setAudioInputLevel] = useState<number>(0);
  const [audioOutputActive, setAudioOutputActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use refs to track if we've already set the default devices
  const initializedRef = useRef<boolean>(false);

  // Get available devices
  useEffect(() => {
    async function getDevices() {
      try {
        // Request permission to access audio devices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get the list of audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const inputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}...`
          }));
        
        const outputs = devices
          .filter(device => device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${device.deviceId.slice(0, 5)}...`
          }));
        
        setInputDevices(inputs);
        setOutputDevices(outputs);
        
        // Only set default devices on the first load
        if (!initializedRef.current) {
          // Select default devices
          if (inputs.length > 0) {
            setSelectedInput(inputs[0].deviceId);
          }
          
          if (outputs.length > 0) {
            setSelectedOutput(outputs[0].deviceId);
          }
          
          initializedRef.current = true;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setIsLoading(false);
      }
    }
    
    getDevices();
  }, []);

  // Setup input device analysis when it changes
  useEffect(() => {
    if (selectedInput && !isLoading) {
      setupAudioAnalysis(selectedInput);
    }
  }, [selectedInput, isLoading]);

  // Handle input device change
  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedInput(deviceId);
    onChange?.(deviceId, 'input');
    playTestTone();
  };

  // Handle output device change
  const handleOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedOutput(deviceId);
    onChange?.(deviceId, 'output');
    playTestTone();
  };

  // Play a test tone when device is changed
  const playTestTone = () => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Lower volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      setAudioOutputActive(true);
      
      // Stop after 0.5 seconds
      setTimeout(() => {
        oscillator.stop();
        setTimeout(() => {
          setAudioOutputActive(false);
        }, 300);
      }, 500);
    } catch (error) {
      console.error("Error playing test tone:", error);
    }
  };

  // Setup audio analysis for input visualization
  const setupAudioAnalysis = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { deviceId: { exact: deviceId } } 
      });
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength / 255; // Normalize to 0-1
        setAudioInputLevel(average);
        requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
      
      // Cleanup function to stop tracks when component unmounts or input changes
      return () => {
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile view (stacked) */}
      <div className="flex flex-col space-y-2 md:hidden">
        <div className="w-full backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-border/30">
          <div className="w-full">
            <label className="text-xs text-muted-foreground flex items-center mb-1">
              <Mic className="w-3 h-3 mr-1" />
              Input
            </label>
            <div className={cn(
              "relative flex items-center",
              audioInputLevel > 0.02 && "after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-primary/50 after:animate-pulse"
            )}>
              <select
                value={selectedInput}
                onChange={handleInputChange}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-md border border-input bg-background/80 px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  audioInputLevel > 0.02 && "border-primary/50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <option>Loading...</option>
                ) : inputDevices.length === 0 ? (
                  <option>No devices found</option>
                ) : (
                  inputDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label.length > 20 ? `${device.label.substring(0, 20)}...` : device.label}
                    </option>
                  ))
                )}
              </select>
              <div 
                className="absolute right-2 w-2 h-2 rounded-full bg-primary transition-all"
                style={{ 
                  opacity: audioInputLevel > 0.02 ? 1 : 0,
                  transform: `scale(${1 + audioInputLevel * 2})`
                }}
              />
            </div>
          </div>
          
          <div className="w-full mt-2">
            <label className="text-xs text-muted-foreground flex items-center mb-1">
              <Speaker className="w-3 h-3 mr-1" />
              Output
            </label>
            <div className={cn(
              "relative flex items-center",
              audioOutputActive && "after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-primary/50 after:animate-pulse"
            )}>
              <select
                value={selectedOutput}
                onChange={handleOutputChange}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-md border border-input bg-background/80 px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  audioOutputActive && "border-primary/50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <option>Loading...</option>
                ) : outputDevices.length === 0 ? (
                  <option>No devices found</option>
                ) : (
                  outputDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label.length > 20 ? `${device.label.substring(0, 20)}...` : device.label}
                    </option>
                  ))
                )}
              </select>
              <div 
                className={cn(
                  "absolute right-2 w-2 h-2 rounded-full bg-primary transition-all",
                  audioOutputActive ? "opacity-100 scale-150" : "opacity-0 scale-100"
                )}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop view (side by side) */}
      <div className="hidden md:flex md:space-x-4 md:backdrop-blur-sm md:bg-background/50 md:p-3 md:rounded-lg md:border md:border-border/30">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground flex items-center mb-1">
            <Mic className="w-3 h-3 mr-1" />
            Input Device
          </label>
          <div className={cn(
            "relative flex items-center",
            audioInputLevel > 0.02 && "after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-primary/50 after:animate-pulse"
          )}>
            <select
              value={selectedInput}
              onChange={handleInputChange}
              disabled={isLoading}
              className={cn(
                "w-full rounded-md border border-input bg-background/80 px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                audioInputLevel > 0.02 && "border-primary/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <option>Loading...</option>
              ) : inputDevices.length === 0 ? (
                <option>No devices found</option>
              ) : (
                inputDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))
              )}
            </select>
            <div 
              className="absolute right-2 w-2 h-2 rounded-full bg-primary transition-all"
              style={{ 
                opacity: audioInputLevel > 0.02 ? 1 : 0,
                transform: `scale(${1 + audioInputLevel * 2})`
              }}
            />
          </div>
        </div>
        
        <div className="flex-1">
          <label className="text-xs text-muted-foreground flex items-center mb-1">
            <Speaker className="w-3 h-3 mr-1" />
            Output Device
          </label>
          <div className={cn(
            "relative flex items-center",
            audioOutputActive && "after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-primary/50 after:animate-pulse"
          )}>
            <select
              value={selectedOutput}
              onChange={handleOutputChange}
              disabled={isLoading}
              className={cn(
                "w-full rounded-md border border-input bg-background/80 px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                audioOutputActive && "border-primary/50",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <option>Loading...</option>
              ) : outputDevices.length === 0 ? (
                <option>No devices found</option>
              ) : (
                outputDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))
              )}
            </select>
            <div 
              className={cn(
                "absolute right-2 w-2 h-2 rounded-full bg-primary transition-all",
                audioOutputActive ? "opacity-100 scale-150" : "opacity-0 scale-100"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 