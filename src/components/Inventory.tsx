import React from 'react';
import { InventoryItem } from '../types/game';

interface InventoryProps {
  items: InventoryItem[];
  maxSize: number;
  onUseItem: (itemId: string) => void;
  onSellItem: (itemId: string, amount: number) => void;
  onSortInventory: () => void;
}

export default function Inventory({
  items,
  maxSize,
  onUseItem,
  onSellItem,
  onSortInventory
}: InventoryProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-orange-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      case 'uncommon': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'consumable': return '🧪';
      case 'material': return '📦';
      case 'quest': return '📜';
      default: return '❓';
    }
  };

  return (
    <div className="game-section">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold">
          背包 ({items.length}/{maxSize})
        </div>
        <button
          onClick={onSortInventory}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        >
          整理背包
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-700 rounded">
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-medium ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </span>
                    {item.level && (
                      <span className="ml-2 text-sm text-gray-500">
                        Lv.{item.level}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    数量: {item.quantity}
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 mt-1">
                  {item.description}
                </div>
                
                {item.effects && (
                  <div className="mt-2 space-y-1">
                    {item.effects.map((effect, index) => (
                      <div key={index} className="text-sm text-blue-400">
                        {effect.type}: +{effect.value}
                        {effect.duration && ` (${effect.duration}秒)`}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  {item.usable && (
                    <button
                      onClick={() => onUseItem(item.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                    >
                      使用
                    </button>
                  )}
                  {item.sellPrice && (
                    <button
                      onClick={() => onSellItem(item.id, 1)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                    >
                      出售 ({item.sellPrice}金币)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            背包是空的
          </div>
        )}
      </div>
    </div>
  );
}