import React, { useState } from 'react';
import { Grid, Paper, Tabs, Tab, Box } from '@mui/material';
import PollutantChart from './PollutantChart';
import InteractiveMap from './InteractiveMap';

const Dashboard = () => {
    const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');

    const handlePollutantChange = (event, newValue) => {
        setSelectedPollutant(newValue);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Tabs
                value={selectedPollutant}
                onChange={handlePollutantChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="PM2.5" value="PM2.5" />
                <Tab label="PM10" value="PM10" />
                <Tab label="NO2" value="NO2" />
                <Tab label="O3" value="O3" />
                <Tab label="Humidity" value="Humidity" />
                <Tab label="Wind Speed" value="Wind Speed" />
                <Tab label="CO" value="CO" />
            </Tabs>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper>
                    <InteractiveMap 
                        pollutant= {selectedPollutant} // Adjust the endpoint as needed
                        params={{}} // Add any necessary params here
                    />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper>
                        <PollutantChart type="line" pollutant={selectedPollutant} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper>
                        <PollutantChart type="scatter" pollutant={selectedPollutant} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
