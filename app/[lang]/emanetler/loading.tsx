export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 h-48 animate-pulse">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-36 py-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="px-4 md:px-8 lg:px-36 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto flex gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 md:px-8 lg:px-36 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Bank Header Skeleton */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                </div>
              </div>
              
              {/* Deposits Grid Skeleton */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((j) => (
                    <div key={j} className="border border-gray-200 dark:border-gray-600 rounded-lg p-5">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                      </div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}