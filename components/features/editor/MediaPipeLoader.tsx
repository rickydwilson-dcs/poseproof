'use client';

import { useMediaPipeLoading } from '@/lib/mediapipe/loading-store';

export function MediaPipeLoader() {
  const { isLoading, progress, error } = useMediaPipeLoading();

  if (!isLoading && !error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[240px]">
        {error ? (
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-600 mb-1">Loading Failed</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Spinner matching background removal style */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-brand-blue dark:border-brand-blue rounded-full border-t-transparent animate-spin"
              ></div>
            </div>
            <div>
              <p className="text-sm font-medium text-text">Loading AI...</p>
              <p className="text-xs text-text-secondary">
                {progress}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
