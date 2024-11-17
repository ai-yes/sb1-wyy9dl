import { GameState } from '../types/game';
import { QuestSystem } from './QuestSystem';
import { InventorySystem } from './InventorySystem';
import DataManager from '../utils/DataManager';

export class GatheringSystem {
  static async gather(
    gameState: GameState,
    resourceId: string,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    try {
      // 获取物品数据
      const itemData = await DataManager.getItem(resourceId);
      if (!itemData) {
        onLogMessage('无法找到该资源！');
        return;
      }

      // 随机采集数量（1-3个）
      const amount = Math.floor(Math.random() * 3) + 1;

      // 尝试添加到背包
      const added = await InventorySystem.addItem(
        gameState,
        resourceId,
        amount,
        onStateChange,
        onLogMessage
      );

      if (added) {
        onLogMessage(`采集到了${amount}个${itemData.name}`);

        // 更新相关任务进度
        await QuestSystem.updateQuestProgress(
          gameState,
          'gather',
          resourceId,
          amount,
          onStateChange,
          onLogMessage
        );
      }
    } catch (error) {
      console.error('Gathering failed:', error);
      onLogMessage('采集失败');
    }
  }

  static getGatheringTime(resourceId: string): number {
    // 不同资源的采集时间（秒）
    switch (resourceId) {
      case 'spirit_herb':
        return 3;
      case 'rare_herb':
        return 5;
      default:
        return 2;
    }
  }
}