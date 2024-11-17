import { GameState, Position, TeleportDestination } from '../../types/game';
import { MapLoader } from './MapLoader';
import { TileManager } from './TileManager';

export class TeleportManager {
  static async getAvailableTeleports(mapId: string, position: Position): Promise<TeleportDestination[]> {
    try {
      const tile = await TileManager.getMapTile(mapId, position);
      if (!tile || !tile.teleports) {
        return [];
      }
      return tile.teleports;
    } catch (error) {
      console.error('[TeleportManager] Failed to get available teleports:', error);
      return [];
    }
  }

  static async validateTeleport(
    destination: TeleportDestination,
    playerLevel: number,
    playerGold: number
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // 验证目标地图是否存在
      const targetMap = await MapLoader.loadMapData(destination.mapId);
      if (!targetMap) {
        return { valid: false, reason: '目标地图不可用' };
      }

      // 验证玩家等级
      if (playerLevel < destination.requiredLevel) {
        return { 
          valid: false, 
          reason: `需要达到 ${destination.requiredLevel} 级才能传送到该地图` 
        };
      }

      // 验证玩家金币
      if (playerGold < destination.cost) {
        return { 
          valid: false, 
          reason: `传送需要 ${destination.cost} 金币` 
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('[TeleportManager] Failed to validate teleport:', error);
      return { valid: false, reason: '传送验证失败' };
    }
  }

  static async getDefaultSpawnPosition(mapId: string): Promise<Position> {
    try {
      const mapData = await MapLoader.loadMapData(mapId);
      if (!mapData) {
        throw new Error('无法加载目标地图数据');
      }

      // 尝试找到指定的出生点
      const spawnTile = mapData.tiles.find(tile => tile.type === 'spawn');
      if (spawnTile) {
        return { x: spawnTile.x, y: spawnTile.y };
      }

      // 如果没有指定出生点，使用安全区域（城镇类型的地块）
      const safeTile = mapData.tiles.find(tile => tile.type === 'city');
      if (safeTile) {
        return { x: safeTile.x, y: safeTile.y };
      }

      // 如果都没有，使用地图中心点
      return {
        x: Math.floor(mapData.width / 2),
        y: Math.floor(mapData.height / 2)
      };
    } catch (error) {
      console.error('[TeleportManager] Failed to get spawn position:', error);
      // 返回默认位置
      return { x: 10, y: 10 };
    }
  }

  static async handleTeleport(
    destination: TeleportDestination,
    gameState: GameState,
    onStateChange: (newState: Partial<GameState>) => void,
    onError: (error: string) => void
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // 验证传送条件
      const validation = await this.validateTeleport(
        destination,
        gameState.player.level,
        gameState.player.gold
      );

      if (!validation.valid) {
        return { success: false, message: validation.reason };
      }

      // 获取目标位置
      const newPosition = await this.getDefaultSpawnPosition(destination.mapId);

      // 扣除金币并更新状态
      const newState: Partial<GameState> = {
        currentMap: destination.mapId,
        position: newPosition,
        player: {
          ...gameState.player,
          gold: gameState.player.gold - destination.cost
        }
      };

      // 更新游戏状态
      onStateChange(newState);

      return { success: true };
    } catch (error) {
      console.error('[TeleportManager] Teleport failed:', error);
      onError('传送失败，请稍后重试');
      return { success: false, message: '传送过程中发生错误' };
    }
  }
}