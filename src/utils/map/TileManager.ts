import { MapTile, Position } from '../../types/game';
import { MapLoader } from './MapLoader';
import { WeatherManager } from './WeatherManager';

export class TileManager {
  static async getMapTile(mapId: string, position: Position): Promise<MapTile | null> {
    console.log(`[TileManager] Getting tile at position:`, position);
    
    const mapData = await MapLoader.loadMapData(mapId);
    if (!mapData) {
      console.error(`[TileManager] No map data for ${mapId}`);
      return null;
    }

    // 检查位置是否在地图范围内
    if (position.x < 0 || position.x >= mapData.width ||
        position.y < 0 || position.y >= mapData.height) {
      console.error(`[TileManager] Position out of bounds:`, position);
      return null;
    }

    // 查找特定位置的地块
    const tile = mapData.tiles.find(t => t.x === position.x && t.y === position.y);
    
    // 如果没找到特定地块，返回默认地块
    if (!tile && mapData.defaultTile) {
      return {
        ...mapData.defaultTile,
        x: position.x,
        y: position.y,
        canMove: true
      };
    }

    return tile || null;
  }

  static async getAdjacentTiles(mapId: string, position: Position): Promise<{
    north: MapTile | null;
    south: MapTile | null;
    east: MapTile | null;
    west: MapTile | null;
  }> {
    console.log(`[TileManager] Getting adjacent tiles for position:`, position);
    
    const mapData = await MapLoader.loadMapData(mapId);
    if (!mapData) {
      console.error(`[TileManager] No map data for adjacent tiles`);
      return {
        north: null,
        south: null,
        east: null,
        west: null
      };
    }

    const getAdjacentTile = (x: number, y: number): MapTile | null => {
      if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) {
        return null;
      }

      const tile = mapData.tiles.find(t => t.x === x && t.y === y);
      if (!tile) {
        return {
          ...mapData.defaultTile,
          x,
          y,
          canMove: true
        };
      }
      return tile;
    };

    const adjacentTiles = {
      north: getAdjacentTile(position.x, position.y - 1),
      south: getAdjacentTile(position.x, position.y + 1),
      east: getAdjacentTile(position.x + 1, position.y),
      west: getAdjacentTile(position.x - 1, position.y)
    };

    console.log(`[TileManager] Adjacent tiles:`, {
      north: adjacentTiles.north?.name || 'none',
      south: adjacentTiles.south?.name || 'none',
      east: adjacentTiles.east?.name || 'none',
      west: adjacentTiles.west?.name || 'none'
    });

    return adjacentTiles;
  }

  static async getTileVisibility(mapId: string, tile: MapTile): Promise<number> {
    const weather = await WeatherManager.getCurrentWeather(mapId);
    const weatherEffect = WeatherManager.getWeatherEffect(weather || 'clear');
    return weatherEffect.visibility;
  }

  static async getTileMovementCost(mapId: string, tile: MapTile): Promise<number> {
    const weather = await WeatherManager.getCurrentWeather(mapId);
    const weatherEffect = WeatherManager.getWeatherEffect(weather || 'clear');
    
    let baseCost = 1;
    switch (tile.type) {
      case 'mountain':
        baseCost = 2;
        break;
      case 'forest':
        baseCost = 1.5;
        break;
      case 'cave':
        baseCost = 1.3;
        break;
    }

    return baseCost * (1 / weatherEffect.movementSpeed);
  }

  static async getTileCultivationBonus(mapId: string, tile: MapTile): Promise<number> {
    const weather = await WeatherManager.getCurrentWeather(mapId);
    const weatherEffect = WeatherManager.getWeatherEffect(weather || 'clear');
    
    const tileBonus = tile.cultivationBonus || 1;
    return tileBonus * weatherEffect.cultivationBonus;
  }

  static isTileAccessible(tile: MapTile, playerLevel: number): boolean {
    if (!tile.canMove) return false;
    if (tile.requiredLevel && playerLevel < tile.requiredLevel) return false;
    return true;
  }

  static getTileDescription(tile: MapTile): string {
    let description = tile.description || '';
    
    if (tile.cultivationBonus && tile.cultivationBonus > 1) {
      description += `\n修炼效率提升${((tile.cultivationBonus - 1) * 100).toFixed(0)}%`;
    }
    
    if (tile.requiredLevel) {
      description += `\n需要等级: ${tile.requiredLevel}`;
    }
    
    if (tile.monsterGroups && tile.monsterGroups.length > 0) {
      description += '\n⚠️ 此处可能有危险生物出没';
    }

    return description;
  }
}