import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { TextField, Button, Typography, Box } from "@mui/material";
import CardComponent from "./CardComponent";
import styles from "./Login.module.css";
import { toast } from "react-toastify";
const Login = () => {
  const [username, setUsernameInput] = useState("");
  const [email, setEmailInput] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const handleLogin = () => {
    if (!username || !email) {
      toast.error("Please enter both username and email.");
      return;
    }
    const isUsernameValid = usernameRef.current.reportValidity();
    const isEmailValid = emailRef.current.reportValidity();
    if (isEmailValid && isUsernameValid) {
      // Store user details in Redux
      dispatch(setUser({ username, email }));

      // Redirect to the session menu
      navigate("/session/options");
    }
    else{
      toast.error("Please input valid details")
    }
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
              inputRef={usernameRef}
              fullWidth
              required
            />
            <TextField
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              inputRef={emailRef}
              fullWidth
              required
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
