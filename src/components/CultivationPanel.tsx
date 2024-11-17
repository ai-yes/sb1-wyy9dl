import React from 'react';
import { Character } from '../types/game';

interface CultivationPanelProps {
  character: Character;
  onCultivate: () => void;
}

export default function CultivationPanel({ character, onCultivate }: CultivationPanelProps) {
  return (
    <div className="game-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-600/30 rounded-lg">
          <span className="text-2xl">🔥</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">修炼境界</h2>
          <p className="text-sm text-gray-400">{character.cultivation.realm} 第{character.cultivation.stage}重</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 修炼进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>修炼进度</span>
            <span>{character.cultivation.progress}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-600 to-yellow-400"
              style={{ width: `${character.cultivation.progress}%` }}
            />
          </div>
        </div>

        {/* 境界说明 */}
        <div className="p-4 bg-slate-700/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⬆️</span>
            <span className="text-gray-300">下一境界</span>
          </div>
          <div className="text-sm text-gray-400">
            {character.cultivation.stage === 9 ? '练气圆满，可突破至筑基期' : `练气期第${character.cultivation.stage + 1}重`}
          </div>
        </div>

        {/* 修炼按钮 */}
        <button
          onClick={onCultivate}
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-lg font-medium text-white hover:from-orange-500 hover:to-yellow-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          打坐修炼
        </button>

        {/* 境界列表 */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300 mb-3">修仙境界</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span>🔵</span>
              <span>练气期（1-9重）</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>⚪</span>
              <span>筑基期（1-9重）</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>⚪</span>
              <span>金丹期（1-9重）</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>⚪</span>
              <span>元婴期（1-9重）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}