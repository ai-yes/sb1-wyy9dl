import { MapData, MapTile, Position, Weather, MapEvent } from '../types/game';
import { maps } from '../data/maps';

export class MapManager {
  private static mapCache: Map<string, MapData> = new Map();

  static async loadMapData(mapId: string): Promise<MapData | null> {
    try {
      // 检查缓存
      const cachedMap = this.mapCache.get(mapId);
      if (cachedMap) {
        console.log(`[MapManager] Using cached map: ${mapId}`);
        return cachedMap;
      }

      console.log(`[MapManager] START Loading map: ${mapId}`);
      
      // 获取基础地图数据
      const mainMap = maps[mapId];
      if (!mainMap) {
        console.error(`[MapManager] CRITICAL: Map not found: ${mapId}`);
        return null;
      }

      // 验证基础地图数据
      if (!mainMap.width || !mainMap.height || !Array.isArray(mainMap.tiles)) {
        console.error(`[MapManager] CRITICAL: Invalid map data for ${mapId}`);
        return null;
      }

      // 创建地图副本
      const mergedMap: MapData = {
        ...mainMap,
        id: mapId,
        name: mainMap.name || 'Unknown Area',
        description: mainMap.description || '',
        width: mainMap.width,
        height: mainMap.height,
        tiles: [...(mainMap.tiles || [])]
      };

      // 确保所有tile都有正确的属性
      mergedMap.tiles = mergedMap.tiles.map(tile => ({
        type: 'plain',
        name: 'Unknown Area',
        description: '',
        canMove: true,
        ...mergedMap.defaultTile,
        ...tile,
        x: Number(tile.x),
        y: Number(tile.y)
      }));

      console.log(`[MapManager] Map loaded:`, {
        id: mergedMap.id,
        name: mergedMap.name,
        width: mergedMap.width,
        height: mergedMap.height,
        tilesCount: mergedMap.tiles.length
      });

      // 更新缓存
      this.mapCache.set(mapId, mergedMap);
      return mergedMap;

    } catch (error) {
      console.error(`[MapManager] CRITICAL: Failed to load map:`, error);
      return null;
    }
  }

  static async getMapTile(mapId: string, position: Position): Promise<MapTile | null> {
    console.log(`[MapManager] Getting tile at position:`, position);
    
    const mapData = await this.loadMapData(mapId);
    if (!mapData) {
      console.error(`[MapManager] No map data for ${mapId}`);
      return null;
    }

    if (position.x < 0 || position.x >= mapData.width ||
        position.y < 0 || position.y >= mapData.height) {
      console.error(`[MapManager] Position out of bounds:`, position);
      return null;
    }

    const tile = mapData.tiles.find(t => t.x === position.x && t.y === position.y);
    
    if (!tile && mapData.defaultTile) {
      console.log(`[MapManager] Using default tile at (${position.x}, ${position.y})`);
      return {
        ...mapData.defaultTile,
        x: position.x,
        y: position.y,
        canMove: true
      };
    }

    return tile || null;
  }

  static getRandomMonster(tile: MapTile): any | null {
    if (!tile.monsterGroups || tile.monsterGroups.length === 0) {
      return null;
    }

    const groupId = tile.monsterGroups[Math.floor(Math.random() * tile.monsterGroups.length)];
    const group = (window as any).monsterGroups?.[groupId];

    if (!group) {
      console.error(`[MapManager] Monster group not found: ${groupId}`);
      return null;
    }

    return { ...group[Math.floor(Math.random() * group.length)] };
  }

  static getEncounterChance(tile: MapTile): number {
    switch (tile.type) {
      case 'mountain': return 0.3;
      case 'forest': return 0.25;
      case 'cave': return 0.4;
      case 'dungeon': return 0.5;
      default: return 0.1;
    }
  }

  static checkEncounter(tile: MapTile): boolean {
    const chance = this.getEncounterChance(tile);
    return Math.random() < chance;
  }

