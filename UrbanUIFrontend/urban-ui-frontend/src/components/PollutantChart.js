import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts';
import useDataFetch from '../hooks/useDataFetch';
import CircularProgress from '@mui/material/CircularProgress';
import withAutoResize from './withAutoResize';

const PollutantChart = ({ width, height, pollutant, days }) => {
  const theme = useTheme();
  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}`, { days, remove_outliers: true });

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;

  const chartData = data.map(item => ({
    Timestamp: Date.parse(item.Timestamp),
    Value: item.Value,
    Variable: item.Variable,
  }));

  if (chartData.length === 0) {
    return <p>No data available to plot.</p>;
  }

  const lineChartProps = {
    xAxis: [
      {
        dataKey: 'Timestamp',
        valueFormatter: (value) => new Date(value).toLocaleString(),
        min: chartData[0]?.Timestamp,
        max: chartData[chartData.length - 1]?.Timestamp,
        label: 'Time',
      },
    ],
    series: [
      {
        dataKey: 'Value',
        label: chartData[0]?.Variable || 'Value',
        color: theme.palette.primary.main,
        showMark: false,
      },
    ],
    dataset: chartData,
    width: width || 500,
    height: height || 300,
  };

  return <LineChart {...lineChartProps} />;
};

export default PollutantChart;
