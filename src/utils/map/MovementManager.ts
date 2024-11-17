import { Position } from '../../types/game';
import { MapLoader } from './MapLoader';

export class MovementManager {
  static async isValidMove(
    mapId: string,
    from: Position,
    to: Position,
    playerLevel: number,
    playerRealm: string
  ): Promise<boolean> {
    const mapData = await MapLoader.loadMapData(mapId);
    if (!mapData) {
      console.error(`[MovementManager] No map data for move validation`);
      return false;
    }

    if (
      to.x < 0 || to.x >= mapData.width ||
      to.y < 0 || to.y >= mapData.height
    ) {
      console.error(`[MovementManager] Move position out of bounds:`, to);
      return false;
    }

    const tile = mapData.tiles.find(t => t.x === to.x && t.y === to.y);
    if (!tile && !mapData.defaultTile) {
      console.error(`[MovementManager] No tile found at destination and no default tile`);
      return false;
    }

    const targetTile = tile || {
      ...mapData.defaultTile,
      x: to.x,
      y: to.y,
      canMove: true
    };

    if (!targetTile.canMove) {
      console.error(`[MovementManager] Tile is not movable:`, targetTile);
      return false;
    }

    if (mapData.requiredLevel && playerLevel < mapData.requiredLevel) {
      console.error(`[MovementManager] Player level too low. Required: ${mapData.requiredLevel}, Current: ${playerLevel}`);
      return false;
    }

    if (mapData.requiredRealm) {
      const realms = ['练气期', '筑基期', '金丹期', '元婴期'];
      const requiredRealmIndex = realms.indexOf(mapData.requiredRealm);
      const playerRealmIndex = realms.indexOf(playerRealm);
      if (playerRealmIndex < requiredRealmIndex) {
        console.error(`[MovementManager] Player realm too low. Required: ${mapData.requiredRealm}, Current: ${playerRealm}`);
        return false;
      }
    }

    return true;
  }
}