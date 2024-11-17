import React, { useEffect, useRef } from 'react';

interface GameLogProps {
  messages: Array<{
    type: 'system' | 'chat';
    content: string;
  }>;
}

export default function GameLog({ messages }: GameLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="game-section">
      <div className="font-bold mb-2">游戏日志</div>
      <div 
        ref={logRef}
        className="h-32 overflow-y-auto p-2 bg-slate-800/50 rounded-lg text-sm"
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`${
              msg.type === 'system' ? 'text-gray-300' : 'text-gray-400'
            } mb-1`}
          >
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}