  static async getAdjacentTiles(mapId: string, position: Position): Promise<{
    north: MapTile | null;
    south: MapTile | null;
    east: MapTile | null;
    west: MapTile | null;
  }> {
    console.log(`[MapManager] Getting adjacent tiles for position:`, position);
    
    const mapData = await this.loadMapData(mapId);
    if (!mapData) {
      console.error(`[MapManager] No map data for adjacent tiles`);
      return {
        north: null,
        south: null,
        east: null,
        west: null
      };
    }

    const getTile = async (x: number, y: number): Promise<MapTile | null> => {
      if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) {
        return null;
      }

      const tile = mapData.tiles.find(t => t.x === x && t.y === y);
      if (!tile && mapData.defaultTile) {
        return {
          ...mapData.defaultTile,
          x,
          y,
          canMove: true
        };
      }
      return tile || null;
    };

    const [north, south, east, west] = await Promise.all([
      getTile(position.x, position.y - 1),
      getTile(position.x, position.y + 1),
      getTile(position.x + 1, position.y),
      getTile(position.x - 1, position.y)
    ]);

    const adjacentTiles = {
      north,
      south,
      east,
      west
    };

    console.log(`[MapManager] Adjacent tiles:`, {
      north: north ? `${north.name} (${position.x},${position.y-1})` : 'none',
      south: south ? `${south.name} (${position.x},${position.y+1})` : 'none',
      east: east ? `${east.name} (${position.x+1},${position.y})` : 'none',
      west: west ? `${west.name} (${position.x-1},${position.y})` : 'none'
    });

    return adjacentTiles;
  }

  static async isValidMove(
    mapId: string,
    from: Position,
    to: Position,
    playerLevel: number,
    playerRealm: string
  ): Promise<boolean> {
    const mapData = await this.loadMapData(mapId);
    if (!mapData) {
      console.error(`[MapManager] No map data for move validation`);
      return false;
    }

    if (
      to.x < 0 || to.x >= mapData.width ||
      to.y < 0 || to.y >= mapData.height
    ) {
      console.error(`[MapManager] Move position out of bounds:`, to);
      return false;
    }

    const tile = mapData.tiles.find(t => t.x === to.x && t.y === to.y);
    if (!tile && !mapData.defaultTile) {
      console.error(`[MapManager] No tile found at destination and no default tile`);
      return false;
    }

    const targetTile = tile || {
      ...mapData.defaultTile,
      x: to.x,
      y: to.y,
      canMove: true
    };

    if (!targetTile.canMove) {
      console.error(`[MapManager] Tile is not movable:`, targetTile);
      return false;
    }

    if (mapData.requiredLevel && playerLevel < mapData.requiredLevel) {
      console.error(`[MapManager] Player level too low. Required: ${mapData.requiredLevel}, Current: ${playerLevel}`);
      return false;
    }

    if (mapData.requiredRealm) {
      const realms = ['练气期', '筑基期', '金丹期', '元婴期'];
      const requiredRealmIndex = realms.indexOf(mapData.requiredRealm);
      const playerRealmIndex = realms.indexOf(playerRealm);
      if (playerRealmIndex < requiredRealmIndex) {
        console.error(`[MapManager] Player realm too low. Required: ${mapData.requiredRealm}, Current: ${playerRealm}`);
        return false;
      }
    }

    return true;
  }

  static async getMiniMap(mapId: string, position: Position, radius: number = 2): Promise<MapTile[][]> {
    const mapData = await this.loadMapData(mapId);
    if (!mapData) {
      console.error(`[MapManager] No map data for mini-map`);
      return [];
    }

    const miniMap: MapTile[][] = [];
    const currentWeather = this.getCurrentWeather(mapId);
    const visibility = currentWeather === 'blizzard' ? 1 : 
                      currentWeather === 'foggy' ? 1 :
                      radius;
    
    for (let y = position.y - visibility; y <= position.y + visibility; y++) {
      const row: MapTile[] = [];
      for (let x = position.x - visibility; x <= position.x + visibility; x++) {
        if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) {
          row.push(mapData.defaultTile);
          continue;
        }

        const tile = mapData.tiles.find(t => t.x === x && t.y === y);
        row.push(tile || mapData.defaultTile);
      }
      miniMap.push(row);
    }

    return miniMap;
  }

  static getCurrentWeather(mapId: string): Weather | null {
    const mapData = this.mapCache.get(mapId);
    if (!mapData || !mapData.weather) return null;
    return mapData.weather[Math.floor(Math.random() * mapData.weather.length)];
  }

  // 清除缓存
  static clearCache(): void {
    console.log(`[MapManager] Clearing map cache`);
    this.mapCache.clear();
  }
}