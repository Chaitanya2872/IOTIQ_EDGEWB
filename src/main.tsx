import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'antd/dist/reset.css';
import { ConfigProvider, theme as antdTheme } from 'antd';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 12,
          fontFamily:
            "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
          colorBgLayout: '#f5f7fa',
          colorBgContainer: '#ffffff',
          boxShadowSecondary: '0 8px 24px rgba(0,0,0,0.08)',
        },
        components: {
          Button: {
            controlHeight: 44,
            borderRadius: 24,
          },
          Card: {
            borderRadiusLG: 16,
          },
          Table: {
            borderRadiusLG: 12,
            headerBg: '#f8fafc',
          },
          Input: {
            borderRadius: 12,
          },
          Select: {
            borderRadius: 12,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
