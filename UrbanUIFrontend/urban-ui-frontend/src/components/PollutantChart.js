import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, ScatterChart } from '@mui/x-charts'; // Ensure ScatterChart is imported
import useDataFetch from '../hooks/useDataFetch';

const PollutantChart = ({ type, pollutant }) => {
    const theme = useTheme();
    const { data, loading, error } = useDataFetch(`/api/data/${pollutant}`, {});

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const chartData = data.map(item => ({
        Timestamp: Date.parse(item.Timestamp), // Convert to numeric value (milliseconds since epoch)
        Value: item.Value,
        Variable: item.Variable
    }));

    console.log('Chart Data:', chartData); // Debug log to check the data structure
    console.log('Type:', type); // Debug log to check the chart type

    if (chartData.length === 0) {
        return <p>No data available to plot.</p>;
    }

    const xAxisProps = [
        {
            dataKey: 'Timestamp',
            valueFormatter: (value) => new Date(value).toLocaleString(),
            min: chartData[0]?.Timestamp,
            max: chartData[chartData.length - 1]?.Timestamp,
            label: 'Time',
            dataset: chartData
        }
    ];

    const lineChartProps = {
        xAxis: xAxisProps,
        series: [
            {
                dataKey: 'Value',
                label: chartData[0]?.Variable || 'Value', // Ensure label is available
                color: theme.palette.primary.main,
                showMark: false
            }
        ],
        dataset: chartData,
        width: 500,
        height: 300
    };

    const scatterChartProps = {
        xAxis: xAxisProps,
        series: [
            {
                label: 'Pollutant Data',
                data: chartData.map(item => ({
                    x: item.Timestamp,
                    y: item.Value,
                    id: item.Variable
                }))
            }
        ],
        dataset: chartData,
        width: 600,
        height: 300
    };

    return (
        <div>
            {type === 'line' ? (
                <LineChart {...lineChartProps} />
            ) : (
                type === 'scatter' ? (
                    <ScatterChart {...scatterChartProps} />
                ) : null
            )}
        </div>
    );
};

export default PollutantChart;
