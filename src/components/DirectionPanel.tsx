import React from 'react';
import { MapTile } from '../types/game';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Map } from 'lucide-react';

interface DirectionPanelProps {
  adjacentTiles: {
    north: MapTile | null;
    south: MapTile | null;
    east: MapTile | null;
    west: MapTile | null;
  };
  onMove: (direction: 'north' | 'south' | 'east' | 'west') => void;
  onOpenMap: () => void;
}

export default function DirectionPanel({ adjacentTiles, onMove, onOpenMap }: DirectionPanelProps) {
  const renderDirectionButton = (
    direction: 'north' | 'south' | 'east' | 'west',
    tile: MapTile | null,
    Icon: typeof ArrowUp
  ) => {
    const isAccessible = tile && tile.canMove;
    const displayName = tile ? tile.name : '无法通行';

    return (
      <button 
        className={`direction-btn ${!isAccessible ? 'opacity-50' : ''}`}
        onClick={() => onMove(direction)}
        disabled={!isAccessible}
      >
        <div className="flex items-center justify-center gap-2">
          <Icon className="w-4 h-4" />
          <span>{displayName} [{direction.charAt(0).toUpperCase()}]</span>
        </div>
      </button>
    );
  };

  return (
    <div className="game-section">
      <div className="direction-grid">
        <div></div>
        {renderDirectionButton('north', adjacentTiles.north, ArrowUp)}
        <div></div>
        
        {renderDirectionButton('west', adjacentTiles.west, ArrowLeft)}
        <button 
          className="direction-btn"
          onClick={onOpenMap}
        >
          <div className="flex items-center justify-center gap-2">
            <Map className="w-4 h-4" />
            <span>查看地图[M]</span>
          </div>
        </button>
        {renderDirectionButton('east', adjacentTiles.east, ArrowRight)}
        
        <div></div>
        {renderDirectionButton('south', adjacentTiles.south, ArrowDown)}
        <div></div>
      </div>
    </div>
  );
}