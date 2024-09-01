import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { TextField, Button, Typography, Box } from "@mui/material";
import CardComponent from "./CardComponent";
import styles from "./Login.module.css";

const Login = () => {
  const [username, setUsernameInput] = useState("");
  const [email, setEmailInput] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !email) {
      alert("Please enter both username and email.");
      return;
    }

    // Store user details in Redux
    dispatch(setUser({ username, email }));

    // Redirect to the session menu
    navigate("/session/options");
  };

  return (
    <div className={styles.movingGradient}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CardComponent>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Typography variant="h4">Login</Typography>
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              sx={{ width: "100%" }}
            >
              Login
            </Button>
          </Box>
        </CardComponent>
      </Box>
    </div>
  );
};

export default Login;
