import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import ErrorBoundary from './components/ErrorBoundary.js'; // Import ErrorBoundary

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal Error: Root element with ID 'root' was not found in the DOM. React cannot mount.");
  // Display a message to the user directly in the body if #root is missing
  const body = document.body;
  if (body) {
    body.innerHTML = `
      <div style="color: white; background-color: #111827; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h1 style="font-size: 2em; color: #F87171; margin-bottom: 20px;">Application Initialization Failed</h1>
        <p style="font-size: 1.2em; color: #D1D5DB;">The core HTML structure seems to be missing or incomplete.</p>
        <p style="font-size: 1em; color: #9CA3AF;">Specifically, the element with ID 'root' could not be found.</p>
        <p style="margin-top: 30px; font-size: 0.9em; color: #6B7280;">Please try refreshing the page. If the problem persists, contact support.</p>
      </div>
    `;
  }
  throw new Error("Could not find root element to mount to");
} else {
  console.log("Root element #root found. Initializing React app...");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(ErrorBoundary, { fallbackMessage: "There was an issue loading the main application. Please check the console for more details." },
      React.createElement(App, null)
    )
  )
);