import { Character, Monster, NPC, InventoryItem, Quest, Shop } from '../types/game';
import { ItemManager } from '../data/items';
import { MonsterManager } from '../data/monsters';
import { CharacterManager } from '../data/characters';
import { NPCManager } from '../data/npcs';
import { QuestManager } from '../data/quests';
import { ShopManager } from '../data/shops';

class DataManager {
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[DataManager] Starting initialization...');
        
        // 初始化所有管理器
        await Promise.all([
          ItemManager.initialize(),
          MonsterManager.initialize(),
          CharacterManager.initialize(),
          NPCManager.initialize(),
          QuestManager.initialize(),
          ShopManager.initialize()
        ]);

        this.initialized = true;
        console.log('[DataManager] Successfully initialized');
      } catch (error) {
        console.error('[DataManager] Initialization failed:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getMonsterGroup(groupId: string): Promise<Monster[] | null> {
    await this.initialize();
    return MonsterManager.getMonsterGroup(groupId);
  }

  static async getNPC(npcId: string): Promise<NPC | null> {
    await this.initialize();
    return NPCManager.getNPC(npcId);
  }

  static async getItem(itemId: string): Promise<InventoryItem | null> {
    await this.initialize();
    return ItemManager.getItem(itemId);
  }

  static async getShop(shopId: string): Promise<Shop | null> {
    await this.initialize();
    return ShopManager.getShop(shopId);
  }

  static async getQuest(questId: string): Promise<Quest | null> {
    await this.initialize();
    return QuestManager.getQuest(questId);
  }

  static async getInitialCharacter(): Promise<Character | null> {
    await this.initialize();
    return CharacterManager.getInitialCharacter();
  }

  static clearCache(): void {
    this.initialized = false;
    this.initPromise = null;
    ItemManager.clearCache();
    MonsterManager.clearCache();
    CharacterManager.clearCache();
    NPCManager.clearCache();
    QuestManager.clearCache();
    ShopManager.clearCache();
  }
}

export default DataManager;