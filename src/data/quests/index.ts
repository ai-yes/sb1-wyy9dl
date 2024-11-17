// src/data/quests/index.ts

import { load } from 'js-yaml';
import { Quest } from '../../types/game';

export class QuestManager {
  private static quests: Map<string, Quest> = new Map();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[QuestManager] Starting initialization...');
        
        // 加载所有任务类型
        const categories = [
          'basic',
          'cultivation',
          'combat',
          'gathering'
        ];
        
        let loadedQuestsCount = 0;
        
        await Promise.all(categories.map(async (category) => {
          try {
            console.log(`[QuestManager] Loading ${category} quests...`);
            const response = await fetch(`/src/data/quests/${category}.yaml`);
            
            if (!response.ok) {
              console.error(`[QuestManager] HTTP error loading ${category} quests:`, response.status);
              throw new Error(`Failed to load quests: ${category} (${response.status})`);
            }
            
            const content = await response.text();
            console.log(`[QuestManager] Raw content for ${category}:`, content.substring(0, 100));
            
            const quests = load(content) as Record<string, Quest>;
            
            // 验证数据完整性
            Object.entries(quests).forEach(([id, quest]) => {
              if (!quest || typeof quest !== 'object') {
                console.error(`[QuestManager] Invalid quest data for ${id}:`, quest);
                throw new Error(`Invalid quest data for ${id}`);
              }

              // 确保每个任务都有必要的属性
              const validatedQuest: Quest = {
                id,
                title: quest.title || id,
                description: quest.description || '',
                category: quest.category || category,
                status: quest.status || 'available',
                requirements: quest.requirements?.map(req => ({
                  type: req.type,
                  target: req.target,
                  amount: req.amount,
                  current: req.current || 0
                })) || [],
                rewards: {
                  exp: quest.rewards?.exp || 0,
                  gold: quest.rewards?.gold || 0,
                  items: quest.rewards?.items?.map(item => ({
                    id: item.id,
                    amount: item.amount
                  })) || []
                },
                ...quest
              };

              this.quests.set(id, validatedQuest);
              loadedQuestsCount++;
              console.log(`[QuestManager] Successfully loaded quest: ${id}`);
            });
            
            console.log(`[QuestManager] Loaded ${Object.keys(quests).length} quests from ${category}`);
          } catch (error) {
            console.error(`[QuestManager] Failed to load ${category} quests:`, error);
          }
        }));

        if (loadedQuestsCount === 0) {
          console.error('[QuestManager] No quests were loaded successfully');
          throw new Error('Failed to load any quests');
        }

        this.initialized = true;
        console.log(`[QuestManager] Successfully initialized with ${loadedQuestsCount} quests`);
      } catch (error) {
        console.error('[QuestManager] Failed to initialize:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getQuest(questId: string): Promise<Quest | null> {
    try {
      await this.initialize();
      const quest = this.quests.get(questId);
      
      if (!quest) {
        console.warn(`[QuestManager] Quest not found: ${questId}`);
        return null;
      }

      console.log(`[QuestManager] Retrieved quest: ${questId}`, quest);
      return JSON.parse(JSON.stringify(quest));
    } catch (error) {
      console.error(`[QuestManager] Error getting quest ${questId}:`, error);
      return null;
    }
  }

  static async getQuestsByCategory(category: string): Promise<Quest[]> {
    try {
      await this.initialize();
      const quests = Array.from(this.quests.values())
        .filter(quest => quest.category === category)
        .map(quest => JSON.parse(JSON.stringify(quest)));
      
      console.log(`[QuestManager] Retrieved ${quests.length} quests for category: ${category}`);
      return quests;
    } catch (error) {
      console.error(`[QuestManager] Error getting quests for category ${category}:`, error);
      return [];
    }
  }

  static async getAvailableQuests(): Promise<Quest[]> {
    try {
      await this.initialize();
      const quests = Array.from(this.quests.values())
        .filter(quest => quest.status === 'available')
        .map(quest => JSON.parse(JSON.stringify(quest)));
      
      console.log(`[QuestManager] Retrieved ${quests.length} available quests`);
      return quests;
    } catch (error) {
      console.error('[QuestManager] Error getting available quests:', error);
      return [];
    }
  }

  static clearCache(): void {
    console.log('[QuestManager] Clearing quest cache');
    this.quests.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}
