// 基础类型定义
export interface Position {
  x: number;
  y: number;
}

// 角色相关
export interface Character {
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  attack: number;
  defense: number;
  spirit: number;
  agility: number;
  skills: Skill[];
  cultivation: {
    realm: string;
    stage: number;
    progress: number;
  };
}

// 技能相关
export interface Skill {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'support';
  mpCost: number;
  cooldown: number;
  currentCooldown?: number;
  damage?: number;
  effects?: SkillEffect[];
  level?: number;
}

export interface SkillEffect {
  type: 'hp' | 'mp' | 'buff' | 'debuff';
  value: number;
  duration?: number;
  name?: string;
}

// 物品相关
export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  quantity: number;
  level?: number;
  effects?: {
    type: 'hp' | 'mp' | 'attack' | 'defense' | 'spirit' | 'agility';
    value: number;
    duration?: number;
  }[];
  stackable?: boolean;
  maxStack?: number;
  sellPrice?: number;
  usable?: boolean;
  equipped?: boolean;
}

// NPC相关
export interface NPC {
  id: string;
  name: string;
  title: string;
  dialogue: string;
  quests?: string[];
  shop?: string;
  category?: string;
}

// 商店相关
export interface Shop {
  id: string;
  name: string;
  description: string;
  items: ShopItem[];
}

export interface ShopItem {
  id: string;
  price: number;
  stock: number; // -1 表示无限
}

// 任务相关
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  requirements: QuestRequirement[];
  rewards: {
    exp: number;
    gold: number;
    items?: {
      id: string;
      amount: number;
    }[];
  };
}

export interface QuestRequirement {
  type: 'kill' | 'gather';
  target: string;
  amount: number;
  current: number;
}

// 怪物相关
export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  skills?: Skill[];
  drops?: {
    itemId: string;
    name: string;
    chance: number;
  }[];
}

// 游戏状态
export interface GameState {
  player: Character;
  currentMap: string;
  position: Position;
  messages: Array<{
    type: 'system' | 'chat';
    content: string;
  }>;
  inCombat: boolean;
  currentMonster: Monster | null;
  inventory: InventoryItem[];
  maxInventorySize: number;
  activeQuests: Quest[];
  completedQuests: string[];
}