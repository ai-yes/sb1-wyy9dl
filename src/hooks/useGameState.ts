import { useState, useCallback } from 'react';
import { GameState, Quest, InventoryItem } from '../types/game';
import { CombatSystem } from '../systems/CombatSystem';
import { CultivationSystem } from '../systems/CultivationSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { QuestSystem } from '../systems/QuestSystem';
import { PetSystem } from '../systems/PetSystem';
import { TimeSystem } from '../systems/TimeSystem';
import DataManager from '../utils/DataManager';

export function useGameState(initialState: GameState) {
  const [gameState, setGameState] = useState(initialState);
  const [gameLog, setGameLog] = useState<string[]>(['欢迎来到创世OL！']);

  const addLogMessage = useCallback((message: string) => {
    setGameLog(prev => [...prev, message]);
  }, []);

  // 移动处理
  const handleMove = useCallback((direction: 'north' | 'south' | 'east' | 'west') => {
    setGameState(prev => {
      const newPosition = { ...prev.position };
      switch (direction) {
        case 'north':
          newPosition.y = Math.max(0, newPosition.y - 1);
          break;
        case 'south':
          newPosition.y = Math.min(prev.map.length - 1, newPosition.y + 1);
          break;
        case 'west':
          newPosition.x = Math.max(0, newPosition.x - 1);
          break;
        case 'east':
          newPosition.x = Math.min(prev.map[0].length - 1, newPosition.x + 1);
          break;
      }

      const newTile = prev.map[newPosition.y][newPosition.x];
      if (newTile.canMove) {
        addLogMessage(`来到了${newTile.name}`);
        if (newTile.npc) {
          addLogMessage(`${newTile.npc.name}：${newTile.npc.dialogue}`);
        }
        return { ...prev, position: newPosition };
      } else {
        addLogMessage('这个方向无法移动！');
        return prev;
      }
    });
  }, [addLogMessage]);

  // 修炼处理
  const handleCultivate = useCallback(async () => {
    await CultivationSystem.cultivate(
      gameState,
      setGameState,
      addLogMessage
    );
  }, [gameState, addLogMessage]);

  // 使用物品
  const handleUseItem = useCallback((item: InventoryItem) => {
    InventorySystem.useItem(
      gameState,
      item,
      setGameState,
      addLogMessage
    );
  }, [gameState, addLogMessage]);

  // 接受任务
  const handleAcceptQuest = useCallback((quest: Quest) => {
    QuestSystem.acceptQuest(
      gameState,
      quest,
      setGameState,
      addLogMessage
    );
  }, [gameState, addLogMessage]);

  // 时间推进
  const handleAdvanceTime = useCallback(() => {
    TimeSystem.advanceTime(
      gameState,
      setGameState,
      addLogMessage
    );
  }, [gameState, addLogMessage]);

  return {
    gameState,
    gameLog,
    actions: {
      move: handleMove,
      cultivate: handleCultivate,
      useItem: handleUseItem,
      acceptQuest: handleAcceptQuest,
      advanceTime: handleAdvanceTime,
      addLogMessage
    }
  };
}