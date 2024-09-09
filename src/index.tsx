import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { worker } from './mockData/brows';

if(process.env.NODE_ENV === 'development'){
  worker.start().then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}

