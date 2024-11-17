import React from 'react';
import { Character, Monster, Skill } from '../types/game';

interface CombatPanelProps {
  player: Character;
  monster: Monster | null;
  onUseSkill: (skill: Skill) => void;
  onFlee: () => void;
  combatLog: string[];
}

export default function CombatPanel({
  player,
  monster,
  onUseSkill,
  onFlee,
  combatLog
}: CombatPanelProps) {
  if (!monster) return null;

  return (
    <div className="game-section">
      {/* 战斗状态 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 玩家状态 */}
        <div>
          <div className="font-bold mb-2">{player.name}</div>
          <div className="space-y-2">
            <div>
              HP: {player.hp}/{player.maxHp}
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-red-500" 
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div>
              MP: {player.mp}/{player.maxMp}
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-blue-500" 
                  style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 怪物状态 */}
        <div>
          <div className="font-bold mb-2">{monster.name} [Lv.{monster.level}]</div>
          <div>
            HP: {monster.hp}/{monster.maxHp}
            <div className="progress-bar">
              <div 
                className="progress-fill bg-red-500" 
                style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 战斗日志 */}
      <div className="h-32 overflow-y-auto p-2 bg-slate-800/50 rounded-lg mb-4 text-sm text-gray-300">
        {combatLog.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>

      {/* 技能列表 */}
      <div className="grid grid-cols-2 gap-2">
        {player.skills.map(skill => (
          <button
            key={skill.id}
            onClick={() => onUseSkill(skill)}
            disabled={player.mp < skill.mpCost || skill.currentCooldown > 0}
            className="p-2 border border-gray-700 rounded bg-slate-800 hover:bg-slate-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-sm font-bold text-gray-200">{skill.name}</div>
            <div className="text-xs text-gray-400">
              MP消耗: {skill.mpCost}
              {skill.currentCooldown > 0 && ` | 冷却: ${skill.currentCooldown}回合`}
            </div>
          </button>
        ))}
      </div>

      {/* 逃跑按钮 */}
      <button
        onClick={onFlee}
        className="w-full mt-4 p-2 border border-red-700 rounded bg-red-900 
                   hover:bg-red-800 text-white"
      >
        逃跑
      </button>
    </div>
  );
}