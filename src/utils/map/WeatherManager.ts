import { Weather, MapData } from '../../types/game';
import { MapLoader } from './MapLoader';

export class WeatherManager {
  private static weatherCache: Map<string, {
    weather: Weather;
    timestamp: number;
  }> = new Map();

  private static readonly WEATHER_DURATION = 5 * 60 * 1000; // 5分钟

  static async getCurrentWeather(mapId: string): Promise<Weather | null> {
    try {
      // 检查缓存
      const cached = this.weatherCache.get(mapId);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < this.WEATHER_DURATION) {
        return cached.weather;
      }

      // 加载地图数据
      const mapData = await MapLoader.loadMapData(mapId);
      if (!mapData?.weather || mapData.weather.length === 0) {
        return null;
      }

      // 随机选择新天气
      const newWeather = mapData.weather[Math.floor(Math.random() * mapData.weather.length)];

      // 更新缓存
      this.weatherCache.set(mapId, {
        weather: newWeather,
        timestamp: now
      });

      return newWeather;
    } catch (error) {
      console.error('[WeatherManager] Failed to get weather:', error);
      return null;
    }
  }

  static getWeatherEffect(weather: Weather): {
    visibility: number;
    movementSpeed: number;
    cultivationBonus: number;
  } {
    switch (weather) {
      case 'blizzard':
        return {
          visibility: 1,
          movementSpeed: 0.5,
          cultivationBonus: 0.8
        };
      case 'foggy':
        return {
          visibility: 1,
          movementSpeed: 0.8,
          cultivationBonus: 1.0
        };
      case 'rainy':
        return {
          visibility: 2,
          movementSpeed: 0.9,
          cultivationBonus: 1.2
        };
      case 'stormy':
        return {
          visibility: 2,
          movementSpeed: 0.7,
          cultivationBonus: 1.5
        };
      case 'clear':
      default:
        return {
          visibility: 3,
          movementSpeed: 1.0,
          cultivationBonus: 1.0
        };
    }
  }

  static getWeatherDescription(weather: Weather): string {
    switch (weather) {
      case 'blizzard':
        return '暴风雪肆虐，能见度极低，行动受阻';
      case 'foggy':
        return '浓雾弥漫，视野受限';
      case 'rainy':
        return '细雨绵绵，灵气略有增强';
      case 'stormy':
        return '雷暴交加，天地灵气涌动';
      case 'clear':
        return '天朗气清，适合修炼';
      default:
        return '天气正常';
    }
  }

  static clearCache(): void {
    this.weatherCache.clear();
  }
}