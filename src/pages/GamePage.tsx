import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { MapTile } from '../types/game';
import CharacterPanel from '../components/CharacterPanel';
import LocationPanel from '../components/LocationPanel';
import DirectionPanel from '../components/DirectionPanel';
import NPCPanel from '../components/NPCPanel';
import MenuPanel from '../components/MenuPanel';
import GameLog from '../components/GameLog';
import NavigationBar from '../components/NavigationBar';
import MapDialog from '../components/MapDialog';
import CombatPanel from '../components/CombatPanel';
import LoadingScreen from '../components/LoadingScreen';
import { MapManager } from '../utils/map/MapManager';
import { CombatSystem } from '../systems/CombatSystem';

export default function GamePage() {
  const navigate = useNavigate();
  const { gameState, isLoading, updateGameState, addMessage } = useGame();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentTile, setCurrentTile] = useState<MapTile | null>(null);
  const [mapTiles, setMapTiles] = useState<MapTile[][]>([]);
  const [adjacentTiles, setAdjacentTiles] = useState<{
    north: MapTile | null;
    south: MapTile | null;
    east: MapTile | null;
    west: MapTile | null;
  }>({
    north: null,
    south: null,
    east: null,
    west: null
  });

  useEffect(() => {
    async function loadTileData() {
      if (!isLoading) {
        try {
          const tile = await MapManager.getMapTile(gameState.currentMap, gameState.position);
          const adjacent = await MapManager.getAdjacentTiles(gameState.currentMap, gameState.position);
          setCurrentTile(tile);
          setAdjacentTiles(adjacent);
        } catch (error) {
          console.error('Failed to load tile data:', error);
          addMessage({ type: 'system', content: '※ 无法加载地图数据' });
        }
      }
    }
    loadTileData();
  }, [gameState.currentMap, gameState.position, isLoading, addMessage]);

  useEffect(() => {
    async function loadMapTiles() {
      if (isMapOpen && !isLoading) {
        try {
          const tiles = await MapManager.getMiniMap(gameState.currentMap, gameState.position);
          setMapTiles(tiles);
        } catch (error) {
          console.error('Failed to load map tiles:', error);
          addMessage({ type: 'system', content: '※ 无法加载地图数据' });
        }
      }
    }
    loadMapTiles();
  }, [isMapOpen, gameState.currentMap, gameState.position, isLoading, addMessage]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleMove = async (direction: 'north' | 'south' | 'east' | 'west') => {
    if (gameState.inCombat) {
      addMessage({ type: 'system', content: '※ 战斗中无法移动！' });
      return;
    }

    const newPosition = { ...gameState.position };
    
    switch (direction) {
      case 'north':
        newPosition.y--;
        break;
      case 'south':
        newPosition.y++;
        break;
      case 'east':
        newPosition.x++;
        break;
      case 'west':
        newPosition.x--;
        break;
    }

    try {
      const canMove = await MapManager.isValidMove(
        gameState.currentMap,
        gameState.position,
        newPosition,
        gameState.player.level,
        gameState.player.cultivation.realm
      );

      if (canMove) {
        const newTile = await MapManager.getMapTile(gameState.currentMap, newPosition);
        if (newTile) {
          updateGameState({ position: newPosition });
          addMessage({ type: 'system', content: `※ 来到了${newTile.name}` });
          await checkEncounter(newTile);
        }
      } else {
        addMessage({ type: 'system', content: '※ 这个方向无法移动！' });
      }
    } catch (error) {
      console.error('Movement error:', error);
      addMessage({ type: 'system', content: '※ 移动失败' });
    }
  };

  const checkEncounter = async (tile: MapTile) => {
    try {
      const hasEncounter = await MapManager.checkEncounter(tile);
      if (hasEncounter) {
        const monster = await MapManager.getRandomMonster(tile);
        if (monster) {
          updateGameState({
            inCombat: true,
            currentMonster: monster
          });
          addMessage({ type: 'system', content: `※ 遭遇了 ${monster.name} [${monster.level}级]！` });
        }
      }
    } catch (error) {
      console.error('Encounter check error:', error);
      addMessage({ type: 'system', content: '※ 检查遭遇失败' });
    }
  };

  const handleUseSkill = async (skill: any) => {
    if (!gameState.currentMonster) return;

    const result = await CombatSystem.handleCombat(
      { ...gameState },
      gameState.currentMonster,
      (newState) => {
        updateGameState({
          player: newState.player,
          inventory: newState.inventory,
          inCombat: newState.inCombat,
          currentMonster: newState.currentMonster
        });
      },
      (message, isImportant) => {
        if (isImportant) {
          addMessage({ type: 'system', content: `※ ${message}` });
        }
        setCombatLog(prev => [...prev, message]);
      }
    );

    if (result) {
      updateGameState({
        inCombat: false,
        currentMonster: null
      });
      setCombatLog([]);
    }
  };

  const handleFlee = () => {
    const fleeChance = 0.4 + (gameState.player.agility * 0.01);
    if (Math.random() < fleeChance) {
      updateGameState({
        inCombat: false,
        currentMonster: null
      });
      addMessage({ type: 'system', content: '※ 成功逃脱！' });
      setCombatLog([]);
    } else {
      addMessage({ type: 'system', content: '※ 逃跑失败！' });
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-title">创世OL</div>
        <div className="server-info">
          青云门 | 在线: 1,286 | {new Date().toLocaleTimeString()}
        </div>
      </div>

      <CharacterPanel character={gameState.player} />

      <LocationPanel 
        location={{
          name: currentTile?.name || '未知区域',
          description: currentTile?.description || '',
          availableActions: ['打坐', '练功', '疗伤']
        }} 
      />

      {gameState.inCombat ? (
        <CombatPanel
          player={gameState.player}
          monster={gameState.currentMonster}
          onUseSkill={handleUseSkill}
          onFlee={handleFlee}
          combatLog={combatLog}
        />
      ) : (
        <DirectionPanel 
          adjacentTiles={adjacentTiles}
          onMove={handleMove}
          onOpenMap={() => setIsMapOpen(true)}
        />
      )}

      <NPCPanel npcIds={currentTile?.npcIds || []} />
      <MenuPanel 
        onOpenInventory={() => navigate('/inventory')} 
        onOpenProfile={() => navigate('/profile')}
      />
      <GameLog messages={gameState.messages} />

      <div className="quick-menu">
        <a className="nav-link" href="#">打坐恢复[Z]</a>
        <a className="nav-link" href="#" onClick={() => setIsMapOpen(true)}>查看地图[M]</a>
        <a className="nav-link" href="#" onClick={() => navigate('/inventory')}>
          打开背包[B]
        </a>
        <a className="nav-link" href="#">系统菜单[X]</a>
      </div>

      <NavigationBar />

      <div className="game-footer">
        流量: 2.5K | 在线: 1:45:30<br />
        创世OL © 2024
      </div>

      <MapDialog
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        currentMap={{
          name: currentTile?.name || '',
          description: currentTile?.description || '',
          tiles: mapTiles
        }}
        currentPosition={gameState.position}
      />
    </div>
  );
}