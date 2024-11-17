import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { gameState } = useGame();
  const { player } = gameState;

  const getRankTitle = () => {
    const { realm, stage } = player.cultivation;
    return `${realm}第${stage}重`;
  };

  const getExpPercentage = () => {
    return ((player.exp / player.maxExp) * 100).toFixed(1);
  };

  const getCultivationPercentage = () => {
    return player.cultivation.progress.toFixed(1);
  };

  return (
    <div className="game-container">
      <div className="game-section mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/30 rounded-lg">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">个人信息</h2>
              <p className="text-sm text-gray-400">{getRankTitle()}</p>
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

        {/* 基本信息 */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h3 className="text-lg font-medium mb-3">基本属性</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">道号</div>
                <div className="text-lg">{player.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">境界</div>
                <div className="text-lg">{getRankTitle()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">等级</div>
                <div className="text-lg">{player.level}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">金币</div>
                <div className="text-lg">{player.gold}</div>
              </div>
            </div>
          </div>

          {/* 经验与修为 */}
          <div className="p-4 bg-slate-700/30 rounded-lg space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>经验值</span>
                <span>{player.exp}/{player.maxExp}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${getExpPercentage()}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>修为进度</span>
                <span>{getCultivationPercentage()}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{ width: `${getCultivationPercentage()}%` }}
                />
              </div>
            </div>
          </div>

          {/* 战斗属性 */}
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h3 className="text-lg font-medium mb-3">战斗属性</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600/20 rounded">
                  <span className="text-xl">❤️</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">生命值</div>
                  <div>{player.hp}/{player.maxHp}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600/20 rounded">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">法力值</div>
                  <div>{player.mp}/{player.maxMp}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-600/20 rounded">
                  <span className="text-xl">⚔️</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">攻击力</div>
                  <div>{player.attack}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-600/20 rounded">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">防御力</div>
                  <div>{player.defense}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-600/20 rounded">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">灵力</div>
                  <div>{player.spirit}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-600/20 rounded">
                  <span className="text-xl">💨</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">敏捷</div>
                  <div>{player.agility}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 技能列表 */}
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h3 className="text-lg font-medium mb-3">已学技能</h3>
            <div className="grid grid-cols-2 gap-3">
              {player.skills.map((skill) => (
                <div key={skill.id} className="p-3 bg-slate-600/50 rounded-lg">
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    消耗: {skill.mpCost} MP
                    {skill.cooldown > 0 && ` | 冷却: ${skill.cooldown}回合`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="game-footer">
        创世OL © 2024
      </div>
    </div>
  );
}