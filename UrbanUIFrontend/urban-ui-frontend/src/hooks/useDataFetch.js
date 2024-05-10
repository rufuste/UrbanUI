import { useState, useEffect } from 'react';
import fetchData from '../services/dataService';

const useDataFetch = (endpoint, params = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDataAsync = async () => {
            try {
                const data = await fetchData(endpoint, params);
                setData(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataAsync();
    }, [endpoint, params]);
    
    return { data, loading, error };
};

export default useDataFetch;
