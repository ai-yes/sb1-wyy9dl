import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⚔️</div>
        <h1 className="text-2xl font-bold mb-2">创世OL</h1>
        <p className="text-gray-400">正在加载游戏世界...</p>
      </div>
    </div>
  );
}