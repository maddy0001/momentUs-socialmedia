import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Card, CardContent, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../ThemeContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { darkMode } = useThemeContext();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/register", { name, email, password });
      alert("Registration successful! Please log in.");
      navigate("/");
    } catch (error) {
      alert("Error: " + error.response.data);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Grid container spacing={2} alignItems="center">
        {/* Left Side - Marketing Content */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: darkMode ? "white" : "primary.main" }}>
            Join Our Community!
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? "#ddd" : "#555", marginBottom: 2 }}>
            Share your thoughts, engage with content, and build new connections on our social media platform.
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? "#ddd" : "#555", marginBottom: 4 }}>
            Be part of an exclusive digital space where your voice matters.
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate("/")}>
            Already Have an Account?
          </Button>
        </Grid>

        {/* Right Side - Registration Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 4, backgroundColor: darkMode ? "#333" : "#fff" }}>
            <CardContent>
              <Typography variant="h4" textAlign="center" fontWeight="bold" color="primary">
                Register
              </Typography>
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{ sx: { color: darkMode ? "white" : "black" } }}
              />
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
              <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }} onClick={handleRegister}>
                Register
              </Button>
              <Typography variant="body2" textAlign="center" sx={{ marginTop: 2 }}>
                Already have an account?{" "}
                <Button onClick={() => navigate("/")} sx={{ textTransform: "none" }}>
                  Login
                </Button>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register;
