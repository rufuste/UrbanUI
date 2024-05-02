// services/fetchData.js
const fetchData = async (endpoint, body) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default fetchData;
