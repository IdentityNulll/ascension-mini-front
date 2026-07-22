import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { router } from './app/router';
import './lib/dayjs'; // extend dayjs plugins globally
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style: {
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            color: '#1f2937',
            boxShadow: '0 4px 16px -2px rgba(0,0,0,0.10)',
          },
          success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
