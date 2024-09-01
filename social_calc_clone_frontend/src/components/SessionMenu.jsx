import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSessionId } from "../store/sessionSlice";
import { setUser } from "../store/userSlice";
import {
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CardComponent from "./CardComponent";
import axios from "axios";
import styles from "./SessionMenu.module.css";
import io from "socket.io-client";
import { toast } from "react-toastify";

const SessionMenu = () => {
  const [socket, setSocket] = useState(null);
  const [sessionInput, setSessionInput] = useState("");
  const [userSessions, setUserSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false); // State to control the modal
  const { username, email, userId } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleToggleModal = () => {
    setOpenModal(!openModal);
  };

  useEffect(() => {
    if (!username || !email) {
      toast.error("Missing user or session data. Please try again.");
      navigate("/login");
      return;
    }

    const newSocket = io(`${process.env.REACT_APP_SERVER_URL}`);
    setSocket(newSocket);
    newSocket.emit("createUser", { username, email });

    newSocket.on("userCreated", (data) => {
      dispatch(setUser(data));
      toast(`User created: ${data.username}`);
    });

    newSocket.on("error", (message) => {
      toast.error(message);
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
            `${process.env.REACT_APP_SERVER_URL}/api/session/getSessions`,
            { username, email }
          );
          setUserSessions(response.data.sessions.reverse());
          console.log(response.data.sessions);
        } catch (error) {
          console.error("Error fetching user sessions:", error);
        }
      }
    };

    fetchUserSessions();
  }, [username, email]);

  const handleCreateSession = async () => {
    if (!username || !email) {
      toast.error("Please enter both username and email.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/session/create`,
        { username, email }
      );
      const { sessionId } = response.data;
      dispatch(setSessionId(sessionId));
      navigate(`/session/${userId}/${sessionId}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create a new session. Please try again.");
    }
  };

  const handleJoinSession = async () => {
    if (!sessionInput || !username || !email) {
      toast.error("Please enter session ID, username, and email.");
      return;
    }

    dispatch(setSessionId(sessionInput));
    navigate(`/session/${userId}/${sessionInput}`);
  };

  const handleJoin = (sessionId) => {
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
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box sx={{ flex: "1", display: "flex", gap: "1rem" }}>
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleToggleModal}
              sx={{ marginTop: 2 }}
            >
              Rejoin Session
            </Button>
          </Box>
        </CardComponent>

        {/* Modal for owned sessions */}
        <Dialog open={openModal} onClose={handleToggleModal} fullWidth>
          <DialogTitle>Your Sessions</DialogTitle>
          <DialogContent>
            <List>
              {userSessions.length > 0 ? (
                userSessions.map((session) => (
                  <ListItem
                    button
                    key={session.sessionId}
                    onClick={() => handleJoin(session.sessionId)}
                  >
                    <ListItemText
                      primary={`Session ID: ${session.sessionId}`}
                      secondary={`Created At: ${new Date(
                        session.createdAt
                      ).toLocaleString()} | Users: ${session.users.join(", ")}`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography>No sessions available</Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleToggleModal}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default SessionMenu;
