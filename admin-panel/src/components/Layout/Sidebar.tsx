import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Tableau de bord',
    },
    {
      key: '/drivers',
      icon: <CarOutlined />,
      label: 'Chauffeurs',
      children: [
        {
          key: '/drivers/active',
          label: 'Chauffeurs actifs',
        },
        {
          key: '/drivers/registrations',
          label: 'Inscriptions en attente',
        },
        {
          key: '/drivers/manage',
          label: 'Gestion des chauffeurs',
        },
      ],
    },
    {
      key: '/customers',
      icon: <ShopOutlined />,
      label: 'Clients',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Utilisateurs',
    },
    {
      key: '/deliveries',
      icon: <FileTextOutlined />,
      label: 'Livraisons',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
    },
  ];

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ height: '64px', padding: '16px', textAlign: 'center' }}>
        <img
          src="/logo.png"
          alt="TransWift Logo"
          style={{ height: '32px' }}
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['/']}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
