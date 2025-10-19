'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Offer } from '@/lib/types';

interface ComparisonItem {
  offer: Offer;
  categorySlug: string;
  categoryName: string;
}

interface ComparisonContextType {
  items: ComparisonItem[];
  addToComparison: (offer: Offer, categorySlug: string, categoryName: string) => boolean;
  removeFromComparison: (offerId: number, categorySlug: string) => void;
  clearComparison: (categorySlug?: string) => void;
  getItemsByCategory: () => Record<string, ComparisonItem[]>;
  getItemCount: () => number;
  getCategoryCount: (categorySlug: string) => number;
  isInComparison: (offerId: number, categorySlug: string) => boolean;
  canAddToComparison: (categorySlug: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_ITEMS_PER_CATEGORY = 4;
const STORAGE_KEY = 'kredit_comparison_items';

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ComparisonItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading comparison items:', error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving comparison items:', error);
    }
  }, [items]);

  const addToComparison = useCallback((offer: Offer, categorySlug: string, categoryName: string): boolean => {
    // Check if already in comparison for this category
    const existingIndex = items.findIndex(
      item => item.offer.id === offer.id && item.categorySlug === categorySlug
    );
    
    if (existingIndex !== -1) {
      return false; // Already exists
    }

    // Check max items per category
    const categoryItems = items.filter(item => item.categorySlug === categorySlug);
    if (categoryItems.length >= MAX_ITEMS_PER_CATEGORY) {
      return false; // Max reached
    }

    setItems(prev => [...prev, { offer, categorySlug, categoryName }]);
    return true;
  }, [items]);

  const removeFromComparison = useCallback((offerId: number, categorySlug: string) => {
    setItems(prev => prev.filter(
      item => !(item.offer.id === offerId && item.categorySlug === categorySlug)
    ));
  }, []);

  const clearComparison = useCallback((categorySlug?: string) => {
    if (categorySlug) {
      setItems(prev => prev.filter(item => item.categorySlug !== categorySlug));
    } else {
      setItems([]);
    }
  }, []);

  const getItemsByCategory = useCallback((): Record<string, ComparisonItem[]> => {
    return items.reduce((acc, item) => {
      if (!acc[item.categorySlug]) {
        acc[item.categorySlug] = [];
      }
      acc[item.categorySlug].push(item);
      return acc;
    }, {} as Record<string, ComparisonItem[]>);
  }, [items]);

  const getItemCount = useCallback((): number => {
    return items.length;
  }, [items]);

  const getCategoryCount = useCallback((categorySlug: string): number => {
    return items.filter(item => item.categorySlug === categorySlug).length;
  }, [items]);

  const isInComparison = useCallback((offerId: number, categorySlug: string): boolean => {
    return items.some(item => item.offer.id === offerId && item.categorySlug === categorySlug);
  }, [items]);

  const canAddToComparison = useCallback((categorySlug: string): boolean => {
    const categoryItems = items.filter(item => item.categorySlug === categorySlug);
    return categoryItems.length < MAX_ITEMS_PER_CATEGORY;
  }, [items]);

  return (
    <ComparisonContext.Provider
      value={{
        items,
        addToComparison,
        removeFromComparison,
        clearComparison,
        getItemsByCategory,
        getItemCount,
        getCategoryCount,
        isInComparison,
        canAddToComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}