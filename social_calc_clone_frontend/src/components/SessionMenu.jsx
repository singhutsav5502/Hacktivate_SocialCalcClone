import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setSessionId, setSessionData } from "../store/sessionSlice";
import { Typography, Button, TextField, Box, IconButton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CardComponent from "./CardComponent";
import axios from "axios";
import styles from "./SessionMenu.module.css";
const SessionMenu = () => {
  const [sessionInput, setSessionInput] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();

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
      alert(`New session created with ID: ${sessionId}`);
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

    try {
      const response = await axios.get(
        `http://localhost:5000/api/session/join/${sessionInput}`,
        { params: { username, email } } // Correct use of params
      );
      const { sessionId, sessionData } = response.data;
      dispatch(setSessionId(sessionId));
      dispatch(setSessionData(sessionData));
      alert(`Joined session with ID: ${sessionId}`);
    } catch (error) {
      console.error("Error joining session:", error);
      alert(
        "Failed to join session. Please check the session ID and try again."
      );
    }
  };

  return (
    <div
      className={styles.movingGradient}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <CardComponent>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              marginBottom: "1rem",
              marginTop: "3rem",
              width: "100%",
            }}
          >
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <TextField
            label="Enter Session ID"
            variant="outlined"
            fullWidth
            value={sessionInput}
            onChange={(e) => setSessionInput(e.target.value)}
          />
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap:'1rem',
              marginTop:'1rem'
            }}
          >
            <Button variant="outlined" onClick={handleCreateSession}
            sx={{flex:'1'}}>
              Create New Session
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleJoinSession}
              sx={{flex:'1'}}
            >
              Join Session
            </Button>
          </Box>
        </div>
      </CardComponent>
    </div>
  );
};

export default SessionMenu;
