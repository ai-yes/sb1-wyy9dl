import { MapTile, Monster } from '../../types/game';
import { MonsterManager } from '../../data/monsters';

export class CombatManager {
  private static initialized = false;
  private static initializationPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('[CombatManager] Starting initialization...');
        
        // Initialize MonsterManager first
        await MonsterManager.initialize();
        
        this.initialized = true;
        console.log('[CombatManager] Successfully initialized');
      } catch (error) {
        console.error('[CombatManager] Failed to initialize:', error);
        this.initialized = false;
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  static async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  static async getRandomMonster(tile: MapTile): Promise<Monster | null> {
    try {
      await this.ensureInitialized();

      if (!tile.monsterGroups || tile.monsterGroups.length === 0) {
        return null;
      }

      const groupId = tile.monsterGroups[Math.floor(Math.random() * tile.monsterGroups.length)];
      return await MonsterManager.getRandomMonsterFromGroup(groupId);
    } catch (error) {
      console.error('[CombatManager] Error getting random monster:', error);
      return null;
    }
  }

  static async checkEncounter(tile: MapTile): Promise<boolean> {
    await this.ensureInitialized();
    const chance = this.getEncounterChance(tile);
    return Math.random() < chance;
  }

  private static getEncounterChance(tile: MapTile): number {
    switch (tile.type) {
      case 'mountain': return 0.3;
      case 'forest': return 0.25;
      case 'cave': return 0.4;
      case 'dungeon': return 0.5;
      default: return 0.1;
    }
  }

  static clearCache(): void {
    this.initialized = false;
    this.initializationPromise = null;
    MonsterManager.clearCache();
  }
}