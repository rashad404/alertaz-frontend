"use client";

import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ 
  data, 
  color = '#10b981', 
  height = 40, 
  width = 100 
}: SparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const normalizedData = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    return normalizedData.join(' ');
  }, [data, height, width]);

  if (!points) return null;

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}