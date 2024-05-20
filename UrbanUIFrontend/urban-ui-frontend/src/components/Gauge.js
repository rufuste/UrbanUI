import React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import useDataFetch from '../hooks/useDataFetch';

const GaugeComponent = ({ pollutant }) => {
  const { data, loading, error } = useDataFetch('/api/averages', { variable: pollutant });
  const value = data ? data[pollutant] : 0;

  let max_value = 100;
  let red_start = 30;

  if (pollutant === 'PM2.5') {
    max_value = 105;
    red_start = 35;
  } else if (pollutant === 'NO2') {
    max_value = 75;
    red_start = 25;
  } else if (pollutant === 'PM10') {
    max_value = 135;
    red_start = 45;
  }

  const valueMax = max_value;
  const valueMin = 0;
  const thresholds = [
    { value: red_start, color: 'light blue' },
    { value: valueMax, color: 'orange' },
  ];

  const getArcColor = (value) => {
    return value >= red_start ? 'orange' : 'light blue';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {loading && <p>Loading...</p>}
      {error && <p>Error loading data</p>}
      {!loading && !error && (
        <div>
          <Gauge
            width={200}
            height={200}
            aria-labelledby={pollutant}
            value={value}
            valueMin={valueMin}
            valueMax={valueMax}
            thresholds={thresholds}
            innerRadius="70%"
            outerRadius="90%"
            startAngle={0}
            endAngle={360}
            cornerRadius="50%"
            sx={(theme) => ({
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 20,
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: getArcColor(value),
              },
              [`& .${gaugeClasses.referenceArc}`]: {
                fill: theme.palette.text.disabled,
              },
            })}
          />
          <div style={{ marginTop: '10px' }}>{pollutant}</div>
        </div>
      )}
    </div>
  );
};

export default GaugeComponent;
