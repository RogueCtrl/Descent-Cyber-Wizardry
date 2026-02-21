import { Storage } from '../utils/Storage.ts';
import { Equipment } from './Equipment.ts';

export class ShopSystem {
  standardStock: string[];

  constructor() {
    this.standardStock = [
      'Dagger',
      'Short Sword',
      'Mace',
      'Staff',
      'Leather Armor',
      'Small Shield',
      'Potion of Healing'
    ];
  }

  async getStandardInventory() {
    const inventory = [];
    for (const itemName of this.standardStock) {
      const itemData = await Equipment.getItemData(itemName);
      if (itemData) {
        inventory.push(itemData);
      }
    }
    return inventory;
  }

  async buyItem(party: any, itemName: string, equipmentSystem: any) {
    const itemData = await Equipment.getItemData(itemName);
    if (!itemData) {
      return { success: false, message: 'Item not found in database.' };
    }

    const cost = itemData.value || 0;
    if (party.gold < cost) {
      return { success: false, message: 'Not enough gold.' };
    }

    try {
      party.gold -= cost;
      const instance = await equipmentSystem.createItemInstance(itemName);

      if (!party.inventory) {
        party.inventory = [];
      }
      party.inventory.push(instance);

      await Storage.saveParty(party);
      return { success: true, item: instance };
    } catch (e: any) {
      console.error('Error buying item:', e);
      return { success: false, message: e.message || 'Error processing purchase.' };
    }
  }

  async sellItem(party: any, itemIndex: number) {
    if (!party.inventory || itemIndex < 0 || itemIndex >= party.inventory.length) {
      return { success: false, message: 'Item not found in inventory.' };
    }

    const item = party.inventory[itemIndex];

    if (item.cursed) {
      return { success: false, message: 'The merchant refuses to buy this cursed item!' };
    }

    const baseValue = item.value || 0;
    const sellValue = Math.floor(baseValue / 2);

    party.inventory.splice(itemIndex, 1);
    party.gold += sellValue;

    await Storage.saveParty(party);

    return { success: true, price: sellValue };
  }

  async identifyItem(party: any, itemIndex: number) {
    if (!party.inventory || itemIndex < 0 || itemIndex >= party.inventory.length) {
      return { success: false, message: 'Item not found in inventory.' };
    }

    const item = party.inventory[itemIndex];
    if (item.identified || item.state === 'IDENTIFIED') {
      return { success: false, message: 'Item is already identified.' };
    }

    const trueValue = item.value || 100;
    const fee = Math.max(50, Math.floor(trueValue * 0.1));

    if (party.gold < fee) {
      return { success: false, message: 'Not enough gold to identify.' };
    }

    party.gold -= fee;

    item.identified = true;
    item.state = 'IDENTIFIED';

    // Remove disguise if it was cursed/disguised
    if (item.apparentName) {
      delete item.apparentName;
      delete item.apparentDescription;
    }

    await Storage.saveParty(party);

    return { success: true, item };
  }
}
