import React, { useState, useEffect } from 'react';
import { MapTile, TeleportDestination } from '../types/game';
import { useGame } from '../contexts/GameContext';
import { TeleportManager } from '../utils/map/TeleportManager';
import { TileManager } from '../utils/map/TileManager';
import { GatheringSystem } from '../systems/GatheringSystem';

interface LocationPanelProps {
  location: {
    name: string;
    description: string;
    availableActions: string[];
  };
}

export default function LocationPanel({ location }: LocationPanelProps) {
  const { gameState, updateGameState, addMessage } = useGame();
  const [currentTile, setCurrentTile] = useState<MapTile | null>(null);
  const [teleports, setTeleports] = useState<TeleportDestination[]>([]);
  const [isGathering, setIsGathering] = useState(false);

  useEffect(() => {
    const loadTileData = async () => {
      try {
        const tile = await TileManager.getMapTile(gameState.currentMap, gameState.position);
        setCurrentTile(tile);

        if (tile) {
          const availableTeleports = await TeleportManager.getAvailableTeleports(
            gameState.currentMap,
            gameState.position
          );
          setTeleports(availableTeleports);
        }
      } catch (error) {
        console.error('Failed to load tile data:', error);
        addMessage({ type: 'system', content: '※ 无法加载当前位置信息' });
      }
    };

    loadTileData();
  }, [gameState.currentMap, gameState.position, addMessage]);

  const handleGather = async (resourceId: string) => {
    if (isGathering) return;

    setIsGathering(true);
    const gatheringTime = GatheringSystem.getGatheringTime(resourceId);
    
    addMessage({ type: 'system', content: '正在采集...' });
    
    setTimeout(async () => {
      await GatheringSystem.gather(
        gameState,
        resourceId,
        updateGameState,
        (message) => addMessage({ type: 'system', content: message })
      );
      setIsGathering(false);
    }, gatheringTime * 1000);
  };

  const handleTeleport = async (destination: TeleportDestination) => {
    try {
      const result = await TeleportManager.handleTeleport(
        destination,
        gameState,
        (newState) => {
          updateGameState(newState);
          addMessage({ 
            type: 'system', 
            content: `※ 传送成功！消耗了${destination.cost}金币` 
          });
        },
        (error) => {
          addMessage({ type: 'system', content: `※ ${error}` });
        }
      );

      if (!result.success) {
        addMessage({ type: 'system', content: `※ ${result.message}` });
      }
    } catch (error) {
      addMessage({ type: 'system', content: '※ 传送过程中发生错误' });
    }
  };

  const getAvailableResources = () => {
    if (!currentTile?.resourceGroups) return [];
    
    // 根据地块类型返回可采集的资源
    switch (currentTile.type) {
      case 'forest':
        return ['spirit_herb', 'rare_herb'];
      case 'mountain':
        return ['spirit_stone', 'spirit_iron'];
      default:
        if (currentTile.name === '灵田') {
          return ['spirit_herb'];
        }
        return [];
    }
  };

  return (
    <div className="game-section">
      <div className="font-bold">
        当前位置: {location.name} ({gameState.position.x}, {gameState.position.y})
      </div>
      <div className="text-gray-700 my-1">
        {location.description}
      </div>
      <div className="divider" />
      
      {/* 可用操作 */}
      <div className="mb-2">这里可以：{location.availableActions.join('、')}</div>

      {/* 采集选项 */}
      {getAvailableResources().length > 0 && (
        <>
          <div className="divider" />
          <div className="font-bold mb-2">可采集资源：</div>
          <div className="space-y-2">
            {getAvailableResources().map((resourceId) => (
              <button
                key={resourceId}
                onClick={() => handleGather(resourceId)}
                disabled={isGathering}
                className={`w-full p-2 text-left ${
                  isGathering
                    ? 'bg-gray-600/20 cursor-not-allowed'
                    : 'bg-green-600/20 hover:bg-green-600/30'
                } rounded`}
              >
                采集 {resourceId === 'spirit_herb' ? '灵草' : '珍稀灵药'}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 传送选项 */}
      {teleports.length > 0 && (
        <>
          <div className="divider" />
          <div className="font-bold mb-2">传送选项：</div>
          <div className="space-y-2">
            {teleports.map((dest) => (
              <button
                key={dest.mapId}
                onClick={() => handleTeleport(dest)}
                disabled={
                  gameState.player.level < dest.requiredLevel || 
                  gameState.player.gold < dest.cost
                }
                className={`w-full p-2 rounded text-left ${
                  gameState.player.level >= dest.requiredLevel && 
                  gameState.player.gold >= dest.cost
                    ? 'bg-blue-600/20 hover:bg-blue-600/30'
                    : 'bg-gray-600/20 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{dest.name}</span>
                  <span className="text-sm text-gray-400">{dest.cost}金币</span>
                </div>
                {gameState.player.level < dest.requiredLevel && (
                  <div className="text-sm text-red-400">
                    需要等级 {dest.requiredLevel}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}