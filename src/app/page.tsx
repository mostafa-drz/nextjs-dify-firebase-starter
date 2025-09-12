import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

/**
 * Home Page - Server Component
 * Redirects to locale-based routing
 */
export default function Home() {
  // Server-side redirect to default locale
  redirect(`/${defaultLocale}`);
}
