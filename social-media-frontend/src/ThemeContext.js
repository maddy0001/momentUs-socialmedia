import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { createContext, useState, useMemo, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Define the theme based on dark mode state
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        background: {
          default: darkMode ? "#121212" : "#f5f5f5",  // Full page background color
        },
        text: {
          primary: darkMode ? "#ffffff" : "#000000",  // Text color
        },
      },
    }), 
    [darkMode]
  );

  // Apply background color to the entire <body> tag when theme changes
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#f5f5f5";
    document.body.style.color = darkMode ? "#ffffff" : "#000000";
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
