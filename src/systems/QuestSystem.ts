import { GameState, Quest } from '../types/game';
import DataManager from '../utils/DataManager';
import { InventorySystem } from './InventorySystem';

export class QuestSystem {
  static async acceptQuest(
    gameState: GameState,
    questId: string,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    try {
      // Load quest data
      const quest = await DataManager.getQuest(questId);
      if (!quest) {
        throw new Error('任务不存在');
      }

      // Verify quest can be accepted
      if (quest.status !== 'available') {
        throw new Error('任务无法接受');
      }

      // Check if quest is already active
      if (gameState.activeQuests.some(q => q.id === questId)) {
        throw new Error('任务已在进行中');
      }

      // Check if quest is already completed
      if (gameState.completedQuests.includes(questId)) {
        throw new Error('任务已完成');
      }

      // Create new quest instance with initial progress
      const newQuest: Quest = {
        ...quest,
        status: 'active',
        requirements: quest.requirements.map(req => ({
          ...req,
          current: 0
        }))
      };

      // Update game state
      const newState = { 
        ...gameState,
        activeQuests: [...(gameState.activeQuests || []), newQuest]
      };

      onStateChange(newState);
      onLogMessage(`接受任务：${quest.title}`);

      // Log quest requirements
      quest.requirements.forEach(req => {
        const target = req.type === 'kill' ? '击杀' : '收集';
        onLogMessage(`- ${target}${req.target}: 0/${req.amount}`);
      });

    } catch (error) {
      console.error('Failed to accept quest:', error);
      onLogMessage(`无法接受任务：${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  }
  
  static async updateQuestProgress(
    gameState: GameState,
    type: string,
    target: string,
    amount: number,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    const newState = { ...gameState };
    let questsUpdated = false;

    for (const quest of newState.activeQuests || []) {
      const requirement = quest.requirements.find(
        r => r.type === type && r.target === target
      );
      
      if (requirement) {
        const oldProgress = requirement.current;
        requirement.current = Math.min(
          requirement.amount,
          requirement.current + amount
        );
        
        if (oldProgress !== requirement.current) {
          questsUpdated = true;
          onLogMessage(`${target}: ${requirement.current}/${requirement.amount}`);
        }
        
        // Check if quest is complete
        if (this.isQuestComplete(quest)) {
          await this.completeQuest(newState, quest, onStateChange, onLogMessage);
          break;
        }
      }
    }

    if (questsUpdated) {
      onStateChange(newState);
    }
  }
  
  private static isQuestComplete(quest: Quest): boolean {
    return quest.requirements.every(req => req.current >= req.amount);
  }
  
  private static async completeQuest(
    gameState: GameState,
    quest: Quest,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    try {
      // Remove from active quests
      gameState.activeQuests = (gameState.activeQuests || []).filter(q => q.id !== quest.id);
      gameState.completedQuests = [...(gameState.completedQuests || []), quest.id];
      
      // Award experience and gold
      gameState.player.exp += quest.rewards.exp;
      gameState.player.gold += quest.rewards.gold;
      
      // Award items
      if (quest.rewards.items) {
        for (const reward of quest.rewards.items) {
          const itemData = await DataManager.getItem(reward.id);
          if (!itemData) {
            onLogMessage(`警告：奖励物品 ${reward.id} 不存在`);
            continue;
          }

          const added = await InventorySystem.addItem(
            gameState,
            reward.id,
            reward.amount,
            onStateChange,
            onLogMessage
          );
          
          if (!added) {
            onLogMessage(`背包已满，无法获得${itemData.name}！`);
            break;
          }
        }
      }
      
      onLogMessage(`完成任务：${quest.title}`);
      onLogMessage(`获得奖励：${quest.rewards.exp}经验值，${quest.rewards.gold}金币`);
      
      onStateChange(gameState);
    } catch (error) {
      console.error('Failed to complete quest:', error);
      onLogMessage('任务完成处理失败');
      throw error;
    }
  }

  static async getAvailableQuests(npcId: string): Promise<Quest[]> {
    try {
      const npc = await DataManager.getNPC(npcId);
      if (!npc || !npc.quests) {
        return [];
      }

      const quests = await Promise.all(
        npc.quests.map(questId => DataManager.getQuest(questId))
      );

      return quests.filter((quest): quest is Quest => 
        quest !== null && quest.status === 'available'
      );
    } catch (error) {
      console.error('Failed to get available quests:', error);
      return [];
    }
  }

  static async checkQuestCompletion(
    gameState: GameState,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    const newState = { ...gameState };
    
    for (const quest of newState.activeQuests || []) {
      if (this.isQuestComplete(quest)) {
        await this.completeQuest(newState, quest, onStateChange, onLogMessage);
      }
    }
  }
}