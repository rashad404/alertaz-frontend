/**
 * Template Renderer Utility
 *
 * Mirrors backend TemplateRenderer logic for consistent variable replacement
 * across frontend previews and displays.
 *
 * Handles:
 * - Simple variables: {{name}}, {{email}}, {{phone}}
 * - Array item fields: {{hosting_name}}, {{hosting_expiry}}, {{domain_name}}
 * - Segment filter context for matching the right array item
 */

import { SegmentFilter } from '@/lib/api/campaigns';

/**
 * Extract fields from array items based on template variables
 * Auto-detects patterns like {{xxx_name}}, {{xxx_expiry}} and finds matching arrays
 *
 * Example: {{hosting_name}} will look for arrays: hostings, hosting_list, hosting
 * and extract the 'name' field from the matched item
 */
function extractArrayItemFields(
  attributes: Record<string, any>,
  templateVars: string[],
  segmentFilter?: SegmentFilter
): Record<string, any> {
  const result = { ...attributes };

  // Group variables by potential array prefix (e.g., hosting_name, hosting_expiry -> hosting)
  const prefixGroups: Record<string, Record<string, string>> = {};

  for (const varName of templateVars) {
    // Skip if variable already exists in attributes
    if (result[varName] !== undefined) {
      continue;
    }

    // Check if variable follows pattern: prefix_field (e.g., hosting_name, domain_expiry)
    const match = varName.match(/^([a-zA-Z0-9]+)_([a-zA-Z0-9_]+)$/);
    if (match) {
      const prefix = match[1];
      const field = match[2];

      if (!prefixGroups[prefix]) {
        prefixGroups[prefix] = {};
      }
      prefixGroups[prefix][field] = varName; // field => template_var
    }
  }

  // For each prefix group, try to find a matching array in attributes
  for (const [prefix, fieldMappings] of Object.entries(prefixGroups)) {
    // Try common array naming patterns
    const possibleArrayKeys = [
      prefix + 's',      // hosting -> hostings
      prefix + '_list',  // vps -> vps_list
      prefix + 'es',     // box -> boxes
      prefix,            // if already plural or exact match
    ];

    let arrayKey: string | null = null;
    let items: any[] | null = null;

    for (const key of possibleArrayKeys) {
      if (attributes[key] && Array.isArray(attributes[key]) && attributes[key].length > 0) {
        // Check if it's an array of objects (not a simple array)
        const firstItem = attributes[key][0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          arrayKey = key;
          items = attributes[key];
          break;
        }
      }
    }

    if (!items || !arrayKey) {
      continue;
    }

    // Find the best matching item from the array
    const matchedItem = findMatchingArrayItem(items, arrayKey, segmentFilter);

    if (matchedItem) {
      // Extract all requested fields from the matched item
      for (const [field, templateVar] of Object.entries(fieldMappings)) {
        if (matchedItem[field] !== undefined) {
          result[templateVar] = matchedItem[field];
        }
      }
    }
  }

  return result;
}

/**
 * Find the best matching item from an array based on segment filter or default logic
 */
function findMatchingArrayItem(
  items: any[],
  arrayKey: string,
  segmentFilter?: SegmentFilter
): any | null {
  // If segment filter specifies a condition on this array, find the matching item
  if (segmentFilter?.conditions) {
    for (const condition of segmentFilter.conditions) {
      if (condition.key === arrayKey) {
        const operator = condition.operator || '';
        const value = condition.value;

        // Handle expiry-based operators
        const expiryOperators = [
          'any_expiry_in_days', 'any_expiry_within', 'any_expiry_today',
          'any_expiry_after', 'any_expiry_expired_since'
        ];

        if (expiryOperators.includes(operator)) {
          const matchedItem = findItemByExpiryCondition(items, operator, value);
          if (matchedItem) {
            return matchedItem;
          }
        }
      }
    }
  }

  // Default fallback: find best item based on common patterns
  return findBestDefaultItem(items);
}

/**
 * Find an item that matches an expiry-based condition
 */
