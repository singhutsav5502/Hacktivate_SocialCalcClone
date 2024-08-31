import React from 'react';
import './Toolbar.css';

const Toolbar = ({ addRow, addColumn }) => {
  return (
    <div className="toolbar">
      <button onClick={addRow} className="toolbar-button">Add Row</button>
      <button onClick={addColumn} className="toolbar-button">Add Column</button>
    </div>
  );
};

export default Toolbar;