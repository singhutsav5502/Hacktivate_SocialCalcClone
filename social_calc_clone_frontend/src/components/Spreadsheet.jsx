import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCellValue, updateSessionData } from '../store/cellSlice';
import { evaluateFormula } from '../utils/formulaEvaluator';
import io from 'socket.io-client';

const Spreadsheet = ({ sessionId }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.cells.cells);
  const computedValues = useSelector((state) => state.cells.computedValues);

  useEffect(() => {
    // Initialize the socket connection when the component mounts
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join the session
    newSocket.emit('joinSession', sessionId);

    // Listen for updates
    newSocket.on('sessionDataUpdated', ({ cellId, newValue, computedValue }) => {
      dispatch(setCellValue({ cellId, value: newValue, computedValue }));
    });

    // Clean up when the component unmounts
    return () => {
      newSocket.off('sessionDataUpdated');
      newSocket.disconnect();
    };
  }, [sessionId, dispatch]);

  const handleCellChange = (event) => {
    const cellId = event.target.id;
    const newValue = event.target.value; // New value or formula
    const oldValue = cells[cellId] || ''; // Previous value

    // Check if the new value is a formula (starts with "=")
    const isFormula = newValue.startsWith('=');
    const computedValue = isFormula ? evaluateFormula(newValue.slice(1), cells) : newValue;

    // Dispatch local update
    dispatch(setCellValue({ cellId, value: newValue, computedValue }));

    // Dispatch async action to update session data on the server
    dispatch(updateSessionData({ sessionId, cellId, newValue, oldValue }));
  };

  return (
    <div>
      <table>
        <tbody>
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 10 }).map((_, colIndex) => {
                const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                return (
                  <td key={cellId}>
                    <input
                      id={cellId}
                      type="text"
                      value={cells[cellId] || ''}
                      onChange={handleCellChange}
                    />
                    <div>{computedValues[cellId] || ''}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;
