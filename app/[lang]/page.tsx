'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default function HomePage({ params }: HomePageProps) {
  const [lang, setLang] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setLang(p.lang);
      fetchApiMessage(p.lang);
    });
  }, [params]);

  const fetchApiMessage = async (locale: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';
      const response = await axios.get(`${apiUrl}/${locale}/hello`);
      setApiMessage(response.data.message);
    } catch (error) {
      setApiMessage('Failed to fetch from API');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl mx-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 dark:text-white">
          Welcome to Alertaz
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
          Hello World from Next.js Frontend!
        </p>
        <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            API Response:
          </p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {apiMessage}
          </p>
        </div>
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Language: {lang}</p>
          <p>Port: 3007</p>
          <p>Backend API: Port 8007</p>
        </div>
      </div>
    </div>
  );
}
