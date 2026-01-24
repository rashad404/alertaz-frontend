/**
 * Template Renderer Utility
 *
 * Note: Template variable rendering is now handled entirely by the backend
 * (SegmentController::previewMessages and TemplateRenderer) to ensure
 * preview matches exactly what gets sent.
 *
 * This file only contains utility functions needed by the frontend.
 */

/**
 * Check if string contains Unicode characters (non-GSM-7)
 * Used for SMS validation to warn about Unicode characters
 * which increase message size and cost.
 */
export function hasUnicode(str: string): boolean {
  return new Blob([str]).size !== str.length;
}

/**
 * Extract all template variables from a string
 * Used for UI features like variable suggestions
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
}
