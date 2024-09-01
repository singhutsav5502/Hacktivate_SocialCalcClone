import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSessionId } from "../store/sessionSlice";
import { setUser, setUsername, setEmail } from "../store/userSlice";
import {
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Collapse,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CardComponent from "./CardComponent";
import axios from "axios";
import styles from "./SessionMenu.module.css";
import io from "socket.io-client";

const SessionMenu = () => {
  const [socket, setSocket] = useState(null);
  const [sessionInput, setSessionInput] = useState("");
  const [userSessions, setUserSessions] = useState([]);
  const { username, email, userId } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false); // State to control the collapse

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleToggle = () => {
    setOpen(!open);
  };
  useEffect(() => {
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

    return () => {
      newSocket.disconnect();
    };
  }, [username, email, dispatch]);

  useEffect(() => {
    const fetchUserSessions = async () => {
      if (username && email) {
        try {
          const response = await axios.post(
            "http://localhost:5000/api/session/getSessions",
            { username, email }
          );
          setUserSessions(response.data.sessions.reverse());
        } catch (error) {
          console.error("Error fetching user sessions:", error);
        }
      }
    };

    fetchUserSessions();
  }, [username, email]);

  const handleCreateSession = async () => {
    if (!username || !email) {
      alert("Please enter both username and email.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/session/create",
        { username, email }
      );
      const { sessionId } = response.data;
      dispatch(setSessionId(sessionId));
      navigate(`/session/${userId}/${sessionId}`); // Navigate to the new session
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create a new session. Please try again.");
    }
  };

  const handleJoinSession = async () => {
    if (!sessionInput || !username || !email) {
      alert("Please enter session ID, username, and email.");
      return;
    }

    dispatch(setSessionId(sessionInput));
    navigate(`/session/${userId}/${sessionInput}`); // Navigate to the joined session
  };
  const handleJoin = (sessionId) => {
    // Navigate to the spreadsheet with the sessionId
    navigate(`/session/${userId}/${sessionId}`);
  };

  return (
    <div className={styles.movingGradient}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flexDirection: "column",
          height: "100vh",
          gap: "1rem",
        }}
      >
        <CardComponent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "25vh",
              width: "30vw",
            }}
          >
            <IconButton
              color="secondary"
              sx={{
                backgroundColor: "black",
                borderRadius: "50%",
                padding: "10px",
                "&:hover": {
                  backgroundColor: "black",
                },
              }}
            >
              <PeopleIcon />
            </IconButton>
            <Typography
              variant="h5"
              style={{ fontWeight: 800, marginTop: "1rem" }}
            >
              Join or Create a Session
            </Typography>
          </div>

          <TextField
            label="Enter Session ID"
            variant="outlined"
            fullWidth
            value={sessionInput}
            onChange={(e) => setSessionInput(e.target.value)}
            sx={{ marginBottom: "1rem", marginTop: "3rem" }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCreateSession}
              sx={{ flex: "1" }}
            >
              Create New Session
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleJoinSession}
              sx={{ flex: "1" }}
            >
              Join Session
            </Button>
          </Box>
        </CardComponent>

        {/* Display owned sessions */}
        <Box sx={{ position: "absolute", backgroundColor:'white', bottom:'0', left:'0', right:'0' }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: "center",marginTop:'2vh' }}>
            Your Sessions
          </Typography>
          <IconButton
            onClick={handleToggle}
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            {!open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Collapse in={open}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "space-evenly",
              }}
            >
              {userSessions.length > 0 ? (
                <>
                  {userSessions.map((session) => (
                    <CardComponent key={session.sessionId}>
                      <Typography>
                        <strong>Session ID:</strong> {session.sessionId}
                        <br />
                        <strong>Created At:</strong>{" "}
                        {new Date(session.createdAt).toLocaleString()}
                        <br />
                        <strong>Users:</strong> {session.users.join(", ")}
                      </Typography>
                      <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleJoin(session.sessionId)}
                    sx={{ marginTop: 2 }}
                  >
                    Join
                  </Button>
                    </CardComponent>
                  ))}
                </>
              ) : (
                <Typography>No sessions available</Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>
    </div>
  );
};

export default SessionMenu;
