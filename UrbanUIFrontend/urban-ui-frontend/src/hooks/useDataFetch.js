import { useState, useEffect, useRef } from 'react';
import fetchData from '../services/dataService';
import debounce from 'lodash.debounce';

const centralCache = {};
const CACHE_DURATION = 120000; // 2 minutes in milliseconds
const fetchQueue = {};

const useDataFetch = (endpoint, params = {}, refreshInterval = CACHE_DURATION) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;

        const fetchDataAsync = async () => {
            setLoading(true);

            // Check if data is in the central cache
            if (centralCache[cacheKey] && (Date.now() - centralCache[cacheKey].timestamp < CACHE_DURATION)) {
                setData(prevData => {
                    if (JSON.stringify(prevData) !== JSON.stringify(centralCache[cacheKey].data)) {
                        return centralCache[cacheKey].data;
                    }
                    return prevData;
                });
                setLoading(false);
            } else if (fetchQueue[cacheKey]) {
                // If there's a fetch in progress, wait for it to complete
                fetchQueue[cacheKey].then(result => {
                    setData(result.data);
                    setLoading(false);
                }).catch(err => {
                    setError(err);
                    setLoading(false);
                });
            } else {
                // Initiate data fetch and add it to the fetch queue
                const fetchPromise = (async () => {
                    try {
                        abortControllerRef.current = new AbortController();
                        const signal = abortControllerRef.current.signal;
                        const data = await fetchData(endpoint, { ...params, signal });
                        centralCache[cacheKey] = { data, timestamp: Date.now() };
                        return { data };
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            throw error;
                        }
                    }
                })();

                fetchQueue[cacheKey] = fetchPromise;

                try {
                    const result = await fetchPromise;
                    setData(result.data);
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                    delete fetchQueue[cacheKey]; // Clean up the fetch queue
                }
            }
        };

        const debouncedFetchDataAsync = debounce(fetchDataAsync, 300); // Debounce to avoid rapid calls
        debouncedFetchDataAsync();

        const interval = setInterval(debouncedFetchDataAsync, refreshInterval);
        return () => {
            clearInterval(interval);
            debouncedFetchDataAsync.cancel(); // Cancel debounced calls
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [endpoint, params, refreshInterval]); // Include `params` and `refreshInterval` in the dependency array

    return { data, loading, error };
};

export default useDataFetch;
