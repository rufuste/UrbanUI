// src/config.js
const getBackendUrl = () => {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  };
  
  export const BACKEND_URL = getBackendUrl();
  