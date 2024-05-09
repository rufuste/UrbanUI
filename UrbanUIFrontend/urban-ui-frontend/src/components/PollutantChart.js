import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, ScatterPlot } from '@mui/x-charts';
import useDataFetch from '../hooks/useDataFetch';

const PollutantChart = ({ type, pollutant }) => {
    const theme = useTheme();
    const { data, loading, error } = useDataFetch(`/api/data/${pollutant}`, {});

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const chartData = data.map(item => ({
        Timestamp: Date.parse(item.Timestamp), // Convert to numeric value (milliseconds since epoch)
        Value: item.Value
    }));

    console.log('Chart Data:', chartData); // Debug log to check the data structure
    console.log('Type:', type); // Debug log to check the chart type

    if (chartData.length === 0) {
        return <p>No data available to plot.</p>;
    }

    const commonProps = {
        xAxis: [
            {
                dataKey: 'Timestamp',
                valueFormatter: (value) => new Date(value).toLocaleString(),
                min: chartData[0]?.Timestamp,
                max: chartData[chartData.length - 1]?.Timestamp,
                label: 'Time'
            },
        ],
        series: [
            {
                dataKey: 'Value',
                label: data[0]?.Variable || 'Value', // Ensure label is available
                color: theme.palette.primary.main,
                showMark: false
            }
        ],
        dataset: chartData,
        width: 500,
        height: 300
    };

    return (
        <div>
            {type === 'line' ? (
                <LineChart {...commonProps} />
            ) : (
                type === 'scatter' ? (
                    <ScatterPlot {...commonProps} />
                ) : null
            )}
        </div>
    );
    
};

export default PollutantChart;
