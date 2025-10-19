/**
 * Parse multilingual content that could be a JSON string or object
 */
export function parseTranslatedContent(content: any, locale: string = 'az'): string {
  if (!content) return '';
  
  if (typeof content === 'string') {
    // Check if it's a JSON string
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        return parsed[locale] || parsed.az || parsed.en || content;
      } catch {
        return content;
      }
    }
    return content;
  }
  
  // If it's already an object
  if (typeof content === 'object' && content) {
    return content[locale] || content.az || content.en || '';
  }
  
  return '';
}