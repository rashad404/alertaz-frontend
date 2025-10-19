import NotificationSettingsClient from './NotificationSettingsClient';

export default async function NotificationSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return <NotificationSettingsClient lang={lang} />;
}

export async function generateStaticParams() {
  return [
    { lang: 'az' },
    { lang: 'en' },
    { lang: 'ru' },
  ];
}