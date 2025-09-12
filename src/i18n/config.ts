import { getRequestConfig } from 'next-intl/server';

/**
 * Supported locales configuration
 */
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/**
 * i18n configuration for next-intl
 */
export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`./messages/en.json`)).default,
    locale: locale || defaultLocale,
  };
});
