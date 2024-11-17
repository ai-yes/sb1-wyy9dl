import React, { useState } from 'react';
import { MapTile } from '../types/game';
import { X, Sword, Users, Star, Mountain as MountainIcon, TreePine, Building, Home } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import NPCInfoDialog from './NPCInfoDialog';
import DataManager from '../utils/DataManager';

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentMap: {
    name: string;
    description: string;
    tiles: MapTile[][];
  };
  currentPosition: { x: number; y: number };
}

export default function MapDialog({ isOpen, onClose, currentMap, currentPosition }: MapDialogProps) {
  const { gameState } = useGame();
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  
  if (!isOpen) return null;

  if (!currentMap.tiles || !currentMap.tiles.length || !currentMap.tiles[0].length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-100">地图加载错误</h2>
            <p className="text-gray-400 mt-2">无法加载地图数据</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTile = currentMap.tiles.flat().find(
    tile => tile.x === currentPosition.x && tile.y === currentPosition.y
  );

  const getTileIcon = (tile: MapTile): JSX.Element => {
    switch (tile.type) {
      case 'city': return <Building className="w-4 h-4 text-blue-400" />;
      case 'mountain': return <MountainIcon className="w-4 h-4 text-gray-400" />;
      case 'forest': return <TreePine className="w-4 h-4 text-green-400" />;
      case 'dungeon': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Home className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTileColor = (tile: MapTile): string => {
    if (tile.requiredLevel && tile.requiredLevel > gameState.player.level) {
      return 'bg-red-900/30';
    }

    switch (tile.type) {
      case 'plain': return 'bg-emerald-900/30';
      case 'mountain': return 'bg-slate-700/50';
      case 'forest': return 'bg-green-900/30';
      case 'city': return 'bg-blue-900/30';
      case 'dungeon': return 'bg-purple-900/30';
      case 'cave': return 'bg-amber-900/30';
      case 'lake': return 'bg-cyan-900/30';
      default: return 'bg-slate-900/50';
    }
  };

  const handleNPCClick = async (e: React.MouseEvent, npcId: string) => {
    e.stopPropagation();
    try {
      const npc = await DataManager.getNPC(npcId);
      if (npc) {
        setSelectedNpcId(npcId);
        setSelectedNpc(npc);
      }
    } catch (error) {
      console.error('Failed to load NPC data:', error);
    }
  };

  const getTileStatus = (tile: MapTile) => {
    const statuses = [];

    if (tile.npcIds?.length) {
      statuses.push(
        <div 
          key="npc"
          className="w-5 h-5 flex items-center justify-center bg-blue-600/20 rounded cursor-pointer hover:bg-blue-600/30 z-20"
          onClick={(e) => tile.npcIds && handleNPCClick(e, tile.npcIds[0])}
        >
          <Users className="w-3 h-3 text-blue-400" />
        </div>
      );
    }
    if (tile.monsterGroups?.length) {
      statuses.push(
        <div key="monster" className="w-5 h-5 flex items-center justify-center bg-red-600/20 rounded">
          <Sword className="w-3 h-3 text-red-400" />
        </div>
      );
    }
    if (tile.cultivationBonus) {
      statuses.push(
        <div key="cultivation" className="w-5 h-5 flex items-center justify-center bg-yellow-600/20 rounded">
          <Star className="w-3 h-3 text-yellow-400" />
        </div>
      );
    }

    return statuses;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-lg w-[90%] max-w-4xl p-6">
          {/* 标题栏 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">{currentMap.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{currentMap.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 图例 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Building className="w-4 h-4 text-blue-400" />
              <span>城镇</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MountainIcon className="w-4 h-4 text-gray-400" />
              <span>山脉</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <TreePine className="w-4 h-4 text-green-400" />
              <span>森林</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>秘境</span>
            </div>
          </div>

          {/* 地图网格 */}
          <div className="flex justify-center">
            <div className="grid gap-1 p-4 bg-slate-900/50 rounded-lg overflow-auto">
              {currentMap.tiles.map((row, y) => (
                <div key={y} className="flex gap-1">
                  {row.map((tile, x) => {
                    const isCurrentPos = tile.x === currentPosition.x && tile.y === currentPosition.y;
                    const statuses = getTileStatus(tile);
                    
                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`
                          w-12 h-12 rounded-lg flex flex-col items-center justify-center
                          ${getTileColor(tile)}
                          ${isCurrentPos ? 'ring-2 ring-yellow-400' : ''}
                          relative group
                        `}
                      >
                        {getTileIcon(tile)}
                        
                        {/* 状态图标 */}
                        {statuses.length > 0 && (
                          <div className="absolute bottom-1 left-1 flex gap-0.5">
                            {statuses}
                          </div>
                        )}
                        
                        {/* 当前位置标记 */}
                        {isCurrentPos && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                        )}
                        
                        {/* 悬停提示 */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                          <div className="font-bold">{tile.name}</div>
                          <div className="text-gray-300 mt-1">{tile.description}</div>
                          <div className="text-gray-400 mt-1">坐标: ({tile.x}, {tile.y})</div>
                          {tile.requiredLevel && (
                            <div className={`mt-1 ${
                              gameState.player.level >= tile.requiredLevel
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              需要等级: {tile.requiredLevel}
                            </div>
                          )}
                          {tile.monsterGroups && tile.monsterGroups.length > 0 && (
                            <div className="text-red-400 mt-1">⚠️ 危险区域</div>
                          )}
                          {tile.npcIds && tile.npcIds.length > 0 && (
                            <div className="text-blue-400 mt-1">👥 有NPC在此</div>
                          )}
                          {tile.cultivationBonus && (
                            <div className="text-yellow-400 mt-1">
                              ✨ 修炼效率提升{(tile.cultivationBonus * 100 - 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 地图信息 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h3 className="text-lg font-bold mb-2">当前位置</h3>
              <p className="text-sm text-gray-300">
                {currentTile?.name || '未知区域'} ({currentPosition.x}, {currentPosition.y})
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {currentTile?.description || ''}
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h3 className="text-lg font-bold mb-2">地图信息</h3>
              <div className="text-sm text-gray-300">
                <div>大小: {currentMap.tiles[0].length} x {currentMap.tiles.length}</div>
                <div>已探索: {Math.floor(Math.random() * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NPC信息对话框 */}
      <NPCInfoDialog
        npc={selectedNpc}
        isOpen={!!selectedNpc}
        onClose={() => {
          setSelectedNpcId(null);
          setSelectedNpc(null);
        }}
      />
    </>
  );
}