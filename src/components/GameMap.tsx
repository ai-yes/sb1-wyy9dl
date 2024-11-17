import React from 'react';
import { Position, MapTile } from '../types/game';

interface GameMapProps {
  map: MapTile[][];
  position: Position;
  onMove: (direction: 'north' | 'south' | 'east' | 'west') => void;
}

export default function GameMap({ map, position, onMove }: GameMapProps) {
  const currentTile = map[position.y][position.x];
  
  return (
    <div className="game-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-600/30 rounded-lg">
          <span className="text-2xl">🗺️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">地图导航</h2>
          <p className="text-sm text-gray-400">当前位置：{currentTile.name}</p>
        </div>
      </div>
      
      {/* 小地图 */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/0 to-slate-800/80" />
        <div className="grid grid-cols-5 gap-1 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
          {[...Array(5)].map((_, y) => (
            <div key={y} className="flex gap-1">
              {[...Array(5)].map((_, x) => {
                const mapY = position.y + (y - 2);
                const mapX = position.x + (x - 2);
                const tile = map[mapY]?.[mapX];
                const isCurrentPos = x === 2 && y === 2;
                
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      w-8 h-8 rounded-lg relative flex items-center justify-center
                      ${isCurrentPos ? 'bg-indigo-500/50 ring-2 ring-indigo-400' :
                        tile ? 
                          tile.type === 'plain' ? 'bg-emerald-900/30' :
                          tile.type === 'mountain' ? 'bg-slate-700/50' :
                          tile.type === 'forest' ? 'bg-green-900/30' :
                          tile.type === 'city' ? 'bg-blue-900/30' :
                          'bg-red-900/30'
                        : 'bg-slate-900/50'
                      }
                    `}
                  >
                    {isCurrentPos && <span className="text-sm">👤</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* 方向控制 */}
      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        <div />
        <button onClick={() => onMove('north')} className="direction-btn">
          ⬆️
        </button>
        <div />
        <button onClick={() => onMove('west')} className="direction-btn">
          ⬅️
        </button>
        <div className="p-3 bg-slate-700/50 rounded-lg text-center">
          <span className="text-xl">🎯</span>
        </div>
        <button onClick={() => onMove('east')} className="direction-btn">
          ➡️
        </button>
        <div />
        <button onClick={() => onMove('south')} className="direction-btn">
          ⬇️
        </button>
        <div />
      </div>
      
      {/* 当前位置描述 */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <p className="text-gray-300">{currentTile.description}</p>
      </div>
    </div>
  );
}