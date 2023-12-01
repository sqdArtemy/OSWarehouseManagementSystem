import { IAddRack } from '../interfaces/rackInterface';

export const normalizeRacksForGrid = (racks: IAddRack[]) => {
  const sortedRacks = racks.sort((a, b) => {
    return a.rack_position.localeCompare(b.rack_position);
  })

  let maxColumns = 0;
  let maxRows = 0;

  if(racks.length) {
    const lastRack = sortedRacks[sortedRacks.length - 1]?.rack_position;
    const firstLetter = lastRack[0];

    const difference = firstLetter.toUpperCase().charCodeAt(0) - 65 + 1;
    if(difference > maxRows) maxRows = difference;
  }

  for (let rack of sortedRacks){
    let rackPositionColumn = Number(rack.rack_position.slice(1, rack.rack_position.length));
    if(rackPositionColumn && rackPositionColumn > maxColumns){
      maxColumns = rackPositionColumn;
    }
  }

  const finalGrid = [];
  for (let i =0; i < maxRows; i++){
    finalGrid.push([]);
    for (let j =0; j <= maxColumns; j++) {

      const position = String.fromCharCode(i + 65) + String(j);
      finalGrid[i].push({
        position,
        isHidden: true,
        isFull: false,
        isEmpty: true,
        rack_id: null
      })
    }
  }

  for (let row of finalGrid){
    for (let column of row){
      const existingRack = sortedRacks.find(rack => {
        return rack.rack_position === column.position
      })

      if(existingRack){
        column.isHidden = false;
        column.rack_id = existingRack.rack_id;
        if(existingRack.overall_capacity === existingRack.overall_capacity){
          column.isEmpty = true;
        }
        if(existingRack.remaining_capacity === 0){
          column.isFull = true;
        }
      }
    }
  }

  return finalGrid;
}