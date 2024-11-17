import { load } from 'js-yaml';
import { Monster } from '../../types/game';

export class MonsterManager {
  private static groups: Map<string, Monster[]> = new Map();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[MonsterManager] Starting initialization...');
        
        const groupIds = [
          'spirit-beasts-weak',
          'cave-beasts',
          'spirit-valley-guardians',
          'forest-beasts'
        ];
        
        await Promise.all(groupIds.map(async (groupId) => {
          try {
            const response = await fetch(`/src/data/monsters/groups/${groupId}.yaml`);
            if (!response.ok) {
              throw new Error(`Failed to load monster group: ${groupId}`);
            }
            
            const content = await response.text();
            const group = load(content) as { monsters: Monster[] };
            
            // 验证数据完整性
            if (!group || !Array.isArray(group.monsters)) {
              throw new Error(`Invalid monster group data: ${groupId}`);
            }

            // 确保每个怪物都有必要的属性
            const validatedMonsters = group.monsters.map(monster => ({
              id: monster.id,
              name: monster.name,
              level: monster.level,
              hp: monster.hp,
              maxHp: monster.maxHp || monster.hp,
              attack: monster.attack,
              defense: monster.defense,
              exp: monster.exp,
              gold: monster.gold,
              skills: monster.skills || [],
              drops: monster.drops || [],
              ...monster
            }));
            
            this.groups.set(groupId.replace(/-/g, '_'), validatedMonsters);
            console.log(`[MonsterManager] Loaded monster group: ${groupId}`);
          } catch (error) {
            console.error(`[MonsterManager] Failed to load monster group ${groupId}:`, error);
          }
        }));

        this.initialized = true;
        console.log('[MonsterManager] Successfully initialized');
      } catch (error) {
        console.error('[MonsterManager] Failed to initialize:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getMonsterGroup(groupId: string): Promise<Monster[] | null> {
    await this.initialize();
    const group = this.groups.get(groupId);
    return group ? JSON.parse(JSON.stringify(group)) : null;
  }

  static async getMonsterById(groupId: string, monsterId: string): Promise<Monster | null> {
    const group = await this.getMonsterGroup(groupId);
    if (!group) return null;
    
    const monster = group.find(m => m.id === monsterId);
    return monster ? JSON.parse(JSON.stringify(monster)) : null;
  }

  static async getRandomMonsterFromGroup(groupId: string): Promise<Monster | null> {
    const group = await this.getMonsterGroup(groupId);
    if (!group || group.length === 0) return null;
    
    const monster = group[Math.floor(Math.random() * group.length)];
    return JSON.parse(JSON.stringify(monster));
  }

  static clearCache(): void {
    this.groups.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}