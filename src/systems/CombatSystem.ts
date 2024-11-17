import { Character, Monster, GameState, Skill, InventoryItem } from '../types/game';
import { InventorySystem } from './InventorySystem';
import DataManager from '../utils/DataManager';

export class CombatSystem {
  static async handleCombat(
    gameState: GameState,
    monster: Monster,
    onStateChange: (state: GameState) => void,
    onLogMessage: (message: string, isImportant: boolean) => void
  ): Promise<boolean> {
    const player = gameState.player;
    let currentRound = 1;
    let playerSkillCooldowns = new Map<string, number>();
    
    while (player.hp > 0 && monster.hp > 0) {
      onLogMessage(`第 ${currentRound} 回合`, false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 玩家回合
      const availableSkills = player.skills.filter(skill => 
        !playerSkillCooldowns.get(skill.id) && player.mp >= skill.mpCost
      );
      
      if (availableSkills.length > 0) {
        const selectedSkill = CombatSystem.selectBestSkill(availableSkills, player, monster);
        const damage = CombatSystem.calculateSkillDamage(player, monster, selectedSkill);
        
        player.mp -= selectedSkill.mpCost;
        playerSkillCooldowns.set(selectedSkill.id, selectedSkill.cooldown);
        
        monster.hp -= damage;
        onLogMessage(`你使用了【${selectedSkill.name}】，对${monster.name}造成${damage}点伤害！`, false);
        
        if (selectedSkill.effects) {
          CombatSystem.applySkillEffects(selectedSkill, player, monster, onLogMessage);
        }
      } else {
        const damage = CombatSystem.calculateDamage(player, monster);
        monster.hp -= damage;
        onLogMessage(`你发起攻击，对${monster.name}造成${damage}点伤害！`, false);
      }
      
      // 更新技能冷却
      for (const [skillId, cooldown] of playerSkillCooldowns.entries()) {
        if (cooldown > 0) {
          playerSkillCooldowns.set(skillId, cooldown - 1);
        }
      }
      
      // 检查怪物是否被击败
      if (monster.hp <= 0) {
        // 战斗胜利消息
        onLogMessage(`战斗胜利！击败了${monster.name}！`, true);
        
        // 计算并添加经验值
        const expGain = CombatSystem.calculateExpGain(monster, gameState.player.level);
        gameState.player.exp += expGain;
        onLogMessage(`获得了${expGain}点经验值！`, true);
        
        // 计算并添加金币
        const goldGain = CombatSystem.calculateGoldGain(monster);
        gameState.player.gold += goldGain;
        onLogMessage(`获得了${goldGain}金币！`, true);
        
        // 处理掉落物品
        if (monster.drops) {
          for (const drop of monster.drops) {
            if (Math.random() < drop.chance) {
              try {
                // 使用 DataManager 获取物品数据
                const itemData = await DataManager.getItem(drop.itemId);
                if (itemData) {
                  // 添加到背包
                  const added = await InventorySystem.addItem(
                    gameState,
                    drop.itemId,
                    1,
                    onStateChange,
                    (message) => onLogMessage(message, true)
                  );
                  
                  if (added) {
                    onLogMessage(`获得了【${itemData.name}】！`, true);
                  } else {
                    onLogMessage(`背包已满，无法获得【${itemData.name}】！`, true);
                  }
                } else {
                  onLogMessage(`物品不存在：${drop.itemId}`, true);
                }
              } catch (error) {
                console.error('Failed to process item drop:', error);
                onLogMessage(`物品获取失败`, true);
              }
            }
          }
        }
        
        // 检查是否升级
        if (gameState.player.exp >= gameState.player.maxExp) {
          CombatSystem.handleLevelUp(gameState, onLogMessage);
        }
        
        onStateChange({ ...gameState });
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 怪物回合
      if (monster.skills && monster.skills.length > 0) {
        const monsterSkill = monster.skills[Math.floor(Math.random() * monster.skills.length)];
        const damage = CombatSystem.calculateSkillDamage(monster, player, monsterSkill);
        player.hp -= damage;
        onLogMessage(`${monster.name}使用了【${monsterSkill.name}】，对你造成${damage}点伤害！`, false);
      } else {
        const damage = CombatSystem.calculateDamage(monster, player);
        player.hp -= damage;
        onLogMessage(`${monster.name}发起攻击，对你造成${damage}点伤害！`, false);
      }
      
      onLogMessage(`你的状态：HP ${player.hp}/${player.maxHp} | MP ${player.mp}/${player.maxMp}`, false);
      onLogMessage(`${monster.name}：HP ${monster.hp}/${monster.maxHp}`, false);
      
      if (player.hp <= 0) {
        onLogMessage(`战斗失败！被${monster.name}击败了！`, true);
        
        const expLoss = Math.floor(gameState.player.exp * 0.1);
        gameState.player.exp = Math.max(0, gameState.player.exp - expLoss);
        onLogMessage(`损失了${expLoss}点经验值...`, true);
        
        gameState.player.hp = Math.floor(gameState.player.maxHp * 0.3);
        onLogMessage(`你被传送回了安全区域`, true);
        
        onStateChange(gameState);
        return false;
      }
      
      currentRound++;
      onStateChange({ ...gameState });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }

  private static calculateDamage(attacker: Character | Monster, defender: Character | Monster): number {
    const baseDamage = attacker.attack - defender.defense;
    const variation = baseDamage * 0.2;
    const finalDamage = baseDamage + (Math.random() * variation * 2 - variation);
    return Math.max(1, Math.floor(finalDamage));
  }
  
  private static calculateSkillDamage(
    attacker: Character | Monster,
    defender: Character | Monster,
    skill: Skill
  ): number {
    let baseDamage = this.calculateDamage(attacker, defender);
    return Math.floor(baseDamage * (skill.damage || 1));
  }
  
  private static selectBestSkill(skills: Skill[], player: Character, monster: Monster): Skill {
    if (player.hp < player.maxHp * 0.3) {
      const defenseSkill = skills.find(s => s.type === 'defense');
      if (defenseSkill) return defenseSkill;
    }
    
    if (player.mp > player.maxMp * 0.7) {
      const attackSkill = skills.find(s => s.type === 'attack' && s.damage > 1);
      if (attackSkill) return attackSkill;
    }
    
    const sortedSkills = [...skills].sort((a, b) => (b.damage || 1) - (a.damage || 1));
    return sortedSkills[0];
  }
  
  private static applySkillEffects(
    skill: Skill,
    attacker: Character | Monster,
    defender: Character | Monster,
    onLogMessage: (message: string, isImportant: boolean) => void
  ): void {
    if (!skill.effects) return;
    
    skill.effects.forEach(effect => {
      switch (effect.type) {
        case 'hp':
          if (effect.value > 0) {
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + effect.value);
            onLogMessage(`恢复了${effect.value}点生命值！`, false);
          }
          break;
        case 'mp':
          if (effect.value > 0) {
            attacker.mp = Math.min(attacker.maxMp, attacker.mp + effect.value);
            onLogMessage(`恢复了${effect.value}点法力值！`, false);
          }
          break;
      }
    });
  }
  
  private static calculateExpGain(monster: Monster, playerLevel: number): number {
    const levelDiff = monster.level - playerLevel;
    let expMultiplier = 1;
    
    if (levelDiff > 0) {
      expMultiplier = 1 + (levelDiff * 0.1);
    } else if (levelDiff < -5) {
      expMultiplier = Math.max(0.1, 1 + (levelDiff * 0.1));
    }
    
    return Math.floor(monster.exp * expMultiplier);
  }
  
  private static calculateGoldGain(monster: Monster): number {
    const variation = monster.gold * 0.2;
    return Math.floor(monster.gold + (Math.random() * variation * 2 - variation));
  }
  
  private static handleLevelUp(
    gameState: GameState,
    onLogMessage: (message: string, isImportant: boolean) => void
  ): void {
    gameState.player.level++;
    gameState.player.exp -= gameState.player.maxExp;
    gameState.player.maxExp = Math.floor(gameState.player.maxExp * 1.2);
    
    gameState.player.maxHp += 10;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.maxMp += 5;
    gameState.player.mp = gameState.player.maxMp;
    gameState.player.attack += 2;
    gameState.player.defense += 2;
    gameState.player.spirit += 1;
    gameState.player.agility += 1;
    
    onLogMessage(`突破到了${gameState.player.level}级！全属性得到提升！`, true);
  }
}