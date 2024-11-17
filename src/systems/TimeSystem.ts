import { GameState } from '../types/game';

export class TimeSystem {
  private static readonly TIME_PERIODS = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night'] as const;
  
  static advanceTime(
    gameState: GameState,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): void {
    const newState = { ...gameState };
    const currentPeriodIndex = this.TIME_PERIODS.indexOf(newState.time.period);
    
    // 更新时间
    if (currentPeriodIndex === this.TIME_PERIODS.length - 1) {
      newState.time.period = this.TIME_PERIODS[0];
      newState.time.day++;
      onLogMessage(`天亮了，第${newState.time.day}天开始了`);
    } else {
      newState.time.period = this.TIME_PERIODS[currentPeriodIndex + 1];
      onLogMessage(`时间推移，现在是${this.getChineseTimePeriod(newState.time.period)}`);
    }
    
    // 根据时间更新游戏状态
    this.applyTimeEffects(newState, onLogMessage);
    
    onStateChange(newState);
  }
  
  private static getChineseTimePeriod(period: typeof this.TIME_PERIODS[number]): string {
    const periodMap = {
      dawn: '黎明',
      morning: '上午',
      noon: '正午',
      afternoon: '下午',
      dusk: '黄昏',
      night: '夜晚'
    };
    return periodMap[period];
  }
  
  private static applyTimeEffects(gameState: GameState, onLogMessage: (message: string) => void): void {
    switch (gameState.time.period) {
      case 'dawn':
        // 黎明时分，灵气充沛
        gameState.player.mp = Math.min(
          gameState.player.maxMp,
          gameState.player.mp + 10
        );
        onLogMessage('晨曦初现，灵气回复了一些');
        break;
      case 'night':
        // 夜晚修炼效率提升
        onLogMessage('夜深人静，修炼效率提升');
        break;
    }
  }
}