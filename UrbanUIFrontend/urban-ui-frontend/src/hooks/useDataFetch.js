// hooks/useDataFetch.js
import { useState, useEffect } from 'react';
import fetchData from '../Services/fetchData';

const useDataFetch = (url, params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData(url, params)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [url, params]);

  return { data, loading, error };
};

export default useDataFetch;
