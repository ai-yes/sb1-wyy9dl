import { load } from 'js-yaml';
import { NPC } from '../../types/game';

export class NPCManager {
  private static npcs: Map<string, NPC> = new Map();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[NPCManager] Starting initialization...');
        
        // 加载所有NPC类型
        const categories = [
          'merchants',
          'quest-givers',
          'trainers',
          'faction-leaders'
        ];
        
        await Promise.all(categories.map(async (category) => {
          try {
            const response = await fetch(`/src/data/npcs/${category}.yaml`);
            if (!response.ok) {
              throw new Error(`Failed to load NPCs: ${category}`);
            }
            
            const content = await response.text();
            const npcs = load(content) as Record<string, NPC>;
            
            // 验证数据完整性
            Object.entries(npcs).forEach(([id, npc]) => {
              if (!npc || typeof npc !== 'object') {
                throw new Error(`Invalid NPC data for ${id}`);
              }

              // 确保每个NPC都有必要的属性
              const validatedNpc: NPC = {
                id,
                name: npc.name || id,
                title: npc.title || '',
                dialogue: npc.dialogue || '...',
                category: npc.category || 'general',
                quests: npc.quests || [],
                shop: npc.shop,
                ...npc
              };

              this.npcs.set(id, validatedNpc);
            });
            
            console.log(`[NPCManager] Loaded ${category} NPCs:`, Object.keys(npcs).length);
          } catch (error) {
            console.error(`[NPCManager] Failed to load ${category} NPCs:`, error);
          }
        }));

        this.initialized = true;
        console.log('[NPCManager] Successfully initialized');
      } catch (error) {
        console.error('[NPCManager] Failed to initialize:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getNPC(npcId: string): Promise<NPC | null> {
    await this.initialize();
    const npc = this.npcs.get(npcId);
    
    if (!npc) {
      console.warn(`[NPCManager] NPC not found: ${npcId}`);
      return null;
    }

    // 返回深拷贝以防止修改原始数据
    return JSON.parse(JSON.stringify(npc));
  }

  static async getNPCsByCategory(category: string): Promise<NPC[]> {
    await this.initialize();
    return Array.from(this.npcs.values())
      .filter(npc => npc.category === category)
      .map(npc => JSON.parse(JSON.stringify(npc)));
  }

  static clearCache(): void {
    this.npcs.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}