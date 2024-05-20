import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { CircularProgress, Typography, Card, CardContent } from '@mui/material';
import useDataFetch from '../hooks/useDataFetch';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastChart = ({ pollutant, days }) => {
  const { data, loading, error } = useDataFetch(`/api/forecast/${pollutant}`, { days });

  const [forecastData, setForecastData] = useState([]);
  const [mae, setMae] = useState(null);

  useEffect(() => {
    if (data && Array.isArray(data.forecast)) {
      setForecastData(data.forecast);
      setMae(data.mae);
    }
  }, [data]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography variant="body2" color="error">Error: {error.message}</Typography>;
  }

  if (!Array.isArray(forecastData)) {
    return <Typography variant="body2" color="error">Invalid forecast data format</Typography>;
  }

  const chartData = {
    labels: forecastData.map(item => item.ds),
    datasets: [
      {
        label: 'Forecast',
        data: forecastData.map(item => item.yhat),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
      {
        label: 'Lower Bound',
        data: forecastData.map(item => item.yhat_lower),
        borderColor: 'rgba(75, 192, 192, 0.4)',
        fill: false,
     

      },
      {
        label: 'Lower Bound',
        data: forecastData.map(item => item.yhat_lower),
        borderColor: 'rgba(75, 192, 192, 0.4)',
        fill: false,
      },
      {
        label: 'Upper Bound',
        data: forecastData.map(item => item.yhat_upper),
        borderColor: 'rgba(75, 192, 192, 0.4)',
        fill: false,
      }
    ]
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent sx={{ height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {pollutant} Forecast Chart
        </Typography>
        <Typography variant="body2">
          Mean Absolute Error: {mae}
        </Typography>
        <Line data={chartData} />
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
