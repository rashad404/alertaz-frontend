import AlertsPageClient from './AlertsPageClient';

export default async function AlertsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return <AlertsPageClient lang={lang} />;
}

export async function generateStaticParams() {
  return [
    { lang: 'az' },
    { lang: 'en' },
    { lang: 'ru' },
  ];
}