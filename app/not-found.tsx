import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0e27] to-[#151933]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404 - Page Not Found</h1>
        <p className="text-gray-400 mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="text-purple-400 hover:underline">
          Go to home page
        </Link>
      </div>
    </div>
  );
}