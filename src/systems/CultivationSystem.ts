import { GameState, Character } from '../types/game';

export class CultivationSystem {
  private static readonly REALMS = ['练气期', '筑基期', '金丹期', '元婴期'];
  private static readonly STAGES_PER_REALM = 9;
  
  static async cultivate(
    gameState: GameState,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<void> {
    const { player } = gameState;
    const currentRealmIndex = this.REALMS.indexOf(player.cultivation.realm);
    
    // 计算修炼增长
    const progressGain = Math.random() * 5 + 5; // 5-10的随机进度
    player.cultivation.progress += progressGain;
    
    onLogMessage(`打坐修炼中...灵力+${progressGain.toFixed(1)}%`);
    
    // 检查是否可以突破
    if (player.cultivation.progress >= 100) {
      // 重置进度
      player.cultivation.progress = 0;
      
      // 判断是否达到当前境界最高层
      if (player.cultivation.stage < this.STAGES_PER_REALM) {
        player.cultivation.stage++;
        onLogMessage(`突破成功！达到${player.cultivation.realm}第${player.cultivation.stage}重`);
      } else if (currentRealmIndex < this.REALMS.length - 1) {
        // 进入下一个境界
        player.cultivation.realm = this.REALMS[currentRealmIndex + 1];
        player.cultivation.stage = 1;
        onLogMessage(`大道可期！突破至${player.cultivation.realm}`);
        
        // 提升基础属性
        player.maxHp += 50;
        player.hp = player.maxHp;
        player.maxMp += 30;
        player.mp = player.maxMp;
        player.attack += 10;
        player.defense += 8;
        player.spirit += 5;
        player.agility += 5;
      }
    }
    
    onStateChange({ ...gameState });
  }
  
  static canBreakthrough(character: Character): boolean {
    return character.cultivation.progress >= 100;
  }
}