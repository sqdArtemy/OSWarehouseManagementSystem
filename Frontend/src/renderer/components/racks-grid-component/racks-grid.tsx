import React from 'react';
import './racks-grid.scss';

export default function RacksGrid() {
  const rows = Array.from({ length: 10 }, (_, rowIndex) => (
    <div className="grid-row" key={`row-${rowIndex}`}>
      {Array.from({ length: 10 }, (_, cellIndex) => (
        <div className="grid-cell" key={`cell-${rowIndex}-${cellIndex}`} />
      ))}
    </div>
  ));

  return <div className={'grid-container'}>{rows}</div>;
}
