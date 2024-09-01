import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import "./Spreadsheet.css";
import Toolbar from "./Toolbar";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { evaluate } from "mathjs";

const Spreadsheet = () => {
  const [socket, setSocket] = useState(null);
  const [focusedCells, setFocusedCells] = useState([]);
  const [cells, setCells] = useState({}); // Local state for cells
  const [rows, setRows] = useState(52);
  const [columns, setColumns] = useState(52);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false); // Flag for remote updates
  const username = useSelector((state) => state.user.username);
  const email = useSelector((state) => state.user.email);
  const { sessionId, userId } = useParams();
  const navigate = useNavigate();

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // CSV
  const convertToCSV = (data, rows, columns) => {
    const body = Array.from({ length: rows }, (_, rowIndex) => {
      return Array.from({ length: columns }, (_, colIndex) => {
        const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
        return `"${(data[cellId] || "").replace(/"/g, '""')}"`; // Escape double quotes
      }).join(",");
    }).join("\n");

    return body;
  };

  const exportToCSV = () => {
    const csv = convertToCSV(cells, rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "spreadsheet.csv"); // File name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      let maxCols = 52;
      const text = e.target.result;
      const rowsArray = text.split("\n");
      const newCells = {};
      rowsArray.forEach((row, rowIndex) => {
        const columns = row.split(",");
        maxCols = Math.max(maxCols, columns.length);

        columns.forEach((col, colIndex) => {
          const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
          newCells[cellId] = col.replace(/(^"|"$)/g, "").replace(/""/g, '"'); // Unescape double quotes
        });
      });

      setCells(newCells);
      setColumns((state) => Math.max(state, columns));
      setRows((state) => Math.max(state, rows.length));

      // Send updates to the server for each cell individually
      try {
        await fetch(
          `${process.env.REACT_APP_SERVER_URL}api/session/update/${sessionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionData: Object.entries(newCells),
              senderId: userId,
              rows: Math.max(rows, rowsArray.length),
              columns: Math.max(columns, maxCols),
            }),
          }
        );
      } catch (error) {
        console.error("Error updating session data:", error);
      }
    };
    reader.readAsText(file);
  };

  // Formula Evaluation
  const evaluateFormula = (formula, cells) => {
    try {
      // Replace cell references with their values
      const expression = formula
        .replace(/([A-Z]+\d+)/g, (match) => {
          return cells[match] || 0; // Default to 0 if the cell value is not available
        })
        .replace("=", ""); // Remove '=' at the beginning of the formula

      // Evaluate the expression
      return evaluate(expression); // Use eval to compute the result
    } catch (error) {
      console.error("Error evaluating formula:", error);
      return 0; // Return Empty
    }
  };

  useEffect(() => {
    if (!sessionId || !username || !email) {
      toast.error("Missing user or session data please try again");
      navigate("/login");
      return;
    }

    // Initialize the socket connection
    const newSocket = io(`${process.env.REACT_APP_SERVER_URL}`);
    setSocket(newSocket);
    // Handle errors
    newSocket.on("error", (message) => {
      toast.error(message);
    });

    // Join the session
    newSocket.emit("joinSession", { sessionId, userId, username, email });

    newSocket.on("sessionData", (data) => {
      console.log("Received sessionData:", data);
      if (Array.isArray(data.sessionData)) {
        // If sessionData is an array, format it into an object
        const formattedSessionData = data.sessionData.reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {}
        );

        // Update local state with the received session data
        setCells(formattedSessionData);
        setRows((state) => data.rows);
        setColumns((state) => data.columns);
      } else if (
        typeof data.sessionData === "object" &&
        data.sessionData !== null
      ) {
        // If sessionData is already an object with string keys and string values
        setCells(data.sessionData);
      } else {
        console.error("Received sessionData is not in the expected format");
      }
    });

    // Listen for session data updates
    newSocket.on(
      "sessionDataUpdated",
      ({ sessionData, rows, columns, senderId }) => {
        console.log(rows, columns, sessionData);
        if (senderId !== userId) {
          // Ignore updates from the current user
          if (Array.isArray(sessionData)) {
            // Convert the array of entries back into an object
            const updatedSessionData = sessionData.reduce(
              (acc, [key, value]) => {
                acc[key] = value;
                return acc;
              },
              {}
            );

            // Set the flag to indicate a remote update
            setIsRemoteUpdate(true);
            // Update the cells state with the new data
            setCells((prevCells) => ({
              ...prevCells,
              ...updatedSessionData,
            }));
            setRows((state) => rows);
            setColumns((state) => columns);
          } else {
            console.error(
              "Received sessionData is not in the expected array format"
            );
          }
        }
      }
    );

    newSocket.on("cellFocused", ({ cellId, username }) => {
      setFocusedCells((prev) => [...prev, { cellId, username }]);
    });

    newSocket.on("cellUnfocused", ({ cellId, username }) => {
      setFocusedCells((prev) =>
        prev.filter(
          (cell) => !(cell.cellId === cellId && cell.username === username)
        )
      );
    });

    // Clean up when the component unmounts
    return () => {
      newSocket.off("sessionData");
      newSocket.off("cellFocused");
      newSocket.off("cellUnfocused");
      newSocket.disconnect();
    };
  }, [sessionId, username, email, userId]);


  const updateServer = async (updatedCells) => {
    try {
      await fetch(
        `${process.env.REACT_APP_SERVER_URL}api/session/update/${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionData: Object.entries(updatedCells),
            senderId: userId,
            rows: rows,
            columns: columns,
          }),
        }
      );
    } catch (error) {
      console.error("Error updating session data:", error);
    }
  };

  const debouncedUpdateServer = useCallback(debounce(updateServer, 300), [rows, columns, userId, sessionId]);


  const handleCellChange = async (event) => {
    const cellId = event.target.id;
    const newValue = event.target.value; // New value or formula
    setCells((prevCells) => {
      const updatedCells = {
        ...prevCells,
        [cellId]: newValue,
      };
  
      if (!isRemoteUpdate) {
        debouncedUpdateServer(updatedCells);
      } else {
        setIsRemoteUpdate(false);
      }
  
      return updatedCells;
    });
  };

  const handleFocus = (event) => {
    const cellId = event.target.id;
    socket.emit("focusCell", { sessionId, cellId, username });
  };

  const handleBlur = async (event) => {
    const cellId = event.target.id;
    let newValue = event.target.value; // Get the current value

    // If the value starts with '=', evaluate it as a formula
    if (newValue.startsWith("=")) {
      newValue = evaluateFormula(newValue, cells);

      // Update local state with the evaluated value
      setCells((prevCells) => ({
        ...prevCells,
        [cellId]: newValue,
      }));
      // Only send the update to the server if it's a local change
      if (!isRemoteUpdate) {
        try {
          const updatedCells = {
            ...cells,
            [cellId]: newValue,
          };
          await fetch(
            `${process.env.REACT_APP_SERVER_URL}api/session/update/${sessionId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionData: Object.entries(updatedCells),
                senderId: userId,
                rows: rows,
                columns: columns,
              }),
            }
          );
        } catch (error) {
          console.error("Error updating session data:", error);
        }
      } else {
        // Reset the flag after handling the remote update
        setIsRemoteUpdate(false);
      }
    }
    socket.emit("unfocusCell", { sessionId, cellId, username });
  };

  const addRow = () => {
    socket.emit("addRow", { sessionId, userId });
  };

  const addColumn = () => {
    socket.emit("addColumn", { sessionId, userId });
  };

  const getColumnLabel = (index) => {
    let label = "";
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  return (
    <div>
      <Toolbar
        addRow={addRow}
        addColumn={addColumn}
        sessionId={sessionId}
        exportToCSV={exportToCSV}
        importFromCSV={importFromCSV} // Pass the import function to Toolbar
      />
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th></th> {/* Empty cell for the corner */}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th key={`col-${colIndex}`} className="header">
                  {getColumnLabel(colIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <th className="header">{rowIndex + 1}</th>
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
                  const focusedCell = focusedCells.find(cell => cell.cellId === cellId);
                  return (
                    <td key={cellId}>
                      <input
                        id={cellId}
                        type="text"
                        value={cells[cellId] || ""}
                        onChange={handleCellChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={focusedCell ? "highlight" : ""}
                      />
                      {focusedCell && (
                        <label className="focused-user">{focusedCell.username}</label>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Spreadsheet;
