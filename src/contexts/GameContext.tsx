import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState, InventoryItem } from '../types/game';
import { InventorySystem } from '../systems/InventorySystem';
import { MapManager } from '../utils/map/MapManager';
import DataManager from '../utils/DataManager';

interface GameContextType {
  gameState: GameState;
  isLoading: boolean;
  updateGameState: (newState: Partial<GameState>) => void;
  addMessage: (message: { type: 'system' | 'chat'; content: string }) => void;
  useItem: (itemId: string) => void;
  sellItem: (itemId: string, amount: number) => void;
  sortInventory: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeGame() {
      try {
        setIsLoading(true);
        
        // 初始化数据管理器
        await DataManager.initialize();
        
        // 获取初始角色数据
        const initialCharacter = await DataManager.getInitialCharacter();
        if (!initialCharacter) {
          throw new Error('Failed to load initial character data');
        }

        // 初始化地图系统
        await MapManager.initialize();

        // 设置初始游戏状态
        setGameState({
          player: initialCharacter,
          currentMap: 'starting_area',
          position: { x: 10, y: 10 },
          messages: [
            { type: 'system', content: '※ 系统：欢迎来到创世OL' }
          ],
          inCombat: false,
          currentMonster: null,
          inventory: [],
          maxInventorySize: 20,
          activeQuests: [], // 确保初始化为空数组
          completedQuests: [], // 确保初始化为空数组
          time: {
            day: 1,
            period: 'dawn'
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setIsLoading(false);
      }
    }

    initializeGame();
  }, []);

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...newState,
        player: {
          ...prev.player,
          ...(newState.player || {})
        },
        inventory: newState.inventory || prev.inventory,
        messages: newState.messages || prev.messages,
        activeQuests: newState.activeQuests || prev.activeQuests,
        completedQuests: newState.completedQuests || prev.completedQuests
      };
    });
  }, []);

  const addMessage = useCallback((message: { type: 'system' | 'chat'; content: string }) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message]
      };
    });
  }, []);

  const useItem = useCallback((itemId: string) => {
    if (!gameState) return;

    InventorySystem.useItem(
      gameState,
      itemId,
      (newState) => {
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            player: newState.player,
            inventory: newState.inventory
          };
        });
      },
      (message) => addMessage({ type: 'system', content: message })
    );
  }, [gameState, addMessage]);

  const sellItem = useCallback((itemId: string, amount: number) => {
    if (!gameState) return;

    InventorySystem.sellItem(
      gameState,
      itemId,
      amount,
      (newState) => {
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            player: newState.player,
            inventory: newState.inventory
          };
        });
      },
      (message) => addMessage({ type: 'system', content: message })
    );
  }, [gameState, addMessage]);

  const sortInventory = useCallback(() => {
    if (!gameState) return;

    InventorySystem.sortInventory(
      gameState,
      (newState) => {
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            inventory: newState.inventory
          };
        });
      }
    );
    addMessage({ type: 'system', content: '背包已整理完成' });
  }, [gameState, addMessage]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        isLoading,
        updateGameState,
        addMessage,
        useItem,
        sellItem,
        sortInventory
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}