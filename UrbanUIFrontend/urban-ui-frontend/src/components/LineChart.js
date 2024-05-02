// components/LineChart.js
import * as React from 'react';
import { LineChart} from '@mui/x-charts';
import dayjs from 'dayjs';
function MyLineChart({ data }) {
  return (
    <LineChart
        xAxis={[
          {
            label: "Date",
            data: data,
            tickInterval: data,
            scaleType: "time",
            valueFormatter: (date) => dayjs(date).format("MMM D"),
          },
        ]}
        yAxis={[{ label: "Temperature (°F)" }]}
        series={[
          { label: "Atlanta, GA", data: data[0] },
          { label: "Toronto, ON", data: data[1] },
        ]}
        height={400}
      />
);
}

{/* <LineChart data={data}>
        
        <LineChart dataKey="value" name="PM2.5 Levels" />
      </LineChart> */}

export default MyLineChart;
