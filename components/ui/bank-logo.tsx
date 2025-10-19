'use client';

import React, { useState } from 'react';

interface BankLogoProps {
  logo?: string | null;
  name: string;
  shortName?: string;
  className?: string;
}

export function BankLogo({ logo, name, shortName, className = "" }: BankLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = () => {
    if (shortName) return shortName.slice(0, 2).toUpperCase();
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  if (!logo || imageError) {
    return (
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-lg font-bold text-gray-600">
          {getInitials()}
        </span>
      </div>
    );
  }

  return (
    <div className={`w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm ${className}`}>
      <img
        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${logo}`}
        alt={name}
        className="w-full h-full object-contain p-2"
        onError={() => setImageError(true)}
      />
    </div>
  );
}