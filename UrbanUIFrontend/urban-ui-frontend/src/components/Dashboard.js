import React, { useEffect, useState } from 'react';
import fetchData from '../services/dataService';

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetchData('PM2.5')
            .then(jsonData => setData(jsonData))
            .catch(error => {
                setError('Failed to fetch data: ' + error.message);
                console.error('There was a problem with the fetch operation:', error);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div>
            {isLoading && <p>Loading data...</p>}
            {error && <p>Error: {error}</p>}
            {!isLoading && data.map((item, index) => (
                <div key={index}>
                    {item.value}
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
