import React from 'react';
import { CssBaseline, Typography, AppBar, Toolbar, Container } from '@mui/material';
import DataFetchingComponent from './DataFetchingComponent';
import './App.css';

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            React Data Visualization
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <DataFetchingComponent />
      </Container>
    </React.Fragment>
  );
}

export default App;
