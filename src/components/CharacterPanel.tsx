import React from 'react';
import { Character } from '../types/game';

interface CharacterPanelProps {
  character: Character;
}

export default function CharacterPanel({ character }: CharacterPanelProps) {
  return (
    <div className="game-section">
      <div className="char-stats">
        <div>
          {character.name} [{character.level}级]
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(character.exp / character.maxExp) * 100}%` }}
            />
          </div>
          经验: {character.exp}/{character.maxExp}
        </div>
        <div>
          法力: {character.mp}/{character.maxMp}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(character.mp / character.maxMp) * 100}%` }}
            />
          </div>
        </div>
        <div>
          气血: {character.hp}/{character.maxHp}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
            />
          </div>
        </div>
        <div>
          体力: {character.stamina}/{character.maxStamina}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(character.stamina / character.maxStamina) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="divider" />
      <div>
        金币: {character.gold} | 境界: {character.cultivation.realm} | 
        修为: {character.cultivation.progress}%
      </div>
    </div>
  );
}