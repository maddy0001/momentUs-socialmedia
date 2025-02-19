import React from "react";
import { Typography, Box } from "@mui/material";
import { useThemeContext } from "../ThemeContext";

const Footer = () => {
  const { darkMode } = useThemeContext(); // Access dark mode state

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: 2,
        bgcolor: darkMode ? "background.paper" : "primary.main", // Dynamic background color
        color: darkMode ? "text.primary" : "white", // Dynamic text color
        marginTop: 3,
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        boxShadow: darkMode ? "0px -2px 10px rgba(255,255,255,0.1)" : "0px -2px 10px rgba(0,0,0,0.2)", // Subtle shadow
      }}
    >
      <Typography variant="body2" fontWeight="bold">
        © {new Date().getFullYear()} MomentUS Social Media App | All Rights Reserved
      </Typography>
    </Box>
  );
};

export default Footer;
