import { load } from 'js-yaml';
import { MapData, MapTile } from '../../types/game';

export class MapLoader {
  private static mapCache: Map<string, MapData> = new Map();

  static async loadMapData(mapId: string): Promise<MapData | null> {
    try {
      // Check cache
      const cachedMap = this.mapCache.get(mapId);
      if (cachedMap) {
        console.log(`[MapLoader] Using cached map: ${mapId}`);
        return cachedMap;
      }

      console.log(`[MapLoader] Loading map: ${mapId}`);

      // Load YAML file
      const response = await fetch(`/src/data/maps/${mapId.replace(/_/g, '-')}/map.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to load map file (${response.status})`);
      }

      const yamlContent = await response.text();
      const mapData = load(yamlContent) as MapData;

      // Validate map data
      if (!mapData || typeof mapData !== 'object') {
        throw new Error(`Invalid YAML content for ${mapId}`);
      }

      // Process tiles
      if (!Array.isArray(mapData.tiles)) {
        mapData.tiles = [];
      }

      // Ensure defaultTile exists
      if (!mapData.defaultTile) {
        mapData.defaultTile = {
          type: 'plain',
          name: 'Unknown Area',
          description: '',
          canMove: true,
          x: 0,
          y: 0
        };
      }

      // Add map ID
      mapData.id = mapId;

      // Process tiles and ensure all required properties
      mapData.tiles = mapData.tiles.map(tile => ({
        type: 'plain',
        name: 'Unknown Area',
        description: '',
        canMove: true,
        ...mapData.defaultTile,
        ...tile,
        x: Number(tile.x),
        y: Number(tile.y)
      }));

      console.log(`[MapLoader] Successfully loaded map:`, {
        id: mapData.id,
        name: mapData.name,
        width: mapData.width,
        height: mapData.height,
        tilesCount: mapData.tiles.length
      });

      // Update cache
      this.mapCache.set(mapId, mapData);
      return mapData;

    } catch (error) {
      console.error(`[MapLoader] Failed to load map ${mapId}:`, error);
      return null;
    }
  }

  static clearCache(): void {
    console.log(`[MapLoader] Clearing map cache`);
    this.mapCache.clear();
  }
}