function findItemByExpiryCondition(items: any[], operator: string, value: any): any | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const item of items) {
    // Look for any date field (expiry, expiry_date, expires_at, etc.)
    const expiryValue = item.expiry ?? item.expiry_date ?? item.expires_at;
    if (!expiryValue) continue;

    try {
      const expiryDate = new Date(expiryValue);
      expiryDate.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      switch (operator) {
        case 'any_expiry_today':
          if (daysUntilExpiry === 0) return item;
          break;
        case 'any_expiry_in_days':
          if (daysUntilExpiry === Number(value)) return item;
          break;
        case 'any_expiry_within':
          if (daysUntilExpiry >= 0 && daysUntilExpiry <= Number(value)) return item;
          break;
        case 'any_expiry_after':
          if (daysUntilExpiry > Number(value)) return item;
          break;
        case 'any_expiry_expired_since':
          if (daysUntilExpiry < 0 && Math.abs(daysUntilExpiry) <= Number(value)) return item;
          break;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Find the best default item from an array (first active, or soonest expiring)
 */
function findBestDefaultItem(items: any[]): any | null {
  if (!items || items.length === 0) {
    return null;
  }

  // Try to find active items (check common active/status field patterns)
  const activeItems = items.filter(item => {
    if (item.active) return true;
    if (item.is_active) return true;
    if (item.status && ['active', 'enabled', 'valid'].includes(item.status)) return true;
    return false;
  });

  const itemsToSort = activeItems.length > 0 ? [...activeItems] : [...items];

  // Sort by expiry date (soonest first) - check common expiry field patterns
  itemsToSort.sort((a, b) => {
    const expiryA = a.expiry ?? a.expiry_date ?? a.expires_at ?? '9999-12-31';
    const expiryB = b.expiry ?? b.expiry_date ?? b.expires_at ?? '9999-12-31';
    return expiryA.localeCompare(expiryB);
  });

  return itemsToSort[0] || null;
}

/**
 * Extract all template variables from a string
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
}

/**
 * Render template with contact attributes
 * Main function to use for variable replacement
 */
export function renderTemplate(
  template: string,
  attributes: Record<string, any>,
  segmentFilter?: SegmentFilter
): string {
  if (!template) return '';

  // Extract all template variables
  const templateVars = extractTemplateVariables(template);

  // Extract array item fields (hosting_name, hosting_expiry, etc.)
  const expandedAttributes = extractArrayItemFields(attributes, templateVars, segmentFilter);

  // Replace all {{variable}} placeholders
  let result = template;
  for (const [key, value] of Object.entries(expandedAttributes)) {
    if (value === undefined || value === null) continue;

    // Convert arrays/objects to JSON string
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), stringValue);
  }

  return result;
}

/**
 * Render template with HTML styling for preview
 * Shows resolved variables in green, unresolved in amber
 */
export function renderTemplateWithStyles(
  template: string,
  attributes: Record<string, any>,
  segmentFilter?: SegmentFilter
): string {
  if (!template) return '';

  // Escape HTML first
  let result = template.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Extract all template variables
  const templateVars = extractTemplateVariables(template);

  // Extract array item fields
  const expandedAttributes = extractArrayItemFields(attributes, templateVars, segmentFilter);

  // Replace variables with styled spans
  result = result.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, varName) => {
    const value = expandedAttributes[varName];

    if (value !== undefined && value !== null) {
      // Variable resolved - green highlight
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return `<span style="background-color: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${displayValue}</span>`;
    }

    // Variable not found - amber highlight
    return `<span style="background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">{{${varName}}}</span>`;
  });

  // Convert newlines to <br>
  result = result.replace(/\n/g, '<br />');

  return result;
}

/**
 * Generate HTML email preview with styled header
 */
export function generateEmailHtml(
  body: string,
  displayName: string,
  attributes?: Record<string, any>,
  segmentFilter?: SegmentFilter
): string {
  const htmlBody = attributes
    ? renderTemplateWithStyles(body, attributes, segmentFilter)
    : body.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />');

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                    <tr>
                        <td style="background-color: #515BC3; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">${displayName}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #ffffff; padding: 30px;">
                            <div style="color: #4B5563; font-size: 15px; line-height: 1.6;">${htmlBody}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #F9FAFB; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">&copy; ${year} ${displayName}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Check if string contains Unicode characters (non-GSM-7)
 */
export function hasUnicode(str: string): boolean {
  return new Blob([str]).size !== str.length;
}
