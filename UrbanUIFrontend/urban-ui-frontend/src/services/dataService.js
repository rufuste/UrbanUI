// src/services/dataService.js
const fetchData = async (endpoint) => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/data/${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
};

export default fetchData;
