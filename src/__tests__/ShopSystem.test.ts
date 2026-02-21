import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShopSystem } from '../game/ShopSystem';

const { mockStorage, mockEquipmentSystem } = vi.hoisted(() => {
  return {
    mockStorage: { saveParty: vi.fn().mockResolvedValue(true) },
    mockEquipmentSystem: { getItemData: vi.fn(), createItemInstance: vi.fn() }
  }
})

vi.mock('../utils/Storage.ts', () => ({
  Storage: mockStorage,
}));

vi.mock('../game/Equipment.ts', () => ({
  Equipment: {
    getItemData: vi.fn(),
  }
}));

describe('ShopSystem', () => {
  let shopSystem: ShopSystem;
  let mockParty: any;

  beforeEach(() => {
    vi.clearAllMocks();
    shopSystem = new ShopSystem();
    mockParty = {
      gold: 100,
      inventory: [],
    };
  });

  describe('buyItem', () => {
    it('should return false if item is not found', async () => {
      const { Equipment } = await import('../game/Equipment');
      (Equipment.getItemData as any).mockResolvedValueOnce(null);

      const result = await shopSystem.buyItem(mockParty, 'Unknown Item', mockEquipmentSystem);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Item not found in database.');
      expect(mockParty.gold).toBe(100);
      expect(mockParty.inventory.length).toBe(0);
    });

    it('should return false if party has insufficient gold', async () => {
      const { Equipment } = await import('../game/Equipment');
      (Equipment.getItemData as any).mockResolvedValueOnce({ name: 'Expensive Item', value: 500 });

      const result = await shopSystem.buyItem(mockParty, 'Expensive Item', mockEquipmentSystem);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Not enough gold.');
      expect(mockParty.gold).toBe(100);
      expect(mockParty.inventory.length).toBe(0);
    });

    it('should successfully buy item, deduct gold, and add to inventory', async () => {
      const { Equipment } = await import('../game/Equipment');
      (Equipment.getItemData as any).mockResolvedValueOnce({ name: 'Dagger', value: 10 });
      mockEquipmentSystem.createItemInstance.mockResolvedValueOnce({ name: 'Dagger', value: 10 });

      const result = await shopSystem.buyItem(mockParty, 'Dagger', mockEquipmentSystem);
      
      expect(result.success).toBe(true);
      expect(mockParty.gold).toBe(90);
      expect(mockParty.inventory.length).toBe(1);
      expect(mockParty.inventory[0].name).toBe('Dagger');
      expect(mockStorage.saveParty).toHaveBeenCalledWith(mockParty);
    });
  });

  describe('sellItem', () => {
    it('should return false if inventory index is invalid', async () => {
      const result = await shopSystem.sellItem(mockParty, 0);
      expect(result.success).toBe(false);
    });

    it('should return false if item is cursed', async () => {
      mockParty.inventory = [{ name: 'Cursed Ring', cursed: true, value: 100 }];
      const result = await shopSystem.sellItem(mockParty, 0);
      expect(result.success).toBe(false);
      expect(result.message).toBe('The merchant refuses to buy this cursed item!');
    });

    it('should successfully sell item and add gold', async () => {
      mockParty.inventory = [{ name: 'Short Sword', value: 50 }];
      
      const result = await shopSystem.sellItem(mockParty, 0);
      
      expect(result.success).toBe(true);
      expect(result.price).toBe(25); // 50% of 50
      expect(mockParty.gold).toBe(125);
      expect(mockParty.inventory.length).toBe(0);
      expect(mockStorage.saveParty).toHaveBeenCalledWith(mockParty);
    });
  });

  describe('identifyItem', () => {
    it('should return false if item is already identified', async () => {
      mockParty.inventory = [{ name: 'Staff', identified: true }];
      const result = await shopSystem.identifyItem(mockParty, 0);
      expect(result.success).toBe(false);
    });

    it('should calculate 10% fee (min 50) and identify item', async () => {
      // 1000G value -> 100G fee
      mockParty.gold = 200;
      mockParty.inventory = [{ name: 'Unknown Staff', apparentName: 'Stick', unidentified: true, state: 'UNIDENTIFIED', value: 1000 }];
      
      const result = await shopSystem.identifyItem(mockParty, 0);
      
      expect(result.success).toBe(true);
      expect(mockParty.gold).toBe(100); // 200 - 100
      expect(mockParty.inventory[0].identified).toBe(true);
      expect(mockParty.inventory[0].state).toBe('IDENTIFIED');
      expect(mockParty.inventory[0].apparentName).toBeUndefined();
      expect(mockStorage.saveParty).toHaveBeenCalledWith(mockParty);
    });

    it('should enforce 50G minimum fee', async () => {
      // 10G value -> 1G fee, but min is 50G
      mockParty.gold = 100;
      mockParty.inventory = [{ name: 'Unknown Ring', unidentified: true, state: 'UNIDENTIFIED', value: 10 }];
      
      const result = await shopSystem.identifyItem(mockParty, 0);
      
      expect(result.success).toBe(true);
      expect(mockParty.gold).toBe(50); // 100 - 50
    });
  });
});
