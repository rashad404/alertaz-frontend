"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTimezone } from "@/providers/timezone-provider";
import { TIMEZONES } from "@/lib/utils/date";

export function TimezoneSelector() {
  const { timezone, setTimezone, mounted } = useTimezone();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get short display name (e.g., "GMT+4" from "Bakı (GMT+4)")
  const getShortName = (tz: string) => {
    const found = TIMEZONES.find((t) => t.value === tz);
    if (found) {
      const match = found.label.match(/\(([^)]+)\)/);
      return match ? match[1] : tz;
    }
    return tz;
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 font-bold">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">GMT+4</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 font-bold hover:text-brand-orange transition-colors"
        title="Select timezone"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{getShortName(timezone)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.value}
              onClick={() => {
                setTimezone(tz.value);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                tz.value === timezone ? "bg-gray-50 dark:bg-gray-700 text-brand-orange" : ""
              }`}
            >
              {tz.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
