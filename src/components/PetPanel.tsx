import React from 'react';
import { Pet } from '../types/game';

interface PetPanelProps {
  pets: Pet[];
}

export default function PetPanel({ pets }: PetPanelProps) {
  return (
    <div className="game-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-600/30 rounded-lg">
          <span className="text-2xl">🐾</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">灵宠</h2>
          <p className="text-sm text-gray-400">{pets.length} 只灵宠</p>
        </div>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">🦊</span>
          <p className="text-gray-400">暂无灵宠</p>
          <p className="text-sm text-gray-500 mt-2">可以在灵兽山寻找和收服灵宠</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pets.map((pet) => (
            <div key={pet.id} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-200">{pet.name}</h3>
                  <p className="text-sm text-gray-400">等级 {pet.level}</p>
                </div>
                <div className="text-sm text-gray-400">
                  忠诚度: {pet.loyalty}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">攻击: {pet.stats.attack}</div>
                  <div className="text-sm text-gray-400">防御: {pet.stats.defense}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">灵力: {pet.stats.spirit}</div>
                  <div className="text-sm text-gray-400">敏捷: {pet.stats.agility}</div>
                </div>
              </div>

              {pet.skills.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">技能：</div>
                  <div className="space-y-2">
                    {pet.skills.map((skill) => (
                      <div key={skill.id} className="text-sm text-gray-400">
                        {skill.name} Lv.{skill.level}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}