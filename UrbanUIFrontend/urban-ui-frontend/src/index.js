import React from 'react';
import { createRoot } from 'react-dom/client'; // Correct import for React 18
import './index.css';
import App from './components/App'; // Import your root component

import reportWebVitals from './reportWebVitals';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Ensure you have a div with id="root" in your index.html
const container = document.getElementById('root');
const root = createRoot(container); // Using the new createRoot API

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

reportWebVitals(console.log);
