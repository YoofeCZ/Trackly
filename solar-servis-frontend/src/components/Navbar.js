import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';

const { Header } = Layout;

function Navbar() {
  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center', backgroundColor: '#001529' }}>
        {/* Název aplikace - zarovnaný vlevo */}
        <Typography.Title
          level={4}
          style={{ color: 'white', margin: 0, flex: 'none', paddingRight: '20px' }}
        >
          Solar Servis
        </Typography.Title>

        {/* Menu pro navigační tlačítka */}
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['/']}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Menu.Item key="/" style={{ fontSize: '16px' }}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/technicians" style={{ fontSize: '16px' }}>
            <Link to="/technicians">Technici</Link>
          </Menu.Item>
          <Menu.Item key="/clients" style={{ fontSize: '16px' }}>
            <Link to="/clients">Klienti</Link>
          </Menu.Item>
          <Menu.Item key="/reports" style={{ fontSize: '16px' }}>
            <Link to="/reports">Reporty</Link>
          </Menu.Item>
          <Menu.Item key="/tasks" style={{ fontSize: '16px' }}>
            <Link to="/tasks">Úkoly</Link>
          </Menu.Item>
        </Menu>
      </Header>
    </Layout>
  );
}

export default Navbar;
