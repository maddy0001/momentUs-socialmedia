import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Button, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useThemeContext } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const { darkMode, setDarkMode } = useThemeContext();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async () => {
    try {
      await axios.post("http://localhost:5000/change-password", {
        user_id: userId,
        currentPassword,
        newPassword,
      });
      alert("Password Changed Successfully");
      setOpen(false);
    } catch (error) {
      alert(error.response.data);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ paddingX: 2 }}>
      <Toolbar>
  {/* App Name */}
  <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }} >
    MomentUs
  </Typography>
 
  


          {/* Dark Mode Toggle */}
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />

          {userName && (
            <>
              {/* User Name with Profile Icon */}
              <Typography variant="body1" sx={{ marginX: 2, display: "flex", alignItems: "center" }}>
                <AccountCircleIcon sx={{ marginRight: 1 }} /> {userName}
              </Typography>

              {/* Change Password Button */}
              <IconButton color="inherit" onClick={() => setOpen(true)}>
                <LockIcon />
              </IconButton>

              {/* Logout Button */}
              <IconButton color="inherit" onClick={() => { localStorage.clear(); navigate("/"); }}>
                <ExitToAppIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Change Password Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleChangePassword} color="primary" variant="contained">Change</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
