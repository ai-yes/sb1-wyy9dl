import React, { useState, useEffect } from 'react';
import { NPC, Quest, InventoryItem, Monster } from '../types/game';
import { X, ShoppingBag, Scroll, User, Shield } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import DataManager from '../utils/DataManager';
import { QuestSystem } from '../systems/QuestSystem';

interface NPCInfoDialogProps {
  npc: NPC | null;
  isOpen: boolean;
  onClose: () => void;
}

interface QuestTargetInfo {
  id: string;
  name: string;
}

export default function NPCInfoDialog({ npc, isOpen, onClose }: NPCInfoDialogProps) {
  const { gameState, updateGameState, addMessage } = useGame();
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [questItems, setQuestItems] = useState<Record<string, InventoryItem>>({});
  const [questTargets, setQuestTargets] = useState<Record<string, QuestTargetInfo>>({});

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

          // 加载任务奖励物品和目标物品/怪物的详细信息
          const itemsData: Record<string, InventoryItem> = {};
          const targetsData: Record<string, QuestTargetInfo> = {};

          await Promise.all([
            // 加载奖励物品信息
            ...validQuests.flatMap(quest => 
              (quest.rewards.items || []).map(async item => {
                try {
                  const itemData = await DataManager.getItem(item.id);
                  if (itemData) {
                    itemsData[item.id] = itemData;
                  }
                } catch (error) {
                  console.error(`[NPCInfoDialog] Failed to load reward item ${item.id}:`, error);
                }
              })
            ),
            // 加载任务目标信息
            ...validQuests.flatMap(quest =>
              quest.requirements.map(async req => {
                try {
                  console.log(`[NPCInfoDialog] Loading target info for: ${req.type} ${req.target}`);
                  if (req.type === 'gather') {
                    const itemData = await DataManager.getItem(req.target);
                    console.log(`[NPCInfoDialog] Loaded item data:`, itemData);
                    if (itemData) {
                      targetsData[req.target] = {
                        id: req.target,
                        name: itemData.name
                      };
                    }
                  } else if (req.type === 'kill') {
                    // 修改为直接从monster groups加载
                    const monsterGroup = await DataManager.getMonsterGroup('spirit_beasts_weak');
                    console.log(`[NPCInfoDialog] Loaded monster group:`, monsterGroup);
                    const monster = monsterGroup?.find(m => m.id === req.target);
                    console.log(`[NPCInfoDialog] Found monster:`, monster);
                    if (monster) {
                      targetsData[req.target] = {
                        id: req.target,
                        name: monster.name
                      };
                    }
                  }
                  console.log(`[NPCInfoDialog] Current targetsData:`, targetsData);
                } catch (error) {
                  console.error(`[NPCInfoDialog] Failed to load target info ${req.target}:`, error);
                }
              })
            ),
          ]);

          setQuestItems(itemsData);
          setQuestTargets(targetsData);
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
        setQuestTargets({});
      }
    }

    if (isOpen && npc) {
      loadQuests();
    } else {
      setAvailableQuests([]);
      setQuestItems({});
      setQuestTargets({});
    }
  }, [npc, isOpen, gameState.activeQuests, gameState.completedQuests, addMessage]);

  const getRequirementText = (req: Quest['requirements'][0]): string => {
    console.log(`[NPCInfoDialog] Getting text for requirement:`, req);
    console.log(`[NPCInfoDialog] Available targets:`, questTargets);
    const targetInfo = questTargets[req.target];
    console.log(`[NPCInfoDialog] Found target info:`, targetInfo);
    const targetName = targetInfo ? targetInfo.name : req.target;
    const actionType = req.type === 'kill' ? '击杀' : '收集';
    const text = `${actionType}${targetName}: 0/${req.amount}`;
    console.log(`[NPCInfoDialog] Generated text:`, text);
    return text;
  };

  const handleAcceptQuest = async (questId: string) => {
    try {
      await QuestSystem.acceptQuest(
        gameState,
        questId,
        updateGameState,
        (message) => {
          // 修改消息内容，使用真实名称
          if (message.startsWith('- ')) {
            const req = availableQuests
              .find(q => q.id === questId)
              ?.requirements.find(r => 
                message.includes(r.target)
              );
            if (req) {
              addMessage({ 
                type: 'system', 
                content: `- ${getRequirementText(req)}` 
              });
              return;
            }
          }
          addMessage({ type: 'system', content: message });
        }
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
      <div className="max-w-[600px] mx-auto w-full">
        <div className="bg-white border border-black w-full">
          {/* 标题栏 */}
          <div className="bg-[#E6E6E6] border-b-2 border-black p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <h2 className="font-bold">{npc.name}</h2>
                  <p className="text-sm text-gray-600">{npc.title}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-[#D6D6D6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="divide-y border-b border-black text-sm">
            {/* 对话内容 */}
            <div className="p-4 bg-white">
              <div className="font-bold mb-2">对话</div>
              <p className="text-gray-600">{npc.dialogue}</p>
            </div>

            {/* 商店信息 */}
            {npc.shop && (
              <div className="p-4 bg-white">
                <div className="font-bold mb-2">商店</div>
                <button className="px-4 py-1 border border-black text-center bg-white hover:bg-[#E6E6E6]">
                  查看商品
                </button>
              </div>
            )}

            {/* 任务列表 */}
            {npc.quests && (
              <div className="p-4 bg-white">
                <div className="font-bold mb-2">可接任务</div>
                {isLoadingQuests ? (
                  <div className="text-gray-600 text-center">加载任务中...</div>
                ) : availableQuests.length > 0 ? (
                  <div className="space-y-3">
                    {availableQuests.map((quest) => (
                      <div key={quest.id} className="p-2 border border-black">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold">{quest.title}</div>
                          <button
                            onClick={() => handleAcceptQuest(quest.id)}
                            className="px-3 py-1 border border-black bg-white hover:bg-[#E6E6E6]"
                          >
                            接受
                          </button>
                        </div>
                        <p className="text-gray-600 mb-2">{quest.description}</p>
                        <div className="mb-2">
                          <div className="font-bold mb-1">任务目标:</div>
                          {quest.requirements.map((req, index) => (
                            <div key={index} className="text-gray-600">
                              - {getRequirementText(req)}
                            </div>
                          ))}
                        </div>
                        <div className="text-gray-600">
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
                  <div className="text-gray-600 text-center">
                    暂无可接任务
                  </div>
                )}
              </div>
            )}

            {/* 装备展示 */}
            <div className="p-4 bg-white">
              <div className="font-bold mb-2">装备展示</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-black">
                  <div className="text-gray-600">武器</div>
                  <div>青玉剑</div>
                </div>
                <div className="p-2 border border-black">
                  <div className="text-gray-600">防具</div>
                  <div>青云道袍</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}