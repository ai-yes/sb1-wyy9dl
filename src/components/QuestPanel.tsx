import React from 'react';
import { Quest } from '../types/game';

interface QuestPanelProps {
  activeQuests: Quest[];
  completedQuests: string[];
  onAcceptQuest: (quest: Quest) => void;
}

export default function QuestPanel({ activeQuests, completedQuests, onAcceptQuest }: QuestPanelProps) {
  return (
    <div className="game-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-600/30 rounded-lg">
          <span className="text-2xl">📋</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">任务</h2>
          <p className="text-sm text-gray-400">{activeQuests.length} 个进行中</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeQuests.map((quest) => (
          <div key={quest.id} className="p-4 bg-slate-700/30 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-200">{quest.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {quest.requirements.map((req, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {req.type === 'kill' ? '击杀' : '收集'} {req.target}
                  </span>
                  <span className="text-gray-300">
                    {req.current}/{req.amount}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-600/50">
              <div className="text-sm font-medium text-gray-300 mb-2">奖励：</div>
              <div className="space-y-1 text-sm text-gray-400">
                <div>经验值：{quest.rewards.exp}</div>
                <div>金币：{quest.rewards.gold}</div>
                {quest.rewards.items && (
                  <div>
                    物品：
                    {quest.rewards.items.map((item, index) => (
                      <span key={index}>
                        {item.amount}个 {item.id}
                        {index < quest.rewards.items!.length - 1 ? '、' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {activeQuests.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-3">✅</span>
            <p>暂无进行中的任务</p>
          </div>
        )}
      </div>
    </div>
  );
}