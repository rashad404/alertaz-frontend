'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EntityComparisonTable from '@/components/comparison/entity-comparison-table';
import { Breadcrumb } from "@/components/ui/breadcrumb";
import apiClient from "@/lib/api/client";
import { useEntityComparison } from '@/contexts/entity-comparison-context';

async function getEntitiesToCompare(ids: number[], locale: string) {
  if (ids.length === 0) return [];
  
  try {
    // Fetch entities directly by their IDs
    const response = await apiClient.get(`/${locale}/entities-by-ids`, {
      params: { ids: ids.join(',') }
    });
    
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching entities for comparison:", error);
    return [];
  }
}

async function getEntityTypeInfo(entityType: string, locale: string) {
  try {
    // Fetch entity type information from the API
    const response = await apiClient.get(`/${locale}/entity-types`);
    const entityTypes = response.data?.data || [];
    
    // Find the entity type that matches
    const typeInfo = entityTypes.find((et: any) => et.entity_name === entityType);
    
    if (typeInfo) {
      return {
        displayName: typeInfo.display_name[locale] || typeInfo.display_name['az'] || entityType,
        icon: typeInfo.icon,
        description: typeInfo.description
      };
    }
    
    // Default fallback
    return {
      displayName: entityType,
      icon: 'Circle',
      description: ''
    };
  } catch (error) {
    console.error("Error fetching entity type info:", error);
    return {
      displayName: entityType,
      icon: 'Circle',
      description: ''
    };
  }
}

export default function EntityComparisonPage() {
  const params = useParams();
  const lang = params.lang as string;
  const entityType = params.entityType as string;
  
  const { items } = useEntityComparison();
  const [entities, setEntities] = useState<any[]>([]);
  const [typeInfo, setTypeInfo] = useState<any>({ displayName: '', icon: '', description: '' });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Get entity IDs from context for this entity type
      const contextItems = items[entityType] || [];
      const entityIds = contextItems.map(item => item.entityId);
      
      // Fetch entities and type info
      const [fetchedEntities, fetchedTypeInfo] = await Promise.all([
        getEntitiesToCompare(entityIds, lang),
        getEntityTypeInfo(entityType, lang)
      ]);
      
      setEntities(fetchedEntities);
      setTypeInfo(fetchedTypeInfo);
      setLoading(false);
    };
    
    loadData();
  }, [entityType, lang, items]);
  
  const homeLabel = lang === 'az' ? 'Ana səhifə' : lang === 'ru' ? 'Главная' : 'Home';
  const compareLabel = lang === 'az' ? 'Müqayisə' : lang === 'ru' ? 'Сравнение' : 'Comparison';
  
  const breadcrumbItems = [
    { label: homeLabel, href: `/${lang}` },
    { label: typeInfo.displayName, href: `/${lang}/companies` },
    { label: compareLabel }
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center px-4 sm:px-8 lg:px-36">
        <div className="w-full max-w-5xl py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show empty state if no products
  if (entities.length === 0) {
    return (
      <div className="flex justify-center px-4 sm:px-8 lg:px-36">
        <div className="w-full max-w-5xl py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {typeInfo.displayName} {compareLabel}
            </h1>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200">
                {lang === 'az' ? 'Müqayisə üçün məhsul yoxdur. Məhsul əlavə edin.' : 
                 lang === 'ru' ? 'Нет продуктов для сравнения. Добавьте продукты.' : 
                 'No products to compare. Add products to start.'}
              </p>
            </div>
            
            <EntityComparisonTable 
              entities={entities}
              entityType={entityType}
              locale={lang}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show message if only 1 product
  if (entities.length === 1) {
    return (
      <div className="flex justify-center px-4 sm:px-8 lg:px-36">
        <div className="w-full max-w-5xl py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {typeInfo.displayName} {compareLabel}
            </h1>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200">
                {lang === 'az' ? 'Müqayisə üçün ən azı 2 məhsul lazımdır. Daha çox məhsul əlavə edin.' : 
                 lang === 'ru' ? 'Для сравнения нужно минимум 2 продукта. Добавьте больше продуктов.' : 
                 'At least 2 products are needed for comparison. Add more products.'}
              </p>
            </div>
            
            <EntityComparisonTable 
              entities={entities}
              entityType={entityType}
              locale={lang}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 sm:px-8 lg:px-36">
      <div className="w-full max-w-5xl py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {typeInfo.displayName} {compareLabel}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {lang === 'az' ? `${entities.length} məhsul müqayisə edilir` : 
             lang === 'ru' ? `Сравнение ${entities.length} продуктов` : 
             `Comparing ${entities.length} products`}
          </p>
          
          <EntityComparisonTable 
            entities={entities}
            entityType={entityType}
            locale={lang}
          />
        </div>
      </div>
    </div>
  );
}