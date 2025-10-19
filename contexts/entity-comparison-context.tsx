'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Entity comparison item structure
interface EntityComparisonItem {
  entityId: number;
  entityType: string; // Dynamic: any entity type from company_entity_types table
  entityTypeName: string; // Display name for the entity type
  entityName: string;
  companyId: number;
  companyName: string;
  companySlug: string;
  companyType: string; // bank, credit_organization, insurance, etc.
  attributes: Record<string, any>; // EAV attributes
}

interface EntityComparisonContextType {
  items: Record<string, EntityComparisonItem[]>; // Grouped by entity type
  addToComparison: (item: EntityComparisonItem) => boolean;
  removeFromComparison: (entityId: number, entityType: string) => void;
  clearComparison: (entityType?: string) => void;
  clearAll: () => void;
  getItemCount: () => number;
  getItemsByType: (entityType: string) => EntityComparisonItem[];
  getTypesCounts: () => Record<string, number>;
  isInComparison: (entityId: number, entityType: string) => boolean;
  canAddMore: (entityType: string) => boolean;
}

const MAX_ITEMS_PER_TYPE = 5;

const EntityComparisonContext = createContext<EntityComparisonContextType | undefined>(undefined);

export function EntityComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, EntityComparisonItem[]>>({});

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('entity_comparison');
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to load comparison data:', e);
        }
      }
    }
  }, []);

  // Save to localStorage on change (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('entity_comparison', JSON.stringify(items));
    }
  }, [items]);

  const addToComparison = useCallback((item: EntityComparisonItem): boolean => {
    console.log('addToComparison called with:', item);
    console.trace('Call stack');
    
    // Use a ref to get current items without causing re-renders
    const currentItems = items;
    
    // Check if already in comparison
    if (currentItems[item.entityType]?.find(i => i.entityId === item.entityId)) {
      console.log('Item already in comparison:', item.entityId);
      return false;
    }

    // Check max items per type  
    if ((currentItems[item.entityType]?.length || 0) >= MAX_ITEMS_PER_TYPE) {
      console.log('Max items reached for type:', item.entityType);
      return false;
    }

    console.log('Adding item to comparison:', item);
    setItems(prev => ({
      ...prev,
      [item.entityType]: [...(prev[item.entityType] || []), item]
    }));

    return true;
  }, [items]);

  const removeFromComparison = useCallback((entityId: number, entityType: string) => {
    setItems(prev => ({
      ...prev,
      [entityType]: prev[entityType]?.filter(item => item.entityId !== entityId) || []
    }));
  }, []);

  const clearComparison = useCallback((entityType?: string) => {
    if (entityType) {
      setItems(prev => ({
        ...prev,
        [entityType]: []
      }));
    } else {
      setItems({});
    }
  }, []);

  const clearAll = useCallback(() => {
    setItems({});
  }, []);

  const getItemCount = useCallback(() => {
    return Object.values(items).reduce((sum, typeItems) => sum + typeItems.length, 0);
  }, [items]);

  const getItemsByType = useCallback((entityType: string) => {
    return items[entityType] || [];
  }, [items]);

  const getTypesCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    Object.entries(items).forEach(([type, typeItems]) => {
      if (typeItems.length > 0) {
        counts[type] = typeItems.length;
      }
    });
    return counts;
  }, [items]);

  const isInComparison = useCallback((entityId: number, entityType: string) => {
    return items[entityType]?.some(item => item.entityId === entityId) || false;
  }, [items]);

  const canAddMore = useCallback((entityType: string) => {
    return (items[entityType]?.length || 0) < MAX_ITEMS_PER_TYPE;
  }, [items]);

  return (
    <EntityComparisonContext.Provider
      value={{
        items,
        addToComparison,
        removeFromComparison,
        clearComparison,
        clearAll,
        getItemCount,
        getItemsByType,
        getTypesCounts,
        isInComparison,
        canAddMore
      }}
    >
      {children}
    </EntityComparisonContext.Provider>
  );
}

export function useEntityComparison() {
  const context = useContext(EntityComparisonContext);
  if (context === undefined) {
    throw new Error('useEntityComparison must be used within an EntityComparisonProvider');
  }
  return context;
}