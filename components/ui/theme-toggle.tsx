"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        console.log('Theme Toggle Clicked:', {
          currentTheme,
          newTheme,
          beforeClass: document.documentElement.className
        });
        setTheme(newTheme);
        // Check after a short delay
        setTimeout(() => {
          console.log('After theme change:', {
            theme,
            newTheme,
            htmlClass: document.documentElement.className,
            bodyClass: document.body.className
          });
        }, 100);
      }}
      className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      )}
      <span className="sr-only">Current theme: {currentTheme}</span>
    </button>
  );
}