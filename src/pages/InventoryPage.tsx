import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Inventory from '../components/Inventory';
import { useGame } from '../contexts/GameContext';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { gameState, useItem, sellItem, sortInventory } = useGame();

  return (
    <div className="game-container">
      <div className="game-section mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 rounded-lg">
              <span className="text-2xl">🎒</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">背包</h2>
              <p className="text-sm text-gray-400">
                {gameState.inventory.length}/{gameState.maxInventorySize} 个物品
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回游戏</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <span className="text-lg">{gameState.player.gold}</span>
          <span className="text-gray-400">金币</span>
        </div>
      </div>

      <Inventory
        items={gameState.inventory}
        maxSize={gameState.maxInventorySize}
        onUseItem={useItem}
        onSellItem={sellItem}
        onSortInventory={sortInventory}
      />

      <div className="game-footer">
        创世OL © 2024
      </div>
    </div>
  );
}