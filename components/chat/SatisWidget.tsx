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

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  wallet_id?: string;
  gender?: string;
  dob?: string;
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

    script.onload = async () => {
      // Initialize the widget with our tenant
      if (window.satis) {
        window.satis('init', tenantSlug, {
          apiUrl: apiUrl,
          primaryColor: '#7c3aed',
        });

        // Check if user is logged in and identify them
        await identifyLoggedInUser();
      }
    };

    document.body.appendChild(script);

    // Listen for auth state changes to identify user after login
    const handleAuthChange = () => {
      identifyLoggedInUser();
    };
    window.addEventListener('authStateChanged', handleAuthChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
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

async function identifyLoggedInUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token || !window.satis) return;

    // Fetch user data from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return;

    const result = await response.json();
    const user: UserData = result.data;

    if (user?.name) {
      // Send user data to Satis widget
      window.satis('identify', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        wallet_id: user.wallet_id,
        gender: user.gender,
        dob: user.dob,
      });
    }
  } catch (error) {
    console.error('[SatisWidget] Failed to identify user:', error);
  }
}
