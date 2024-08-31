import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice";
import io from "socket.io-client";
import "./Spreadsheet.css";
import Toolbar from "./Toolbar";

const Spreadsheet = ({ sessionId, userId }) => {
  const [socket, setSocket] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [focusedUser, setFocusedUser] = useState(null);
  const [cells, setCells] = useState({}); // Local state for cells
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false); // Flag for remote updates
  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.username);
  const email = useSelector((state) => state.user.email);

  useEffect(() => {
    if (!sessionId || !username || !email) return; // Exit early if sessionId, username, or email are not available

    // Initialize the socket connection
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    newSocket.emit("createUser", { username, email });

    // Handle the response
    newSocket.on("userCreated", (data) => {
      dispatch(setUser(data));
      alert(`User created: ${data.username}`);
    });

    // Handle errors
    newSocket.on("error", (message) => {
      alert(message);
    });

    // Join the session
    newSocket.emit("joinSession", { sessionId, userId });

    newSocket.on("sessionData", (data) => {
      console.log("Received sessionData:", data);
      console.log(typeof data.sessionData);
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
    // Handle the received session data
    newSocket.on("sessionDataUpdated", ({ sessionData, senderId }) => {
      if (senderId !== userId) { // Ignore updates from the current user
        if (Array.isArray(sessionData)) {
          // Convert the array of entries back into an object
          const updatedSessionData = sessionData.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

          // Set the flag to indicate a remote update
          setIsRemoteUpdate(true);
          // Update the cells state with the new data
          setCells((prevCells) => ({
            ...prevCells,
            ...updatedSessionData,
          }));
        } else {
          console.error(
            "Received sessionData is not in the expected array format"
          );
        }
      }
    });

    // Listen for cell focus events
    newSocket.on("cellFocused", ({ cellId, username }) => {
      setFocusedCell(cellId);
      setFocusedUser(username);
    });

    // Listen for cell unfocus events
    newSocket.on("cellUnfocused", ({ cellId }) => {
      if (focusedCell === cellId) {
        setFocusedCell(null);
        setFocusedUser(null);
      }
    });

    // Clean up when the component unmounts
    return () => {
      newSocket.off("sessionDataUpdated");
      newSocket.off("cellFocused");
      newSocket.off("cellUnfocused");
      newSocket.disconnect();
    };
  }, [sessionId, username, email, userId]);

  const handleCellChange = async (event) => {
    const senderId = userId;
    const cellId = event.target.id;
    const newValue = event.target.value; // New value or formula

    // Update local state
    setCells((prevCells) => ({
      ...prevCells,
      [cellId]: newValue,
    }));

    // Only send the update to the server if it's a local change
    if (!isRemoteUpdate) {
      try {
        console.log(cells);
        await fetch(`http://localhost:5000/api/session/update/${sessionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionData: Object.entries(cells), senderId: senderId }),
        });

        // Optionally, handle any local updates or dispatches if needed
      } catch (error) {
        console.error("Error updating session data:", error);
      }
    } else {
      // Reset the flag after handling the remote update
      setIsRemoteUpdate(false);
    }
  };

  const handleFocus = (event) => {
    const cellId = event.target.id;
    socket.emit("focusCell", { sessionId, cellId, username });
  };

  const handleBlur = (event) => {
    const cellId = event.target.id;
    socket.emit("unfocusCell", { sessionId, cellId, username });
  };

  const addRow = () => {
    socket.emit("addRow", { sessionId });
  };

  const addColumn = () => {
    socket.emit("addColumn", { sessionId });
  };

  return (
    <div>
      <Toolbar addRow={addRow} addColumn={addColumn} />
      <table>
        <tbody>
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 10 }).map((_, colIndex) => {
                const cellId = `${String.fromCharCode(65 + colIndex)}${
                  rowIndex + 1
                }`;
                return (
                  <td key={cellId}>
                    <input
                      id={cellId}
                      type="text"
                      value={cells[cellId] || ""}
                      onChange={handleCellChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      className={focusedCell === cellId ? "highlight" : ""}
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