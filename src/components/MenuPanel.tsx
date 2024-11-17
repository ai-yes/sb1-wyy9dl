import React from 'react';

interface MenuPanelProps {
  onOpenInventory: () => void;
  onOpenProfile: () => void;
}

export default function MenuPanel({ onOpenInventory, onOpenProfile }: MenuPanelProps) {
  return (
    <div className="menu-grid">
      <button className="menu-btn">功法秘籍[F1]</button>
      <button className="menu-btn" onClick={onOpenInventory}>背包物品[F2]</button>
      <button className="menu-btn">当前任务[F3]</button>
      <button className="menu-btn">好友列表[F4]</button>
      <button className="menu-btn" onClick={onOpenProfile}>个人信息[F5]</button>
      <button className="menu-btn">江湖状态[F6]</button>
    </div>
  );
}