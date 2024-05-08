const fetchData = async (endpoint, params) => {
    const url = `${process.env.REACT_APP_BACKEND_URL}${endpoint}`;
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
    return data;
};

export default fetchData;
