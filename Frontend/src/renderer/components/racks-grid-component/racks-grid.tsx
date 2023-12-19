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
    console.log('gridData', externalGridData);
  }, [externalGridData]);
  const mapColor = {
    grey: '',
    green: '#32cd32',
    red: '#f5222d',
    blue: '#1890ff',
    yellow: '#fadb14',
    orange: '#fa8c16',
    swamp: '#828c51',
  };
  const renderGrid = () => {
    return gridData.map((row, rowIndex) => (
      <div className="grid-row" key={`row-${rowIndex}`}>
        {row.map((cell, cellIndex) => (
          <Tooltip
            placement={'topLeft'}
            title={`
                  ${cell.color === 'blue' ? 'Selected Rack' : ''}
                  ${cell.color === 'grey' ? 'Empty Rack' : ''}
                  ${cell.color === 'green' ? 'Occupied: 1 - 33%' : ''}
                  ${cell.color === 'yellow' ? 'Occupied: 33 - 66%' : ''}
                  ${cell.color === 'orange' ? 'Occupied: 66 - 99%' : ''}
                  ${cell.color === 'red' ? 'Fully Occupied' : ''}
                  ${cell.color === 'swamp' ? 'With Expired Item' : ''}
            `}
          >
            <div
              className={`grid-cell  ${cell.isHidden ? 'hidden' : ''} }`}
              key={`cell-${rowIndex}-${cellIndex}`}
              onClick={handleCellClick ? () => handleCellClick(cell) : null}
              style={{
                backgroundColor: mapColor[cell.color],
              }}
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
