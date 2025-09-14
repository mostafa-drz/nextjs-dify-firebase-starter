import { redirect } from 'next/navigation';

/**
 * Home Page - Server Component
 * Redirects to chat page (default locale is handled by middleware)
 */
export default function Home() {
  // Redirect to chat - middleware will handle locale routing
  redirect('/chat');
}
