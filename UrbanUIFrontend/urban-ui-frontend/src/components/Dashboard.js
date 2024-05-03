import React from 'react';
import useDataFetch from '../hooks/useDataFetch';

const Dashboard = () => {
    const { data, loading, error } = useDataFetch('/api/data/PM2.5', {});

    return (
        <div>
            {loading && <p>Loading data...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && data && data.map((item, index) => (
                <div key={index}>
                    {item.value}
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
