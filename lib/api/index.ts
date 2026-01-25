// V1 API Clients
export { default as apiClient } from './client';
export { default as serviceTypesApi, type CreateServiceTypeData } from './serviceTypes';
export { default as customersApi, type CustomerFilters, type CustomerData } from './customers';
export { default as servicesApi, type ServiceFilters, type ServiceData } from './services';
export { default as quickSendApi, type SendMessageData, type BulkSendResult, type PreviewResult } from './quickSend';
export { default as campaignsApi, type CampaignFilters, type CreateCampaignData, type PreviewParams, type PreviewResult as CampaignPreviewResult, type PlannedContact, type AttributeSchema, type CampaignChannel, type SegmentFilter, type EmailSender, type CampaignMessage } from './campaigns';
export { default as templatesApi, type CreateTemplateData } from './templates';

// Re-export types
export type {
  ApiResponse,
  PaginatedResponse,
  ServiceType,
  FieldDefinition,
  Customer,
  Service,
  Campaign,
  FilterCondition,
  FilterConfig,
  Template,
  Message,
  SyncResult,
  SendResult,
  ServiceStats,
  CampaignStats,
} from '../types/api';
