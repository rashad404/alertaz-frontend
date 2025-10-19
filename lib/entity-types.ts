// Entity type helpers - dynamically handles any entity type

export interface EntityTypeInfo {
  key: string; // e.g., 'loan', 'deposit', 'credit_card'
  displayName: {
    az: string;
    en: string;
    ru: string;
  };
  pluralName?: {
    az: string;
    en: string;
    ru: string;
  };
}

// This would be fetched from API in real implementation
// For now, common entity types (can be extended dynamically)
export const getEntityTypeDisplayName = (entityType: string, locale: string = 'en'): string => {
  // This mapping can be fetched from API or database
  // The system should work with ANY entity type, not just these
  const commonTypes: Record<string, any> = {
    'loan': {
      en: 'Loan',
      az: 'Kredit',
      ru: 'Кредит'
    },
    'credit_loan': {
      en: 'Credit Loan',
      az: 'Kredit',
      ru: 'Кредит'
    },
    'mortgage': {
      en: 'Mortgage',
      az: 'İpoteka',
      ru: 'Ипотека'
    },
    'auto_loan': {
      en: 'Auto Loan',
      az: 'Avto kredit',
      ru: 'Автокредит'
    },
    'student_loan': {
      en: 'Student Loan',
      az: 'Tələbə krediti',
      ru: 'Студенческий кредит'
    },
    'business_loan': {
      en: 'Business Loan',
      az: 'Biznes krediti',
      ru: 'Бизнес кредит'
    },
    'deposit': {
      en: 'Deposit',
      az: 'Əmanət',
      ru: 'Депозит'
    },
    'credit_card': {
      en: 'Credit Card',
      az: 'Kredit kartı',
      ru: 'Кредитная карта'
    },
    'debit_card': {
      en: 'Debit Card',
      az: 'Debet kartı',
      ru: 'Дебетовая карта'
    },
    'insurance_product': {
      en: 'Insurance',
      az: 'Sığorta',
      ru: 'Страхование'
    },
    'investment_product': {
      en: 'Investment',
      az: 'İnvestisiya',
      ru: 'Инвестиция'
    },
    'leasing_product': {
      en: 'Leasing',
      az: 'Lizinq',
      ru: 'Лизинг'
    }
  };

  // If we have a translation, use it
  if (commonTypes[entityType]?.[locale]) {
    return commonTypes[entityType][locale];
  }

  // Otherwise, format the entity type name
  // Convert snake_case to Title Case
  return entityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get plural form
export const getEntityTypePluralName = (entityType: string, locale: string = 'en', count: number = 2): string => {
  const singular = getEntityTypeDisplayName(entityType, locale);
  
  // Simple pluralization for English
  if (locale === 'en' && count !== 1) {
    if (singular.endsWith('y')) {
      return singular.slice(0, -1) + 'ies';
    }
    return singular + 's';
  }
  
  // For other languages, just add count
  return `${singular} (${count})`;
};

// Group entities by their base type (for comparison purposes)
// For example: auto_loan, student_loan, business_loan all group under 'loans'
export const getEntityBaseType = (entityType: string): string => {
  // Check if it contains common suffixes
  if (entityType.includes('loan') || entityType.includes('credit')) {
    // But keep them separate for comparison
    return entityType; // Each loan type compares with its own type
  }
  
  if (entityType.includes('card')) {
    return entityType; // Keep credit_card and debit_card separate
  }
  
  if (entityType.includes('deposit')) {
    return 'deposit';
  }
  
  if (entityType.includes('insurance')) {
    return 'insurance_product';
  }
  
  // Default: use the entity type as is
  return entityType;
};

// Check if two entities can be compared
export const canCompareEntities = (entityType1: string, entityType2: string): boolean => {
  // Only same entity types can be compared
  // This ensures auto_loan compares with auto_loan only
  // mortgage with mortgage only, etc.
  return entityType1 === entityType2;
};

// Sort entity types for display (most important first)
export const sortEntityTypes = (types: string[]): string[] => {
  const priority = [
    'loan',
    'credit_loan',
    'mortgage',
    'auto_loan',
    'business_loan',
    'student_loan',
    'deposit',
    'credit_card',
    'debit_card',
    'insurance_product',
    'investment_product',
    'leasing_product'
  ];
  
  return types.sort((a, b) => {
    const indexA = priority.indexOf(a);
    const indexB = priority.indexOf(b);
    
    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b);
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
};