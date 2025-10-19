import apiClient from './client';

export interface EntityType {
  entity_name: string;
  display_name: {
    az: string;
    en: string;
    ru: string;
  };
  description: string;
  parent_type: string;
  icon: string;
}

export interface EntityTypesResponse {
  status: string;
  data: EntityType[];
}

export async function fetchEntityTypes(locale: string = 'az'): Promise<EntityType[]> {
  try {
    const response = await apiClient.get<EntityTypesResponse>(`/${locale}/entity-types`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching entity types:', error);
    return [];
  }
}

export function getEntityTypeDisplayName(entityType: string, entityTypes: EntityType[], locale: string): string {
  const type = entityTypes.find(et => et.entity_name === entityType);
  if (type && type.display_name) {
    return type.display_name[locale as keyof typeof type.display_name] || 
           type.display_name['az'] || 
           entityType;
  }
  return entityType;
}

export function getEntityTypeIcon(entityType: string, entityTypes: EntityType[]): string {
  const type = entityTypes.find(et => et.entity_name === entityType);
  return type?.icon || 'Circle';
}