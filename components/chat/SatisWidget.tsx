'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    satis: (...args: unknown[]) => void;
  }
}

interface SatisWidgetProps {
  tenantSlug?: string;
}

export default function SatisWidget({ tenantSlug = 'alertaz' }: SatisWidgetProps) {
  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById('satis-widget-script')) {
      return;
    }

    const widgetUrl = process.env.NEXT_PUBLIC_SATIS_WIDGET_URL || 'https://api.satis.az/widget.js';
    const apiUrl = process.env.NEXT_PUBLIC_SATIS_API_URL || 'https://api.satis.az/api';

    // Create and load the widget script
    const script = document.createElement('script');
    script.id = 'satis-widget-script';
    script.src = widgetUrl;
    script.async = true;

    script.onload = () => {
      // Initialize the widget with our tenant
      if (window.satis) {
        window.satis('init', tenantSlug, {
          apiUrl: apiUrl,
          primaryColor: '#7c3aed',
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('satis-widget-script');
      if (existingScript) {
        existingScript.remove();
      }
      // Destroy the widget
      if (window.satis) {
        window.satis('destroy');
      }
    };
  }, [tenantSlug]);

  return null;
}
