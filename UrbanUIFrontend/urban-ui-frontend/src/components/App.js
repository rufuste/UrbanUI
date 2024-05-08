import React from 'react';
import { CssBaseline, Container, AppBar, Toolbar, Typography } from '@mui/material';
import Dashboard from './Dashboard';

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
                <Dashboard />
            </Container>
        </div>
    );
};

export default App;
