import React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import Calendar from "./components/Calendar";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: ['"Helvetica Neue"', "Arial", "sans-serif"].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Calendar />
    </ThemeProvider>
  );
}

export default App;
