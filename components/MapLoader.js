'use client';

import dynamic from 'next/dynamic';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 dark:bg-gray-800 animate-pulse flex flex-col items-center justify-center relative overflow-hidden">
      {/* Skeleton Grid for Map Tiles Effect */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4 opacity-10">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="bg-gray-400 w-full h-full rounded-lg"></div>
        ))}
      </div>

      {/* Center Logo Placeholder */}
      <div className="z-10 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md p-4 rounded-full shadow-sm animate-bounce">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
    </div>
  ),
});

export default MapDisplay;
