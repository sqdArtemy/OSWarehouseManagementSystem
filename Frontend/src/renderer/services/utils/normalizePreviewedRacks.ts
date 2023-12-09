import { IAddRack } from '../interfaces/rackInterface';
import { INormalizedRack } from './normalizeRacksForGrid';

export interface IPreviewedInventories {
  quantity: number;
  product_id: number;
  rack_id: number;
}

export const normalizePreviewedRacks = (
  currentGrid: INormalizedRack[],
  previewedInventories: IPreviewedInventories[],
): INormalizedRack[] => {
  for (let row of currentGrid) {
    for (let column of row) {
      const rack = previewedInventories.find((inventory) => {
        return column.rack_id === inventory.rack_id;
      });

      if (rack && rack.real_quantity > 0) {
        column.isSelected = true;
      }
    }
  }

  return currentGrid;
};
