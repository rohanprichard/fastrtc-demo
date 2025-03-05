"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { useState, useEffect } from "react";

interface BackgroundCirclesProps {
    title?: string;
    description?: string;
    className?: string;
    variant?: keyof typeof COLOR_VARIANTS;
    audioLevel?: number;
    isActive?: boolean;
}

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
    tertiary: {
        border: [
            "border-orange-500/60",
            "border-yellow-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-orange-500/30",
    },
    quaternary: {
        border: [
            "border-purple-500/60",
            "border-pink-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-purple-500/30",
    },
    quinary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    }, // red
    senary: {
        border: [
            "border-blue-500/60",
            "border-sky-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-blue-500/30",
    }, // blue
    septenary: {
        border: [
            "border-gray-500/60",
            "border-gray-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-gray-500/30",
    },
    octonary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    },
} as const;

const AnimatedGrid = () => (
    <motion.div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"
        animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
            duration: 40,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
        }}
    >
        <div className="h-full w-full [background-image:repeating-linear-gradient(100deg,#64748B_0%,#64748B_1px,transparent_1px,transparent_4%)] opacity-20" />
    </motion.div>
);

export function BackgroundCircles({
    title = "",
    description = "",
    className,
    variant = "octonary",
    audioLevel = 0,
    isActive = false,
}: BackgroundCirclesProps) {
    const variantStyles = COLOR_VARIANTS[variant];
    const [scale, setScale] = useState([1, 1.05, 1.1]);
    const [opacity, setOpacity] = useState([0.8, 0.9, 1]);
    const [rotation, setRotation] = useState([0, 0, 0]);
    const [animationDuration, setAnimationDuration] = useState(5);
    const [pulseIntensity, setPulseIntensity] = useState(0);
    const [transitionState, setTransitionState] = useState<'idle' | 'activating' | 'active' | 'deactivating'>('idle');
    
    // Handle state transitions smoothly
    useEffect(() => {
        if (isActive && transitionState === 'idle') {
            setTransitionState('activating');
            
            // After a short delay, move to fully active state
            const timer = setTimeout(() => {
                setTransitionState('active');
            }, 600);
            
            return () => clearTimeout(timer);
        } 
        else if (!isActive && (transitionState === 'active' || transitionState === 'activating')) {
            setTransitionState('deactivating');
            
            // After animation completes, return to idle state
            const timer = setTimeout(() => {
                setTransitionState('idle');
            }, 600);
            
            return () => clearTimeout(timer);
        }
    }, [isActive, transitionState]);
    
    // Update animation based on audio level
    useEffect(() => {
        if (transitionState === 'active') {
            // Apply exponential scaling to make the effect more dramatic
            // This will make quiet sounds have some effect, but loud sounds have much more
            const enhancedLevel = Math.pow(audioLevel, 1.5) * 1.5;
            
            // Scale the circles based on audio level (0-1)
            // Add a minimum scale to ensure circles are always visible
            const baseScale = 1;
            const maxScaleIncrease = 0.8; // Increased from 0.4 for more dramatic effect
            
            const newScale = [
                baseScale + enhancedLevel * maxScaleIncrease * 0.7,
                baseScale + 0.05 + enhancedLevel * maxScaleIncrease * 0.9,
                baseScale + 0.1 + enhancedLevel * maxScaleIncrease * 1.2
            ];
            
            // Adjust opacity based on audio level
            const baseOpacity = 0.7;
            const maxOpacityIncrease = 0.3;
            
            const newOpacity = [
                baseOpacity + enhancedLevel * maxOpacityIncrease * 0.6,
                baseOpacity + 0.1 + enhancedLevel * maxOpacityIncrease * 0.8,
                baseOpacity + 0.2 + enhancedLevel * maxOpacityIncrease
            ];
            
            // Adjust rotation speed based on audio level
            // Higher audio level = much faster rotation
            const newDuration = Math.max(0.5, 5 - enhancedLevel * 4.5);
            
            // Set pulse intensity for additional effects
            setPulseIntensity(enhancedLevel * 3.5);
            
            setScale(newScale);
            setOpacity(newOpacity);
            setAnimationDuration(newDuration);
            
            // Add more dramatic rotation offset for each circle based on audio level
            setRotation([
                enhancedLevel * 20,
                enhancedLevel * 30,
                enhancedLevel * 40
            ]);
        } else if (transitionState === 'idle') {
            // Reset to default animation when not active
            setScale([1, 1.05, 1.1]);
            setOpacity([0.8, 0.9, 1]);
            setAnimationDuration(5);
            setRotation([0, 0, 0]);
            setPulseIntensity(0);
        } else if (transitionState === 'activating') {
            // Gradually transition to active state
            setScale([1.02, 1.07, 1.12]);
            setOpacity([0.85, 0.95, 1]);
            setAnimationDuration(4);
            setPulseIntensity(0.2);
        } else if (transitionState === 'deactivating') {
            // Gradually transition back to idle state
            setScale([1.01, 1.06, 1.11]);
            setOpacity([0.82, 0.92, 1]);
            setAnimationDuration(4.5);
            setPulseIntensity(0.1);
        }
    }, [audioLevel, transitionState]);

    // Determine if we should use the active or idle animations
    const isActiveAnimation = transitionState === 'active' || transitionState === 'activating';
    
    // Smooth transition duration based on state
    const getTransitionDuration = () => {
        if (transitionState === 'activating' || transitionState === 'deactivating') {
            return 0.6; // Slower during transitions
        }
        return isActiveAnimation ? (animationDuration * 0.8) : 5;
    };

    return (
        <div
            className={clsx(
                "relative flex h-screen w-full items-center justify-center overflow-hidden",
                "bg-white dark:bg-black/5",
                className
            )}
        >
            <AnimatedGrid />
            <motion.div 
                className="absolute h-[480px] w-[480px]"
                animate={{
                    scale: isActiveAnimation && pulseIntensity > 0.3 
                        ? [1, 1 + pulseIntensity * 0.1, 1] 
                        : 1,
                }}
                transition={{
                    duration: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className={clsx(
                            "absolute inset-0 rounded-full",
                            "border-2 bg-gradient-to-br to-transparent",
                            variantStyles.border[i],
                            variantStyles.gradient
                        )}
                        animate={{
                            rotate: isActiveAnimation ? 360 + rotation[i] : 360,
                            scale: isActiveAnimation 
                                ? [scale[i], scale[i] * (1.1 + pulseIntensity * 0.2), scale[i]] 
                                : [1, 1.05 + i * 0.05, 1],
                            opacity: isActiveAnimation 
                                ? [opacity[i], opacity[i] * (1.15 + pulseIntensity * 0.1), opacity[i]] 
                                : [0.8, 0.9 + i * 0.05, 0.8],
                            x: isActiveAnimation && pulseIntensity > 0.4 
                                ? [0, (i - 1) * pulseIntensity * 10, 0] 
                                : 0,
                            y: isActiveAnimation && pulseIntensity > 0.4 
                                ? [0, (i - 1) * pulseIntensity * 10, 0] 
                                : 0,
                        }}
                        transition={{
                            duration: getTransitionDuration(),
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            // Use a consistent random seed for each circle to prevent jumpiness
                            type: "tween"
                        }}
                    >
                        <div
                            className={clsx(
                                "absolute inset-0 rounded-full mix-blend-screen",
                                `bg-[radial-gradient(ellipse_at_center,${variantStyles.gradient.replace(
                                    "from-",
                                    ""
                                )}/10%,transparent_70%)]`
                            )}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <div className="absolute inset-0 [mask-image:radial-gradient(90%_60%_at_50%_50%,#000_40%,transparent)]">
                <motion.div 
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0F766E/30%,transparent_70%)] blur-[120px]"
                    animate={{
                        scale: isActiveAnimation 
                            ? [1, 1 + audioLevel * 0.6, 1] 
                            : [1, 1.03, 1],
                        opacity: isActiveAnimation && pulseIntensity > 0.5 
                            ? [0.7, 0.9, 0.7] 
                            : 0.7,
                    }}
                    transition={{
                        duration: isActiveAnimation ? 1.5 : 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                <motion.div 
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2DD4BF/15%,transparent)] blur-[80px]"
                    animate={{
                        scale: isActiveAnimation 
                            ? [1, 1 + audioLevel * 0.8, 1] 
                            : [1, 1.05, 1],
                        x: isActiveAnimation && pulseIntensity > 0.6 
                            ? [0, Math.sin(Date.now() * 0.001) * 15, 0] 
                            : 0,
                        y: isActiveAnimation && pulseIntensity > 0.6 
                            ? [0, Math.cos(Date.now() * 0.001) * 15, 0] 
                            : 0,
                    }}
                    transition={{
                        duration: isActiveAnimation ? 1 : 10,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                
                {/* Additional pulsing glow that appears only during high audio levels */}
                {isActiveAnimation && (
                    <motion.div 
                        className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,${variantStyles.gradient.replace("from-", "")}/20%,transparent_70%)] blur-[60px]`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: pulseIntensity > 0.3 ? [0, pulseIntensity * 0.8, 0] : 0,
                            scale: pulseIntensity > 0.3 ? [0.8, 1.2, 0.8] : 0.8,
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export function DemoCircles() {
    const [currentVariant, setCurrentVariant] =
        useState<keyof typeof COLOR_VARIANTS>("octonary");

    const variants = Object.keys(
        COLOR_VARIANTS
    ) as (keyof typeof COLOR_VARIANTS)[];

    function getNextVariant() {
        const currentIndex = variants.indexOf(currentVariant);
        const nextVariant = variants[(currentIndex + 1) % variants.length];
        return nextVariant;
    }

    return (
        <>
            <BackgroundCircles variant={currentVariant} />
            <div className="absolute top-12 right-12">
                <button
                    type="button"
                    className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-4 py-1 rounded-md z-10 text-sm font-medium"
                    onClick={() => {
                        setCurrentVariant(getNextVariant());
                    }}
                >
                    Change Variant
                </button>
            </div>
        </>
    );
}
