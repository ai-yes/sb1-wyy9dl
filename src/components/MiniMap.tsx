import React from 'react';
import { MapTile } from '../types/game';

interface MiniMapProps {
  tiles: MapTile[][];
  centerX: number;
  centerY: number;
}

export default function MiniMap({ tiles, centerX, centerY }: MiniMapProps) {
  const getTileColor = (type: string): string => {
    switch (type) {
      case 'plain': return 'bg-emerald-900/30';
      case 'mountain': return 'bg-slate-700/50';
      case 'forest': return 'bg-green-900/30';
      case 'city': return 'bg-blue-900/30';
      case 'dungeon': return 'bg-red-900/30';
      case 'cave': return 'bg-purple-900/30';
      case 'lake': return 'bg-cyan-900/30';
      default: return 'bg-slate-900/50';
    }
  };

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/0 to-slate-800/80" />
      <div className="grid grid-cols-5 gap-1 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
        {tiles.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((tile, x) => {
              const isCenter = x === centerX && y === centerY;
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    w-8 h-8 rounded-lg relative flex items-center justify-center
                    ${isCenter ? 'bg-indigo-500/50 ring-2 ring-indigo-400' : getTileColor(tile.type)}
                  `}
                  title={tile.name}
                >
                  {isCenter && <span className="text-sm">👤</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}