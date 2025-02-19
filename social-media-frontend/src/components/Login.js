import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Card, CardContent, Grid, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../ThemeContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { darkMode } = useThemeContext();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userName", res.data.name);
      navigate("/feed");
    } catch (error) {
      alert("Invalid credentials!");
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Grid container spacing={2} alignItems="center">
        {/* Left Side - Marketing Content */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: darkMode ? "white" : "primary.main" }}>
            Welcome Back!
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? "#ddd" : "#555", marginBottom: 2 }}>
            Connect with friends, share moments, and explore content from around the world.  
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? "#ddd" : "#555", marginBottom: 4 }}>
            Join thousands of users and experience real-time interactions.
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate("/register")}>
            Join the Community
          </Button>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 4, backgroundColor: darkMode ? "#333" : "#fff" }}>
            <CardContent>
              <Typography variant="h4" textAlign="center" fontWeight="bold" color="primary">
                Login
              </Typography>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ sx: { color: darkMode ? "white" : "black" } }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{ sx: { color: darkMode ? "white" : "black" } }}
              />
              <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }} onClick={handleLogin}>
                Login
              </Button>
              <Typography variant="body2" textAlign="center" sx={{ marginTop: 2 }}>
                Don't have an account?{" "}
                <Button onClick={() => navigate("/register")} sx={{ textTransform: "none" }}>
                  Register
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
