import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCellValue, updateSessionData } from '../store/cellSlice';
import { setUser } from '../store/userSlice';
import { evaluateFormula } from '../utils/formulaEvaluator';
import io from 'socket.io-client';
import './Spreadsheet.css'; 
import Toolbar from './Toolbar'; // Import the Toolbar component

const Spreadsheet = ({ sessionId, userId }) => {
  const [socket, setSocket] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [focusedUser, setFocusedUser] = useState(null);
  const dispatch = useDispatch();
  const cells = useSelector((state) => state.cells.cells);
  const username = useSelector((state) => state.user.username);
  const email = useSelector((state) => state.user.email);
  const computedValues = useSelector((state) => state.cells.computedValues);

  useEffect(() => {
    if (!sessionId) return; // Exit early if sessionId is not available

    // Initialize the socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    newSocket.emit('createUser', { username, email });

    // Handle the response
    newSocket.on('userCreated', (data) => {
      dispatch(setUser(data));
      alert(`User created: ${data.username}`);
    });

    // Handle errors
    newSocket.on('error', (message) => {
      alert(message);
    });

    // Join the session
    newSocket.emit('joinSession', { sessionId, userId });

    // Listen for updates
    newSocket.on('sessionDataUpdated', ({ cellId, newValue, computedValue }) => {
      dispatch(setCellValue({ cellId, value: newValue, computedValue }));
    });

    // Listen for cell focus events
    newSocket.on('cellFocused', ({ cellId, username }) => {
      setFocusedCell(cellId);
      setFocusedUser(username);
    });

    // Listen for cell unfocus events
    newSocket.on('cellUnfocused', ({ cellId }) => {
      if (focusedCell === cellId) {
        setFocusedCell(null);
        setFocusedUser(null);
      }
    });

    // Clean up when the component unmounts
    return () => {
      newSocket.off('sessionDataUpdated');
      newSocket.off('cellFocused');
      newSocket.off('cellUnfocused');
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

  const handleFocus = (event) => {
    const cellId = event.target.id;
    socket.emit('focusCell', { sessionId, cellId, username });
  };

  const handleBlur = (event) => {
    const cellId = event.target.id;
    socket.emit('unfocusCell', { sessionId, cellId, username });
  };

  const addRow = () => {
    socket.emit('addRow', { sessionId });
  };

  const addColumn = () => {
    socket.emit('addColumn', { sessionId });
  };

  return (
    <div>
      <Toolbar
        onSave={addRow}
        onLoad={addColumn}
      />
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
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={focusedCell === cellId ? 'highlight' : ''}
                    />
                    {focusedCell === cellId && focusedUser && (
                      <label className="focused-user">{focusedUser}</label>
                    )}
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