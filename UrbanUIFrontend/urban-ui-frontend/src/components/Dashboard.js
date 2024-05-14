import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Tabs, Tab, Box, Card, CardContent, Typography, Drawer, List, ListItem, ListItemText, Toolbar, IconButton, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import PollutantChart from './PollutantChart';
import SpikeMap from './SpikeMap';
import BubbleMap from './BubbleMap';
import ViolinPlot from './ViolinPlot'; // Import ViolinPlot
import TimescaleDropdown from './TimescaleDropdown';
import D3ScatterChart from './D3ScatterChart';

const Dashboard = ({ isSidebarOpen, handleSidebarToggle }) => {
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');
  const [timescale, setTimescale] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOutliers, setShowOutliers] = useState(true); // Outliers toggle state

  const handlePollutantChange = (event, newValue) => {
    setSelectedPollutant(newValue);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    // Fetch data based on selected pollutant and timescale
    // This can be done through a function call or direct fetching inside the component
  }, [selectedPollutant, timescale]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="persistent"
        open={isSidebarOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <IconButton onClick={handleSidebarToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <TimescaleDropdown timescale={timescale} setTimescale={setTimescale} />
            </ListItem>
            <ListItem button onClick={() => handleCategoryChange('All')}>
              <ListItemText primary="All" />
            </ListItem>
            <ListItem button onClick={() => handleCategoryChange('Charts')}>
              <ListItemText primary="Charts" />
            </ListItem>
            <ListItem button onClick={() => handleCategoryChange('Maps')}>
              <ListItemText primary="Maps" />
            </ListItem>
            <ListItem button onClick={() => handleCategoryChange('Distribution')}>
              <ListItemText primary="Distribution Plots" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Tabs
          value={selectedPollutant}
          onChange={handlePollutantChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs"
        >
          <Tab label="PM2.5" value="PM2.5" />
          <Tab label="PM10" value="PM10" />
          <Tab label="NO" value="NO" />
          <Tab label="NO2" value="NO2" />
          <Tab label="NOx" value="NOx" />
          <Tab label="O3" value="O3" />
          <Tab label="Humidity" value="Humidity" />
          <Tab label="Wind Speed" value="Wind Speed" />
          <Tab label="CO" value="CO" />
          <Tab label="Pressure" value="Pressure" />
          <Tab label="Solar Radiation" value="Solar Radiation" />
          <Tab label="Temperature" value="Temperature" />
        </Tabs>
        <Grid container spacing={3}>
          {(selectedCategory === 'All' || selectedCategory === 'Charts') && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedPollutant} Line Chart
                    </Typography>
                    <PollutantChart pollutant={selectedPollutant} days={timescale} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedPollutant} Scatter Chart
                    </Typography>
                    <D3ScatterChart pollutant={selectedPollutant} days={timescale} />
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          {(selectedCategory === 'All' || selectedCategory === 'Maps') && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedPollutant} Spike Map
                    </Typography>
                    <SpikeMap pollutant={selectedPollutant} days={timescale} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedPollutant} Bubble Map
                    </Typography>
                    <BubbleMap pollutant={selectedPollutant} days={timescale} />
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          {(selectedCategory === 'All' || selectedCategory === 'Distribution') && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 400 }}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedPollutant} Violin Plot
                    </Typography>
                    <FormControlLabel
                      control={<Switch checked={showOutliers} onChange={() => setShowOutliers(!showOutliers)} />}
                      label="Show Outliers"
                    />
                    <ViolinPlot pollutant={selectedPollutant} showOutliers={showOutliers} days={timescale} />
                  </CardContent>
                </Card>
              </Grid>
              {/* Add other distribution plots here */}
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
