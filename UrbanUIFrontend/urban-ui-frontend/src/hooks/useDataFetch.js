import { useState, useEffect } from 'react';
import fetchData from '../services/dataService';

const cache = {};
const CACHE_DURATION = 60000; // 1 minute in milliseconds

const useDataFetch = (endpoint, params = {}, refreshInterval = CACHE_DURATION) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;

        const fetchDataAsync = async () => {
            setLoading(true);
            if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION)) {
                setData(cache[cacheKey].data);
                setLoading(false);
            } else {
                try {
                    const data = await fetchData(endpoint, params);
                    cache[cacheKey] = { data, timestamp: Date.now() };
                    setData(data);
                } catch (error) {
                    setError(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDataAsync();

        const interval = setInterval(fetchDataAsync, refreshInterval);
        return () => clearInterval(interval);

    }, [endpoint, params, refreshInterval]);

    return { data, loading, error };
};

export default useDataFetch;
