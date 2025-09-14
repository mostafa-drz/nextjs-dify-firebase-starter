import type { Metadata } from 'next';
import { locales } from '@/i18n/config';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: _locale } = await params;
  return {
    title: 'Dify Firebase Boilerplate',
    description:
      'Next.js boilerplate with Dify.ai integration, Firebase auth, and credit management',
  };
}

export default async function LocaleLayout({ children }: Props) {
  return <>{children}</>;
}
