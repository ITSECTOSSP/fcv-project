import React from 'react';
import ReactDOM from 'react-dom/client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import { theme } from "./theme/theme";

import App from './App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="light"  theme={theme}>
            <Notifications />
            <App />
        </MantineProvider>
    </React.StrictMode>,
);