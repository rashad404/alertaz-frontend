"use client";

import { useEffect, useRef } from 'react';
import { OHLCData } from '@/lib/api/crypto';

interface PriceChartProps {
  data: OHLCData[];
  currency: 'azn' | 'usd';
  height?: number;
}

export function PriceChart({ data, currency, height = 400 }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Create a simple candlestick chart using canvas
    const container = chartContainerRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = height;
    
    // Clear container and add canvas
    container.innerHTML = '';
    container.appendChild(canvas);

    // Calculate chart dimensions
    const padding = { top: 20, right: 60, bottom: 40, left: 10 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    // Find min and max values
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Calculate candle width
    const candleWidth = Math.max(1, (chartWidth / data.length) * 0.8);
    const candleSpacing = chartWidth / data.length;

    // Draw background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (price levels)
    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const y = padding.top + (i * chartHeight / priceSteps);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();

      // Draw price labels
      const price = maxPrice - (i * priceRange / priceSteps);
      const symbol = currency === 'azn' ? '₼' : '$';
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${symbol}${price.toFixed(2)}`, canvas.width - 5, y + 4);
    }

    // Draw candles
    data.forEach((candle, index) => {
      const x = padding.left + (index * candleSpacing) + (candleSpacing / 2);
      
      // Calculate y positions
      const yOpen = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const yClose = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
      const yHigh = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const yLow = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
      
      // Determine candle color
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10b981' : '#ef4444';
      
      // Draw wick (high-low line)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      // Draw body (open-close rectangle)
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(yClose - yOpen) || 1;
      const bodyY = Math.min(yOpen, yClose);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });

    // Draw time labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    
    const labelStep = Math.max(1, Math.floor(data.length / 6));
    data.forEach((candle, index) => {
      if (index % labelStep === 0 || index === data.length - 1) {
        const x = padding.left + (index * candleSpacing) + (candleSpacing / 2);
        const date = new Date(candle.time * 1000);
        const label = date.toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, canvas.height - 10);
      }
    });

    // Draw chart border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [data, currency, height]);

  // Fallback for empty data
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <p className="text-gray-500">Qrafik məlumatları yüklənir...</p>
      </div>
    );
  }

  return (
    <div 
      ref={chartContainerRef}
      className="w-full bg-gray-50 rounded-lg"
      style={{ height: `${height}px` }}
    />
  );
}