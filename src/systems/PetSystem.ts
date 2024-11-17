import { GameState, Pet, Monster } from '../types/game';

export class PetSystem {
  static async capturePet(
    gameState: GameState,
    monster: Monster,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<boolean> {
    // 计算捕获概率
    const captureChance = this.calculateCaptureChance(gameState.player.level, monster.level);
    
    onLogMessage('正在尝试收服灵宠...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() < captureChance) {
      const newPet: Pet = {
        id: `pet_${Date.now()}`,
        name: monster.name,
        type: monster.id,
        level: monster.level,
        exp: 0,
        maxExp: 100,
        loyalty: 50,
        skills: [],
        stats: {
          attack: monster.attack,
          defense: monster.defense,
          spirit: Math.floor(monster.attack * 0.8),
          agility: Math.floor(monster.defense * 0.8)
        }
      };
      
      const newState = { ...gameState };
      newState.pets.push(newPet);
      onStateChange(newState);
      
      onLogMessage(`成功收服了${monster.name}！`);
      return true;
    } else {
      onLogMessage('收服失败...');
      return false;
    }
  }
  
  private static calculateCaptureChance(playerLevel: number, monsterLevel: number): number {
    const levelDiff = playerLevel - monsterLevel;
    const baseChance = 0.3; // 基础30%概率
    const levelBonus = levelDiff * 0.05; // 每级差异增加5%概率
    
    return Math.min(0.8, Math.max(0.1, baseChance + levelBonus));
  }
  
  static async trainPet(
    gameState: GameState,
    petId: string,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    const newState = { ...gameState };
    const pet = newState.pets.find(p => p.id === petId);
    
    if (pet) {
      // 增加经验值
      pet.exp += 10;
      onLogMessage(`${pet.name}获得了10点经验`);
      
      // 检查是否升级
      if (pet.exp >= pet.maxExp) {
        pet.level++;
        pet.exp = 0;
        pet.maxExp = Math.floor(pet.maxExp * 1.2);
        
        // 提升属性
        pet.stats.attack += 2;
        pet.stats.defense += 2;
        pet.stats.spirit += 1;
        pet.stats.agility += 1;
        
        onLogMessage(`${pet.name}升到了${pet.level}级！`);
      }
      
      onStateChange(newState);
    }
  }
}