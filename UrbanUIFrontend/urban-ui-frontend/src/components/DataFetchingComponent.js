// components/DataFetchingComponent.js
import React from 'react';
import useDataFetch from '../hooks/useDataFetch';
import MyLineChart from './LineChart';

function DataFetchingComponent() {
  const { data, loading, error } = useDataFetch('http://localhost:5000/data', { variable: 'PM2.5', days: 1 });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data!</p>;

  return (
    <div>
      {data && <MyLineChart data={data} />}
    </div>
  );
}

export default DataFetchingComponent;
