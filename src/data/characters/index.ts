import { load } from 'js-yaml';
import { Character } from '../../types/game';

export class CharacterManager {
  private static characters: Map<string, Character> = new Map();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[CharacterManager] Starting initialization...');
        
        // Load initial character data
        const response = await fetch('/src/data/characters/initial.yaml');
        if (!response.ok) {
          throw new Error('Failed to load initial character data');
        }
        
        const content = await response.text();
        const initialCharacter = load(content) as Character;
        
        // 验证数据完整性
        if (!initialCharacter || typeof initialCharacter !== 'object') {
          throw new Error('Invalid initial character data');
        }

        // 确保角色有必要的属性
        const validatedCharacter: Character = {
          name: initialCharacter.name || '无名修士',
          level: initialCharacter.level || 1,
          exp: initialCharacter.exp || 0,
          maxExp: initialCharacter.maxExp || 100,
          hp: initialCharacter.hp || 100,
          maxHp: initialCharacter.maxHp || 100,
          mp: initialCharacter.mp || 50,
          maxMp: initialCharacter.maxMp || 50,
          stamina: initialCharacter.stamina || 100,
          maxStamina: initialCharacter.maxStamina || 100,
          gold: initialCharacter.gold || 0,
          attack: initialCharacter.attack || 10,
          defense: initialCharacter.defense || 5,
          spirit: initialCharacter.spirit || 8,
          agility: initialCharacter.agility || 8,
          skills: initialCharacter.skills || [],
          cultivation: {
            realm: initialCharacter.cultivation?.realm || '练气期',
            stage: initialCharacter.cultivation?.stage || 1,
            progress: initialCharacter.cultivation?.progress || 0
          },
          ...initialCharacter
        };
        
        this.characters.set('initial', validatedCharacter);
        
        this.initialized = true;
        console.log('[CharacterManager] Successfully initialized');
      } catch (error) {
        console.error('[CharacterManager] Failed to initialize:', error);
        this.initialized = false;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  static async getInitialCharacter(): Promise<Character | null> {
    await this.initialize();
    const character = this.characters.get('initial');
    
    if (!character) {
      console.warn('[CharacterManager] Initial character not found');
      return null;
    }

    // 返回深拷贝以防止修改原始数据
    return JSON.parse(JSON.stringify(character));
  }

  static clearCache(): void {
    this.characters.clear();
    this.initialized = false;
    this.initPromise = null;
  }
}