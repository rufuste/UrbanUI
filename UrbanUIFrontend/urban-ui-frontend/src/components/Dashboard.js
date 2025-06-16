import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Tabs, Tab, Box, Card, CardContent, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, IconButton, Switch, FormControlLabel, CircularProgress, Link, Checkbox, FormGroup
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import PollutantChart from './PollutantChart';
import SpikeMap from './SpikeMap';
import BubbleMap from './BubbleMap';
import ViolinPlot from './ViolinPlot';
import Stack from '@mui/material/Stack';
import TimescaleDropdown from './TimescaleDropdown';
import D3ScatterChart from './D3ScatterChart';
import BoxPlot from './BoxPlot';
import ForecastChart from './ForecastChart';
import GaugeComponent from './Gauge';

const Dashboard = ({ isSidebarOpen, handleSidebarToggle, timescale }) => {
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOutliers, setShowOutliers] = useState(true);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedPollutants, setSelectedPollutants] = useState(['PM2.5']);
  const [pollutantAverages, setPollutantAverages] = useState({ 'PM2.5': 50, 'NO2': 20, 'PM10': 40 });
  
  const handlePollutantChange = (event, newValue) => {
    setSelectedPollutant(newValue);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'Comparison') {
      setIsComparisonMode(true);
    } else {
      setIsComparisonMode(false);
    }
  };

  const handlePollutantSelection = (event, pollutant) => {
    if (event.target.checked) {
      setSelectedPollutants((prev) => [...prev, pollutant]);
    } else {
      setSelectedPollutants((prev) => prev.filter((item) => item !== pollutant));
    }
  };


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
            <ListItem ListItemButton onClick={() => handleCategoryChange('All')}>
              <ListItemText primary="All" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Charts')}>
              <ListItemText primary="Charts" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Maps')}>
              <ListItemText primary="Maps" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Distribution')}>
              <ListItemText primary="Distribution Plots" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Forecast')}>
              <ListItemText primary="Forecast" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Comparison')}>
              <ListItemText primary="Comparison" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Information')}>
              <ListItemText primary="Information" />
            </ListItem>
            <ListItem ListItemButton onClick={() => handleCategoryChange('Support')}>
              <ListItemText primary="Support" />
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
        {/* <TimescaleDropdown timescale={timescale} setTimescale={setTimescale} /> */}
        {isComparisonMode && (
          <FormGroup row>
            {['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'O3', 'Humidity', 'Wind Speed', 'CO', 'Pressure', 'Solar Radiation', 'Temperature'].map((pollutant) => (
              <FormControlLabel
                key={pollutant}
                control={
                  <Checkbox
                    checked={selectedPollutants.includes(pollutant)}
                    onChange={(e) => handlePollutantSelection(e, pollutant)}
                    name={pollutant}
                  />
                }
                label={pollutant}
              />
            ))}
          </FormGroup>
        )}
          <Box sx={{
            position: 'fixed',
            right: 0,
            top: 64,
            width: 200,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            display: { xs: 'none', md: 'block' },
            backgroundColor: 'background.paper',
            padding: 2,
            boxShadow: 3,
          }}>
            {['PM2.5', 'NO2', 'PM10'].map((pollutant) => (
              <Box key={pollutant} sx={{ marginBottom: 3 }}>
                <GaugeComponent pollutant={pollutant} value={pollutantAverages[pollutant]} />
              </Box>
            ))}
          </Box>
          
        <Grid container spacing={3}>
          {isComparisonMode ? (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Line Charts
                </Typography>
              </Grid>
              {selectedPollutants.map((pollutant) => (
                <Grid item xs={12} md={6} key={`line-${pollutant}`}>
                  <Card sx={{ height: 400 }}>
                    <CardContent sx={{ height: '80%' }}>
                      <Typography variant="h6" gutterBottom>
                        {pollutant} Line Chart
                      </Typography>
                      <PollutantChart pollutant={pollutant} days={timescale} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Scatter Charts
                </Typography>
              </Grid>
              {selectedPollutants.map((pollutant) => (
                <Grid item xs={12} md={6} key={`scatter-${pollutant}`}>
                  <Card sx={{ height: 400 }}>
                    <CardContent sx={{ height: '80%' }}>
                      <Typography variant="h6" gutterBottom>
                        {pollutant} Scatter Chart
                      </Typography>
                      <D3ScatterChart pollutant={pollutant} days={timescale} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Violin Plots
                </Typography>
              </Grid>
              {selectedPollutants.map((pollutant) => (
                <Grid item xs={12} md={6} key={`violin-${pollutant}`}>
                  <Card sx={{ height: 500 }}>
                    <CardContent sx={{ height: '80%' }}>
                      <Typography variant="h6" gutterBottom>
                        {pollutant} Violin Plot
                      </Typography>
                      <FormControlLabel
                        control={<Switch checked={showOutliers} onChange={() => setShowOutliers(!showOutliers)} />}
                        label="Show Outliers"
                      />
                      <ViolinPlot pollutant={pollutant} showOutliers={showOutliers} days={timescale} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Box Plots
                </Typography>
              </Grid>
              {selectedPollutants.map((pollutant) => (
                <Grid item xs={12} md={6} key={`box-${pollutant}`}>
                  <Card sx={{ height: 500 }}>
                    <CardContent sx={{ height: '80%' }}>
                      <Typography variant="h6" gutterBottom>
                        {pollutant} Box Plot
                      </Typography>
                      <FormControlLabel
                        control={<Switch checked={showOutliers} onChange={() => setShowOutliers(!showOutliers)} />}
                        label="Show Outliers"
                      />
                      <BoxPlot pollutant={pollutant} showOutliers={showOutliers} days={timescale} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Spike Maps
                </Typography>
              </Grid>
              {selectedPollutants.map((pollutant) => (
                <Grid item xs={12} md={6} key={`spike-${pollutant}`}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '80%' }}>
                      <Typography variant="h6" gutterBottom>
                        {pollutant} Spike Map
                      </Typography>
                      <SpikeMap pollutant={pollutant} days={timescale} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bubble Maps
                </Typography>
              </Grid>
              {selectedPollutants.map((pollutant) => (
                <Grid item xs={12} md={6} key={`bubble-${pollutant}`}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '80%' }}>
                      <Typography variant="h6" gutterBottom>
                        {pollutant} Bubble Map
                      </Typography>
                      <BubbleMap pollutant={pollutant} days={timescale} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </>
          ) : (
            <>
              {(selectedCategory === 'All' || selectedCategory === 'Charts') && (
                <>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400 }}>
                      <CardContent sx={{ height: '80%' }}>
                        <Typography variant="h6" gutterBottom>
                          {selectedPollutant} Line Chart
                        </Typography>
                        <PollutantChart pollutant={selectedPollutant} days={timescale} />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: 400 }}>
                      <CardContent sx={{ height: '80%' }}>
                        <Typography variant="h6" gutterBottom>
                          {selectedPollutant} Scatter Chart
                        </Typography>
                        <D3ScatterChart pollutant={selectedPollutant} days={timescale} />
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
              {(selectedCategory === 'All' || selectedCategory === 'Distribution') && (
                <>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: 500 }}>
                      <CardContent sx={{ height: '80%' }}>
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
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: 500 }}>
                      <CardContent sx={{ height: '80%' }}>
                        <Typography variant="h6" gutterBottom>
                          {selectedPollutant} Box Plot
                        </Typography>
                        <FormControlLabel
                          control={<Switch checked={showOutliers} onChange={() => setShowOutliers(!showOutliers)} />}
                          label="Show Outliers"
                        />
                        <BoxPlot pollutant={selectedPollutant} showOutliers={showOutliers} days={timescale} />
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
              {(selectedCategory === 'All' || selectedCategory === 'Maps') && (
                <>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ height: '80%' }}>
                        <Typography variant="h6" gutterBottom>
                          {selectedPollutant} Spike Map
                        </Typography>
                        <SpikeMap pollutant={selectedPollutant} days={timescale} />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ height: '80%' }}>
                        <Typography variant="h6" gutterBottom>
                          {selectedPollutant} Bubble Map
                        </Typography>
                        <BubbleMap pollutant={selectedPollutant} days={timescale} />
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
              {selectedCategory === 'Forecast' && (
                <Grid item xs={12}>
                  <ForecastChart pollutant={selectedPollutant} days={timescale} />
                </Grid>
              )}
              {selectedCategory === 'Information' && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Information and Resources
                      </Typography>
                      <List>
                        <ListItem>
                          <Link href="https://www.epa.gov/outdoor-air-quality-data/air-data-basic-information" target="_blank" rel="noopener">
                            Air Quality and Pollution Data - EPA
                          </Link>
                        </ListItem>
                        <ListItem>
                          <Link href="https://www.who.int/health-topics/air-pollution" target="_blank" rel="noopener">
                            Air Pollution - WHO
                          </Link>
                        </ListItem>
                        <ListItem>
                          <Link href="https://en.wikipedia.org/wiki/Air_pollution" target="_blank" rel="noopener">
                            Air Pollution - Wikipedia
                          </Link>
                        </ListItem>
                        <ListItem>
                          <Link href="https://www.atlassian.com/data/charts/violin-plot-complete-guide" target="_blank" rel="noopener">
                            Violin Plots - Atlassian
                          </Link>
                        </ListItem>

                        <ListItem>
                          <Link href="https://statisticsbyjim.com/graphs/scatterplots/" target="_blank" rel="noopener">
                            Scatter Plots
                          </Link>
                        </ListItem>
                        
                        <ListItem>
                          <Link href="https://www.tableau.com/learn/articles/data-visualization" target="_blank" rel="noopener">
                            Data Visualisation - Tableau
                          </Link>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedCategory === 'Support' && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Support
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        For feedback, assistance or any questions, please contact our support team.
                      </Typography>
                      <Typography variant="body1">
                        Email: <Link href="mailto:support@nclurbanui.com">support@nclurbanui.com</Link>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          )}
        </Grid>
        
      </Box>
    </Box>
  );
};

export default Dashboard;
