import { MapData } from '../../types/game';
import { MapLoader } from '../../utils/map/MapLoader';

// Map cache to store loaded maps
const maps: Record<string, MapData> = {};
let initialized = false;
let initializationPromise: Promise<void> | null = null;

// Initialize maps
function initMaps() {
  if (initialized) return Promise.resolve();
  
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    console.log('[MapManager] Starting map initialization...');
    
    const baseMapIds = ['starting_area', 'spirit_valley', 'mystic_forest', 'ancient_ruins'];
    
    try {
      // Load maps sequentially to ensure proper error handling
      for (const mapId of baseMapIds) {
        try {
          const mapData = await MapLoader.loadMapData(mapId);
          if (mapData) {
            maps[mapId] = mapData;
            console.log(`[MapManager] Successfully loaded base map: ${mapId}`);
          } else {
            console.error(`[MapManager] Failed to load map: ${mapId}`);
          }
        } catch (error) {
          console.error(`[MapManager] Error loading map ${mapId}:`, error);
        }
      }

      if (Object.keys(maps).length === 0) {
        throw new Error('No maps were loaded successfully');
      }

      initialized = true;
      console.log('[MapManager] Map initialization complete');
    } catch (error) {
      console.error('[MapManager] Critical error during map initialization:', error);
      initialized = false;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

// Export map loading functions
export const getMapById = async (id: string): Promise<MapData | null> => {
  await initMaps();

  // Check if map is already loaded
  if (maps[id]) {
    return maps[id];
  }

  // Attempt to load the map
  try {
    const mapData = await MapLoader.loadMapData(id);
    if (mapData) {
      maps[id] = mapData;
      return mapData;
    }
  } catch (error) {
    console.error(`[MapManager] Error loading map ${id}:`, error);
  }
  return null;
};

// Get base map ID (remove suffix)
export const getBaseMapId = (id: string): string => {
  return id.replace(/_\d+$/, '');
};

// Export maps object and initialization status
export { maps, initialized, initMaps as initializeMaps };