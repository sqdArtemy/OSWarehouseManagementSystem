import React, { useEffect, useState } from 'react';
import './racks-grid.scss';
import { Tooltip } from 'antd';

export default function RacksGrid({ externalGridData, handleCellClick }) {
  // gridData = [
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  //   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  // ];
  const [gridData, setGridData] = useState([]);
  const [numColumns, setNumColumns] = useState(0);
  const [numRows, setNumRows] = useState(0);
  useEffect(() => {
    setGridData(externalGridData);
    setNumColumns(gridData.length > 0 ? gridData[0].length : 0);
    setNumRows(gridData.length);
  }, [externalGridData]);

  const renderGrid = () => {
    return gridData.map((row, rowIndex) => (
      <div className="grid-row" key={`row-${rowIndex}`}>
        {row.map((cell, cellIndex) => (
          <Tooltip
            placement={'topLeft'}
            title={`${cell.isSelected ? 'Selected Rack' : ''}`}
          >
            <div
              className={`grid-cell ${
                cell.isFull ? 'full' : !cell.isEmpty ? 'nonempty' : ''
              } ${cell.isHidden ? 'hidden' : ''} ${
                cell.isSelected ? 'selected' : ''
              }`}
              key={`cell-${rowIndex}-${cellIndex}`}
              onClick={handleCellClick ? () => handleCellClick(cell) : null}
            ></div>
          </Tooltip>
        ))}
      </div>
    ));
  };

  return (
    <div
      className={'grid-container'}
      style={{
        gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
      }}
    >
      {renderGrid()}
    </div>
  );
}
