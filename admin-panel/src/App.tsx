import React from 'react';
import { Layout } from 'antd';
import AppRoutes from './routes';
import Sidebar from './components/Layout/Sidebar';
import 'antd/dist/reset.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <AppRoutes />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
