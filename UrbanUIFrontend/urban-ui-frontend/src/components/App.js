import React from 'react';
import { CssBaseline, Container, AppBar, Toolbar, Typography, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './Dashboard';
import ErrorBoundary from './ErrorBoundary';


import useMediaQuery from '@mui/material/useMediaQuery';

const App = () => {
    //const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const prefersDarkMode = true;

    
    const theme = createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      });


    

    return (
      <ThemeProvider theme={theme}>
        <div>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">UrbanUI Dashboard</Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg">
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </Container>
        </div>
      </ThemeProvider>
    );
  };
  
  export default App;
