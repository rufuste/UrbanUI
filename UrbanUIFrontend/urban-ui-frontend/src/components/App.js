import React, { useState } from 'react';
import { CssBaseline, Container, AppBar, Toolbar, Typography, ThemeProvider, createTheme, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import Dashboard from './Dashboard';
import ErrorBoundary from './ErrorBoundary';
import useMediaQuery from '@mui/material/useMediaQuery';
import TimescaleDropdown from './TimescaleDropdown'; // Import TimescaleDropdown

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [timescale, setTimescale] = useState(1); // State for timescale

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleSidebarToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            UrbanUI Dashboard
          </Typography>
          <TimescaleDropdown timescale={timescale} setTimescale={setTimescale} sx={{ flexGrow: 0 }} /> {/* Add TimescaleDropdown here */}
          <IconButton edge="end" color="inherit" onClick={handleThemeToggle}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <ErrorBoundary>
          <Dashboard isSidebarOpen={isSidebarOpen} handleSidebarToggle={handleSidebarToggle} timescale={timescale} />
        </ErrorBoundary>
      </Container>
    </ThemeProvider>
  );
};

export default App;
