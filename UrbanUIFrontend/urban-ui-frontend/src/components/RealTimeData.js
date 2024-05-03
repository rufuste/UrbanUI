// RealTimeData.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;  // Declare socket variable outside component to ensure single instance

const RealTimeData = () => {
    const [realTimeData, setRealTimeData] = useState([]);

    useEffect(() => {
        // Connect only once when the component is mounted
        if (!socket) {
            socket = io(process.env.REACT_APP_BACKEND_URL);
        }

        socket.on('data', newData => {
            setRealTimeData(currentData => [...currentData, newData]);
        });

        return () => {
            socket.off('data');
            socket.disconnect();
        };
    }, []);

    return (
        <ul>
            {realTimeData.map((data, index) => (
                <li key={index}>{data.message}</li>  // Customize based on actual data structure
            ))}
        </ul>
    );
};

export default RealTimeData;
