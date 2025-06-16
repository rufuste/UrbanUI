const fetchData = async (endpoint, params, signal) => {
    const url = new URL(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`);
    
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        signal,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok (status: ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
};

export default fetchData;
