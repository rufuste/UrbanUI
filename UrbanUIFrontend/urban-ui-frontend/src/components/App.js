import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import RealTimeData from './RealTimeData';
import Dashboard from './Dashboard';
const theme = createTheme();

const App = () => {
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg">
                <Typography variant="h2" component="h1" gutterBottom>
                    UrbanUI Dashboard
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper>
                            <Dashboard />
                            <RealTimeData />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper>
                            {/* Additional widgets or info can go here */}
                            <Typography>
                                Widget Area
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
};

export default App;
