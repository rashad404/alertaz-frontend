import { Suspense } from 'react';
import QuickSetup from '@/components/alerts/QuickSetup';

export default function QuickSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(81,91,195)]"></div>
      </div>
    }>
      <QuickSetup />
    </Suspense>
  );
}