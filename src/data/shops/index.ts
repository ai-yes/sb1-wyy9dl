import { load } from 'js-yaml';
import { Shop } from '../../types/game';

export class ShopManager {
  private static shops: Map<string, Shop> = new Map();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[ShopManager] Starting initialization...');
        
        // 加载所有商店类型
        const categories = [
          'general',
          'weapons',
          'alchemy',
          'artifacts'
        ];
        
        await Promise.all(categories.map(async (category) => {
          try {
            const response = await fetch(`/src/data/shops/${category}.yaml`);
            if (!response.ok) {
              throw new Error(`Failed to load shops: ${category}`);
            }
            
            const content = await response.text();
            const shops = load(content) as Record<string, Shop>;
            
            // 验证数据完整性
            Object.entries(shops).forEach(([id, shop]) => {
              if (!shop || typeof shop !== 'object') {
                throw new Error(`Invalid shop data for ${id}`);
              }

              // 确保每个商店都有必要的属性
              const validatedShop: Shop = {
                id,
                name: shop.name || id,
                description: shop.description || '',
                items: shop.items || [],
                ...shop
              };

              this.shops.set(id, validatedShop);
            });
            
            console.log(`[ShopManager] Loaded ${category} shops:`, Object.keys(shops).length);
          } catch (error) {
            console.error(`[ShopManager] Failed to load ${category} shops:`, error);
          }
        }));

        this.initialized = true;
        console.log('[ShopManager] Successfully initialized');
      } catch (error) {
        console.error('[ShopManager] Failed to initialize:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getShop(shopId: string): Promise<Shop | null> {
    await this.initialize();
    const shop = this.shops.get(shopId);
    
    if (!shop) {
      console.warn(`[ShopManager] Shop not found: ${shopId}`);
      return null;
    }

    // 返回深拷贝以防止修改原始数据
    return JSON.parse(JSON.stringify(shop));
  }

  static async getShopsByCategory(category: string): Promise<Shop[]> {
    await this.initialize();
    return Array.from(this.shops.values())
      .filter(shop => shop.category === category)
      .map(shop => JSON.parse(JSON.stringify(shop)));
  }

  static clearCache(): void {
    this.shops.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}