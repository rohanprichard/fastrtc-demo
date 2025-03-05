"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center transition-colors",
        "bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-black/70" />
      ) : (
        <Sun className="h-5 w-5 text-white/70" />
      )}
    </button>
  );
} 