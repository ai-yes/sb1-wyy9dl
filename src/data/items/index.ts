import { load } from 'js-yaml';
import { InventoryItem } from '../../types/game';

export class ItemManager {
  private static items: Map<string, InventoryItem> = new Map();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[ItemManager] Starting initialization...');
        
        // 加载所有物品类型
        const categories = [
          'weapons',
          'armors',
          'consumables',
          'materials',
          'quest-items'
        ];
        
        await Promise.all(categories.map(async (category) => {
          try {
            const response = await fetch(`/src/data/items/${category}.yaml`);
            if (!response.ok) {
              throw new Error(`Failed to load items: ${category}`);
            }
            
            const content = await response.text();
            const items = load(content) as Record<string, InventoryItem>;
            
            // 验证数据完整性
            Object.entries(items).forEach(([id, item]) => {
              if (!item || typeof item !== 'object') {
                throw new Error(`Invalid item data for ${id}`);
              }

              // 确保每个物品都有必要的属性
              const validatedItem: InventoryItem = {
                id,
                name: item.name || id,
                type: item.type || 'material',
                rarity: item.rarity || 'common',
                description: item.description || '',
                quantity: 0,
                stackable: item.stackable ?? true,
                maxStack: item.maxStack || 99,
                sellPrice: item.sellPrice || 0,
                usable: item.usable || false,
                effects: item.effects || [],
                ...item
              };

              this.items.set(id, validatedItem);
            });
            
            console.log(`[ItemManager] Loaded ${category} items:`, Object.keys(items).length);
          } catch (error) {
            console.error(`[ItemManager] Failed to load ${category} items:`, error);
          }
        }));

        this.initialized = true;
        console.log('[ItemManager] Successfully initialized');
      } catch (error) {
        console.error('[ItemManager] Failed to initialize:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getItem(itemId: string): Promise<InventoryItem | null> {
    await this.initialize();
    const item = this.items.get(itemId);
    
    if (!item) {
      console.warn(`[ItemManager] Item not found: ${itemId}`);
      return null;
    }

    // 返回深拷贝以防止修改原始数据
    return JSON.parse(JSON.stringify(item));
  }

  static async getItemsByType(type: string): Promise<InventoryItem[]> {
    await this.initialize();
    return Array.from(this.items.values())
      .filter(item => item.type === type)
      .map(item => JSON.parse(JSON.stringify(item)));
  }

  static async getItemsByRarity(rarity: string): Promise<InventoryItem[]> {
    await this.initialize();
    return Array.from(this.items.values())
      .filter(item => item.rarity === rarity)
      .map(item => JSON.parse(JSON.stringify(item)));
  }

  static clearCache(): void {
    this.items.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}