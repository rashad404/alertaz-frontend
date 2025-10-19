'use client';

import { useEffect } from 'react';

const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION || '1.0.0';

export function CacheBuster() {
  useEffect(() => {
    // Check if we need to force reload
    const lastVersion = localStorage.getItem('app-version');
    const currentVersion = BUILD_VERSION;
    
    // Only reload if version actually changed and we haven't already reloaded
    const hasReloaded = sessionStorage.getItem('version-reloaded');
    
    if (lastVersion && lastVersion !== currentVersion && !hasReloaded) {
      // Version changed, force hard reload
      localStorage.setItem('app-version', currentVersion);
      sessionStorage.setItem('version-reloaded', 'true');
      window.location.reload();
    } else if (!lastVersion) {
      // First visit, save version
      localStorage.setItem('app-version', currentVersion);
    }
    
    // Clear the reload flag when component unmounts or page changes
    return () => {
      sessionStorage.removeItem('version-reloaded');
    };
  }, []);
  
  return null;
}