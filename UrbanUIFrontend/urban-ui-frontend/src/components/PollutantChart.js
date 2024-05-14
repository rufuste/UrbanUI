import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts';
import useDataFetch from '../hooks/useDataFetch';
import D3ScatterChart from './D3ScatterChart';



const PollutantChart = ({ type, pollutant, days }) => {

    const theme = useTheme();
    const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers: true });

  

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const chartData = data.map(item => ({
        Timestamp: Date.parse(item.Timestamp), // Convert to numeric value (milliseconds since epoch)
        Value: item.Value,
        Variable: item.Variable
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
        width: 500,
        height: 300,
        
      };

    return (
        <div>
            {type === 'line' ? (
                <LineChart {...lineChartProps} />
            ) : (
                type === 'scatter' ? (
                    <D3ScatterChart data={chartData} width={500} height={300} />
                ) : null
            )}
        </div>
    );
};

export default PollutantChart;
