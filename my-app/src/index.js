import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Đảm bảo rằng đường dẫn này chính xác
import './index.css';

const rootElement = document.getElementById('root'); // Đảm bảo rằng id 'root' là đúng
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

