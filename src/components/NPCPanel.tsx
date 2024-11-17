import React, { useState, useEffect } from 'react';
import { NPC } from '../types/game';
import DataManager from '../utils/DataManager';
import NPCInfoDialog from './NPCInfoDialog';

interface NPCPanelProps {
  npcIds: string[];
}

export default function NPCPanel({ npcIds }: NPCPanelProps) {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);

  useEffect(() => {
    async function loadNPCs() {
      try {
        setIsLoading(true);
        const loadedNpcs = await Promise.all(
          npcIds.map(id => DataManager.getNPC(id))
        );
        setNpcs(loadedNpcs.filter((npc): npc is NPC => npc !== null));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load NPCs:', error);
        setIsLoading(false);
      }
    }

    loadNPCs();
  }, [npcIds]);

  if (isLoading) {
    return (
      <div className="game-section">
        <div className="font-bold mb-2">在场人物：</div>
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="game-section">
        <div className="font-bold mb-2">在场人物：</div>
        {npcs.length > 0 ? (
          <ul className="space-y-2">
            {npcs.map(npc => (
              <li 
                key={npc.id} 
                className="flex items-center gap-2 p-2 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer transition-colors"
                onClick={() => setSelectedNpc(npc)}
              >
                <div className="text-blue-600">👤</div>
                <div>
                  <div className="font-medium">{npc.name}</div>
                  <div className="text-sm text-gray-600">{npc.title}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 text-sm">这里没有其他人</div>
        )}
      </div>

      <NPCInfoDialog
        npc={selectedNpc}
        isOpen={!!selectedNpc}
        onClose={() => setSelectedNpc(null)}
      />
    </>
  );
}