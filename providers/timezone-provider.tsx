"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "alertaz-timezone";
const DEFAULT_TIMEZONE = "Asia/Baku";

interface TimezoneContextType {
  timezone: string;
  setTimezone: (timezone: string) => void;
  mounted: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(DEFAULT_TIMEZONE);
  const [mounted, setMounted] = useState(false);

  // Load timezone from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTimezoneState(stored);
    }
    setMounted(true);
  }, []);

  // Save timezone to localStorage when it changes
  const setTimezone = (newTimezone: string) => {
    setTimezoneState(newTimezone);
    localStorage.setItem(STORAGE_KEY, newTimezone);
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, mounted }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
}

// Helper to get timezone from localStorage (for use outside React components)
export function getStoredTimezone(): string {
  if (typeof window === "undefined") return DEFAULT_TIMEZONE;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_TIMEZONE;
}
