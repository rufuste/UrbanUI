import React from 'react';
import { CssBaseline, Container, AppBar, Toolbar, Typography } from '@mui/material';
import Dashboard from './Dashboard';
import ErrorBoundary from './ErrorBoundary';

const App = () => {
    return (
        <div>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">
                        UrbanUI Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg">
                <ErrorBoundary>
                    <Dashboard />
                </ErrorBoundary>
            </Container>
        </div>
    );
};

export default App;
