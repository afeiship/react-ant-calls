import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { CallsProvider } from '@jswork/react-ant-calls';
import './index.scss';
import App from './app';
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <CallsProvider>
      <App />
    </CallsProvider>
  </ConfigProvider>
);
