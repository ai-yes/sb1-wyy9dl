import { MapData, MapTile, Position } from '../../types/game';

export class MapParser {
  static async parseMapFile(content: string): Promise<MapData> {
    const lines = content.split('\n');
    const mapData: MapData = {
      id: '',
      name: '',
      description: '',
      width: 0,
      height: 0,
      tiles: [],
      defaultTile: {
        type: 'plain',
        name: 'Unknown Area',
        description: '',
        canMove: true,
        x: 0,
        y: 0
      }
    };

    let currentSection = '';
    let currentTile: Partial<MapTile> = {};

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('//')) continue;

      // 处理section标记
      if (line.endsWith(':')) {
        currentSection = line.slice(0, -1).toLowerCase();
        continue;
      }

      // 根据当前section处理数据
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());

        switch (currentSection) {
          case '':
            // 顶级属性
            if (key === 'size') {
              const [width, height] = value.split('x').map(Number);
              mapData.width = width;
              mapData.height = height;
            } else {
              (mapData as any)[key] = value;
            }
            break;

          case 'default':
            // 默认地块属性
            if (key === 'resources' || key === 'monsters' || key === 'npcs' || key === 'shops') {
              (mapData.defaultTile as any)[key] = value.split(',').map(s => s.trim());
            } else {
              (mapData.defaultTile as any)[key] = value;
            }
            break;

          case 'tiles':
            // 特殊地块定义
            if (key.includes(',')) {
              // 新地块开始
              if (Object.keys(currentTile).length > 0) {
                mapData.tiles.push(currentTile as MapTile);
              }
              const [x, y] = key.split(',').map(Number);
              currentTile = { x, y };
            } else {
              // 地块属性
              if (key === 'resources' || key === 'monsters' || key === 'npcs' || key === 'shops') {
                (currentTile as any)[key] = value.split(',').map(s => s.trim());
              } else if (key === 'teleports') {
                // 处理传送点
                if (!Array.isArray((currentTile as any).teleports)) {
                  (currentTile as any).teleports = [];
                }
              } else {
                (currentTile as any)[key] = value;
              }
            }
            break;
        }
      } else if (currentSection === 'tiles' && line.startsWith('-')) {
        // 处理传送点列表
        const teleportData = line.slice(1).trim();
        const [dest, name, cost, level] = teleportData.split(',').map(s => s.trim());
        if (currentTile.teleports) {
          currentTile.teleports.push({
            mapId: dest,
            name,
            cost: parseInt(cost),
            requiredLevel: parseInt(level)
          });
        }
      }
    }

    // 添加最后一个地块
    if (Object.keys(currentTile).length > 0) {
      mapData.tiles.push(currentTile as MapTile);
    }

    return mapData;
  }
}