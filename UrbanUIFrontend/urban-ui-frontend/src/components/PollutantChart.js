// PollutantChart.js
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, BarChart } from '@mui/x-charts';
import useDataFetch from '../hooks/useDataFetch';

const PollutantChart = ({ type, pollutant }) => {
    const theme = useTheme();
    const { data, loading, error } = useDataFetch(`/api/data/${pollutant}`, {});

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const chartData = data.map(item => ({ x: item.timestamp, y: item.Value }));

    return (
        <div>
            {type === 'line' ? (
                <LineChart
                    xAxis={{ label: 'Time' }} 
                    yAxis={{ label: 'Value' }} 
                    series={[{
                        data: chartData,
                        color: theme.palette.primary.main,
                    }]}
                    width={500}
                    height={300}
                />
            ) : (
                <BarChart
                    xAxis={{ label: 'Time' }} 
                    yAxis={{ label: 'Value' }} 
                    series={[{
                        data: chartData,
                        color: theme.palette.primary.main,
                    }]}
                    width={500}
                    height={300}
                />
            )}
        </div>
    );
};

export default PollutantChart;
