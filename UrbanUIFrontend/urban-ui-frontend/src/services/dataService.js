const fetchData = async (endpoint, params) => {
    const url = new URL(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`);
    
    // Append params as query parameters
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
};

export default fetchData;
