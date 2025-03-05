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
    
    // Update animation based on audio level
    useEffect(() => {
        if (isActive) {
            // Scale the circles based on audio level (0-1)
            // Add a minimum scale to ensure circles are always visible
            const baseScale = 1;
            const maxScaleIncrease = 0.3; // Maximum additional scale
            
            const newScale = [
                baseScale + audioLevel * maxScaleIncrease * 0.5,
                baseScale + 0.05 + audioLevel * maxScaleIncrease * 0.7,
                baseScale + 0.1 + audioLevel * maxScaleIncrease
            ];
            
            // Also adjust opacity based on audio level
            const baseOpacity = 0.7;
            const maxOpacityIncrease = 0.3;
            
            const newOpacity = [
                baseOpacity + audioLevel * maxOpacityIncrease * 0.5,
                baseOpacity + 0.1 + audioLevel * maxOpacityIncrease * 0.7,
                baseOpacity + 0.2 + audioLevel * maxOpacityIncrease
            ];
            
            setScale(newScale);
            setOpacity(newOpacity);
        } else {
            // Reset to default animation when not active
            setScale([1, 1.05, 1.1]);
            setOpacity([0.8, 0.9, 1]);
        }
    }, [audioLevel, isActive]);

    return (
        <div
            className={clsx(
                "relative flex h-screen w-full items-center justify-center overflow-hidden",
                "bg-white dark:bg-black/5",
                className
            )}
        >
            <AnimatedGrid />
            <motion.div className="absolute h-[480px] w-[480px]">
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
                            rotate: 360,
                            scale: isActive ? [scale[i], scale[i] * 1.05, scale[i]] : [1, 1.05 + i * 0.05, 1],
                            opacity: isActive ? [opacity[i], opacity[i] * 1.1, opacity[i]] : [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: isActive ? 2 : 5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0F766E/30%,transparent_70%)] blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2DD4BF/15%,transparent)] blur-[80px]" />
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
