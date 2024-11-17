import { MapData, MapTile, Position, Weather } from '../../types/game';
import { MapLoader } from './MapLoader';
import { TileManager } from './TileManager';
import { MovementManager } from './MovementManager';
import { CombatManager } from './CombatManager';
import { WeatherManager } from './WeatherManager';
import { maps, initializeMaps, initialized } from '../../data/maps';

export class MapManager {
  private static initialized = false;
  private static initializationPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('[MapManager] Starting initialization...');
        
        // Initialize combat manager first and wait for it to complete
        await CombatManager.initialize();
        console.log('[MapManager] Combat system initialized');
        
        // Then initialize maps
        await initializeMaps();
        console.log('[MapManager] Maps initialized');
        
        this.initialized = true;
        console.log('[MapManager] Successfully initialized map system');
      } catch (error) {
        console.error('[MapManager] Failed to initialize map system:', error);
        // Reset initialization state to allow retry
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

  // Basic map operations
  static async getMapTile(mapId: string, position: Position): Promise<MapTile | null> {
    await this.ensureInitialized();
    return TileManager.getMapTile(mapId, position);
  }

  // Get adjacent tiles
  static async getAdjacentTiles(mapId: string, position: Position): Promise<{
    north: MapTile | null;
    south: MapTile | null;
    east: MapTile | null;
    west: MapTile | null;
  }> {
    await this.ensureInitialized();
    return TileManager.getAdjacentTiles(mapId, position);
  }

  // Movement related
  static async isValidMove(
    mapId: string,
    from: Position,
    to: Position,
    playerLevel: number,
    playerRealm: string
  ): Promise<boolean> {
    await this.ensureInitialized();
    return MovementManager.isValidMove(mapId, from, to, playerLevel, playerRealm);
  }

  // Combat related
  static async getRandomMonster(tile: MapTile): Promise<any | null> {
    await this.ensureInitialized();
    return CombatManager.getRandomMonster(tile);
  }

  static async checkEncounter(tile: MapTile): Promise<boolean> {
    await this.ensureInitialized();
    return CombatManager.checkEncounter(tile);
  }

  // Mini-map related
  static async getMiniMap(mapId: string, position: Position, radius: number = 2): Promise<MapTile[][]> {
    await this.ensureInitialized();
    const currentWeather = await WeatherManager.getCurrentWeather(mapId);
    const weatherEffect = WeatherManager.getWeatherEffect(currentWeather || 'clear');
    const visibility = Math.min(radius, weatherEffect.visibility);
    
    const miniMap: MapTile[][] = [];
    const mapData = maps[mapId];
    
    if (!mapData) {
      console.error(`[MapManager] No map data for mini-map`);
      return [];
    }
    
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

  // Weather related
  static async getCurrentWeather(mapId: string): Promise<Weather | null> {
    await this.ensureInitialized();
    return WeatherManager.getCurrentWeather(mapId);
  }

  static getWeatherEffect(weather: Weather) {
    return WeatherManager.getWeatherEffect(weather);
  }

  static getWeatherDescription(weather: Weather): string {
    return WeatherManager.getWeatherDescription(weather);
  }

  // Cache management
  static clearCache(): void {
    MapLoader.clearCache();
    WeatherManager.clearCache();
    CombatManager.clearCache();
    this.initialized = false;
    this.initializationPromise = null;
  }

  // Get all loaded maps
  static getMaps(): Record<string, MapData> {
    return maps;
  }
}