import React from 'react';
import { Character } from '../types/game';

interface CharacterStatusProps {
  character: Character;
}

export default function CharacterStatus({ character }: CharacterStatusProps) {
  return (
    <div className="game-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-600/30 rounded-lg">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">{character.name}</h2>
          <p className="text-sm text-gray-400">等级 {character.level}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* 经验值 */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-400">
            <span>经验值</span>
            <span>{character.exp}/{character.maxExp}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="stat-bar stat-bar-exp"
              style={{ width: `${(character.exp / character.maxExp) * 100}%` }}
            />
          </div>
        </div>
        
        {/* HP */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <span>❤️</span>
              <span>生命值</span>
            </div>
            <span>{character.hp}/{character.maxHp}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="stat-bar stat-bar-hp"
              style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
            />
          </div>
        </div>
        
        {/* MP */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>法力值</span>
            </div>
            <span>{character.mp}/{character.maxMp}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="stat-bar stat-bar-mp"
              style={{ width: `${(character.mp / character.maxMp) * 100}%` }}
            />
          </div>
        </div>
        
        {/* 属性值 */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-600/20 rounded">
                <span className="text-xl">⚔️</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">攻击</div>
                <div className="font-medium">{character.attack}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-600/20 rounded">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">灵力</div>
                <div className="font-medium">{character.spirit}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-600/20 rounded">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">防御</div>
                <div className="font-medium">{character.defense}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600/20 rounded">
                <span className="text-xl">💨</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">敏捷</div>
                <div className="font-medium">{character.agility}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 金币 */}
        <div className="flex items-center gap-2 mt-4 p-3 bg-slate-700/30 rounded-lg">
          <span className="text-xl">💰</span>
          <span className="text-gray-300">{character.gold}</span>
          <span className="text-gray-500">金币</span>
        </div>
      </div>
    </div>
  );
}