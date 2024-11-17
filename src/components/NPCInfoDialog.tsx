import React, { useState, useEffect } from 'react';
import { NPC, Quest, InventoryItem } from '../types/game';
import { X, ShoppingBag, Scroll, User, Shield } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import DataManager from '../utils/DataManager';
import { QuestSystem } from '../systems/QuestSystem';

interface NPCInfoDialogProps {
  npc: NPC | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NPCInfoDialog({ npc, isOpen, onClose }: NPCInfoDialogProps) {
  const { gameState, updateGameState, addMessage } = useGame();
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [questItems, setQuestItems] = useState<Record<string, InventoryItem>>({});

  useEffect(() => {
    async function loadQuests() {
      if (npc?.quests && npc.quests.length > 0) {
        setIsLoadingQuests(true);
        console.log('[NPCInfoDialog] Loading quests for NPC:', npc.id);
        
        try {
          // 加载任务数据
          const loadedQuests = await Promise.all(
            npc.quests.map(async (questId) => {
              try {
                return await DataManager.getQuest(questId);
              } catch (error) {
                console.error(`[NPCInfoDialog] Failed to load quest ${questId}:`, error);
                return null;
              }
            })
          );

          const validQuests = loadedQuests.filter((quest): quest is Quest => {
            if (!quest) return false;
            const isActive = gameState.activeQuests?.some(q => q.id === quest.id) ?? false;
            const isCompleted = gameState.completedQuests?.includes(quest.id) ?? false;
            return !isActive && !isCompleted;
          });

          // 加载任务奖励物品的详细信息
          const itemsData: Record<string, InventoryItem> = {};
          await Promise.all(
            validQuests.flatMap(quest => 
              (quest.rewards.items || []).map(async item => {
                try {
                  const itemData = await DataManager.getItem(item.id);
                  if (itemData) {
                    itemsData[item.id] = itemData;
                  }
                } catch (error) {
                  console.error(`[NPCInfoDialog] Failed to load item ${item.id}:`, error);
                }
              })
            )
          );

          setQuestItems(itemsData);
          setAvailableQuests(validQuests);
          console.log('[NPCInfoDialog] Successfully loaded quests and items');
        } catch (error) {
          console.error('[NPCInfoDialog] Failed to load quests:', error);
          addMessage({ type: 'system', content: '无法加载任务信息' });
        } finally {
          setIsLoadingQuests(false);
        }
      } else {
        setAvailableQuests([]);
        setQuestItems({});
      }
    }

    if (isOpen && npc) {
      loadQuests();
    } else {
      setAvailableQuests([]);
      setQuestItems({});
    }
  }, [npc, isOpen, gameState.activeQuests, gameState.completedQuests, addMessage]);

  const handleAcceptQuest = async (questId: string) => {
    try {
      await QuestSystem.acceptQuest(
        gameState,
        questId,
        updateGameState,
        (message) => addMessage({ type: 'system', content: message })
      );
      onClose();
    } catch (error) {
      console.error('Failed to accept quest:', error);
      addMessage({ 
        type: 'system', 
        content: error instanceof Error ? error.message : '接受任务失败'
      });
    }
  };

  if (!isOpen || !npc) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-gray-700 rounded w-[90%] max-w-2xl p-6">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-200">{npc.name}</h2>
              <p className="text-sm text-gray-500">{npc.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 对话内容 */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center gap-2 mb-2 text-gray-300">
              <User className="w-4 h-4" />
              <span className="font-medium">对话</span>
            </div>
            <p className="text-gray-400 italic">{npc.dialogue}</p>
          </div>

          {/* 商店信息 */}
          {npc.shop && (
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-2 text-gray-300">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-medium">商店</span>
              </div>
              <button className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-sm transition-colors">
                查看商品
              </button>
            </div>
          )}

          {/* 任务列表 */}
          {npc.quests && (
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-4 text-gray-300">
                <Scroll className="w-4 h-4" />
                <span className="font-medium">可接任务</span>
              </div>
              {isLoadingQuests ? (
                <div className="text-gray-500 text-center py-4">加载任务中...</div>
              ) : availableQuests.length > 0 ? (
                <div className="space-y-4">
                  {availableQuests.map((quest) => (
                    <div key={quest.id} className="p-3 bg-gray-700/50 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-gray-200 font-medium">{quest.title}</div>
                        <button
                          onClick={() => handleAcceptQuest(quest.id)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm text-gray-300 transition-colors"
                        >
                          接受
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{quest.description}</p>
                      <div className="text-sm text-gray-500">
                        <div>经验: {quest.rewards.exp}</div>
                        <div>金币: {quest.rewards.gold}</div>
                        {quest.rewards.items && quest.rewards.items.length > 0 && (
                          <div>
                            物品: {quest.rewards.items.map((item, index) => {
                              const itemData = questItems[item.id];
                              return (
                                <span key={item.id}>
                                  {item.amount}个{itemData?.name || item.id}
                                  {index < quest.rewards.items!.length - 1 ? '、' : ''}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  暂无可接任务
                </div>
              )}
            </div>
          )}

          {/* 装备展示 */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center gap-2 mb-3 text-gray-300">
              <Shield className="w-4 h-4" />
              <span className="font-medium">装备展示</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-700/50 rounded">
                <div className="text-sm text-gray-500">武器</div>
                <div className="text-gray-300">青玉剑</div>
              </div>
              <div className="p-3 bg-gray-700/50 rounded">
                <div className="text-sm text-gray-500">防具</div>
                <div className="text-gray-300">青云道袍</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}