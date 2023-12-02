import React from 'react';
import './racks-grid.scss';

export default function RacksGrid({ gridData, handleCellClick }) {
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
  const numColumns = gridData.length > 0 ? gridData[0].length : 0;
  const numRows = gridData.length;

  const renderGrid = () => {
    return gridData.map((row, rowIndex) => (
      <div className="grid-row" key={`row-${rowIndex}`}>
        {row.map((cell, cellIndex) => (
          <div
            className={'grid-cell'}
            key={`cell-${rowIndex}-${cellIndex}`}
            onClick={handleCellClick ? () => handleCellClick(cell) : null}
          >
            {/*{cell.position.slice(1, cell.position.length)}*/}
          </div>
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
