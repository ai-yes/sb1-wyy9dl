import { GameState, InventoryItem } from '../types/game';
import DataManager from '../utils/DataManager';

export class InventorySystem {
  static readonly MAX_INVENTORY_SIZE = 20;
  
  static async addItem(
    gameState: GameState,
    itemId: string,
    amount: number,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<boolean> {
    const newState = { ...gameState };
    
    // 检查背包是否已满
    if (newState.inventory.length >= this.MAX_INVENTORY_SIZE) {
      onLogMessage('背包已满！');
      return false;
    }

    // 获取物品数据
    const itemData = await DataManager.getItem(itemId);
    if (!itemData) {
      onLogMessage('物品不存在！');
      return false;
    }
    
    // 查找现有物品
    const existingItem = newState.inventory.find(i => i.id === itemId);
    
    if (existingItem && itemData.stackable) {
      const newQuantity = existingItem.quantity + amount;
      if (itemData.maxStack && newQuantity > itemData.maxStack) {
        onLogMessage(`${itemData.name}已达到最大堆叠数量！`);
        return false;
      }
      existingItem.quantity = newQuantity;
      onLogMessage(`获得${amount}个${itemData.name}`);
    } else {
      // 添加新物品
      newState.inventory.push({
        ...itemData,
        quantity: amount
      });
      onLogMessage(`获得${amount}个${itemData.name}`);
    }
    
    onStateChange(newState);
    return true;
  }
  
  static removeItem(
    gameState: GameState,
    itemId: string,
    amount: number,
    onStateChange: (state: GameState) => void
  ): boolean {
    const newState = { ...gameState };
    const itemIndex = newState.inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return false;
    
    const item = newState.inventory[itemIndex];
    if (item.quantity <= amount) {
      newState.inventory.splice(itemIndex, 1);
    } else {
      item.quantity -= amount;
    }
    
    onStateChange(newState);
    return true;
  }
  
  static async useItem(
    gameState: GameState,
    itemId: string,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<boolean> {
    const newState = { ...gameState };
    const item = newState.inventory.find(i => i.id === itemId);
    
    if (!item) {
      const itemData = await DataManager.getItem(itemId);
      if (!itemData || !itemData.usable) {
        onLogMessage('无法使用该物品！');
        return false;
      }
    }
    
    if (!item?.usable) {
      onLogMessage('无法使用该物品！');
      return false;
    }
    
    // 应用物品效果
    if (item.effects) {
      item.effects.forEach(effect => {
        switch (effect.type) {
          case 'hp':
            newState.player.hp = Math.min(
              newState.player.maxHp,
              newState.player.hp + effect.value
            );
            onLogMessage(`恢复了${effect.value}点生命值`);
            break;
          case 'mp':
            newState.player.mp = Math.min(
              newState.player.maxMp,
              newState.player.mp + effect.value
            );
            onLogMessage(`恢复了${effect.value}点法力值`);
            break;
          case 'attack':
          case 'defense':
          case 'spirit':
          case 'agility':
            const statValue = newState.player[effect.type];
            newState.player[effect.type] = statValue + effect.value;
            onLogMessage(`${effect.type}提升了${effect.value}点`);
            
            if (effect.duration) {
              setTimeout(() => {
                newState.player[effect.type] = statValue;
                onLogMessage(`${effect.type}增益效果已结束`);
                onStateChange(newState);
              }, effect.duration * 1000);
            }
            break;
        }
      });
    }
    
    // 减少物品数量
    this.removeItem(newState, itemId, 1, onStateChange);
    
    onStateChange(newState);
    return true;
  }
  
  static async sellItem(
    gameState: GameState,
    itemId: string,
    amount: number,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string) => void
  ): Promise<boolean> {
    const newState = { ...gameState };
    const item = newState.inventory.find(i => i.id === itemId);
    
    if (!item) {
      const itemData = await DataManager.getItem(itemId);
      if (!itemData || !itemData.sellPrice) {
        onLogMessage('无法出售该物品！');
        return false;
      }
    }
    
    if (!item?.sellPrice || item.quantity < amount) {
      onLogMessage('无法出售该物品！');
      return false;
    }
    
    const totalPrice = item.sellPrice * amount;
    newState.player.gold += totalPrice;
    
    this.removeItem(newState, itemId, amount, onStateChange);
    onLogMessage(`出售${amount}个${item.name}，获得${totalPrice}金币`);
    
    onStateChange(newState);
    return true;
  }
  
  static sortInventory(
    gameState: GameState,
    onStateChange: (state: GameState) => void
  ): void {
    const newState = { ...gameState };
    
    newState.inventory.sort((a, b) => {
      // 首先按类型排序
      if (a.type !== b.type) {
        const typeOrder = ['weapon', 'armor', 'consumable', 'material', 'quest'];
        return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      }
      
      // 然后按稀有度排序
      if (a.rarity !== b.rarity) {
        const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      }
      
      // 最后按名称排序
      return a.name.localeCompare(b.name);
    });
    
    onStateChange(newState);
  }
}