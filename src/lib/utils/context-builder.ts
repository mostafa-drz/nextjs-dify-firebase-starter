/**
 * Context builder utility for Dify messages
 * Provides minimal context information for AI awareness
 */

export interface MessageContext extends Record<string, unknown> {
  language?: {
    code: string;
    locale: string;
  };
  timestamp?: string;
  timezone?: string;
}

/**
 * Builds minimal context object for Dify messages
 * @param locale - Current user locale (defaults to 'en')
 * @returns Context object with language and temporal information
 */
export async function buildMessageContext(locale: string = 'en'): Promise<MessageContext> {
  return {
    language: {
      code: locale,
      locale: `${locale}-US`, // Default to US variant for now
    },
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
