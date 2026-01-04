'use client';

import { useMediaPipeLoading } from '@/lib/mediapipe/loading-store';

export function MediaPipeLoader() {
  const { isLoading, progress, error } = useMediaPipeLoading();

  if (!isLoading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        {error ? (
          <>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Loading Failed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Loading AI Model</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Preparing pose detection... {progress}%
            </p>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
