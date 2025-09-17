import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space } from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  TruckOutlined,
  MailOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 菜单配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/agents',
      icon: <RobotOutlined />,
      label: 'Agent管理',
    },
    {
      key: '/logistics',
      icon: <TruckOutlined />,
      label: '物流跟踪',
    },
    {
      key: '/marketing',
      icon: <MailOutlined />,
      label: '邮件营销',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
    {
      key: '/workflows',
      icon: <BranchesOutlined />,
      label: '工作流管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 处理退出登录
      console.log('退出登录');
    } else if (key === 'profile') {
      // 处理个人资料
      console.log('个人资料');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="app-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        className="app-sider"
        theme="light"
      >
        {/* Logo */}
        <div className="app-logo" style={{ 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center',
          height: '64px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          {!collapsed && (
            <span className="app-logo-text" style={{ marginLeft: '8px' }}>
              SaasAgent
            </span>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="app-menu"
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        {/* 头部 */}
        <Header className="app-header">
          <div className="header-toolbar">
            <div className="header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleCollapsed}
                style={{ fontSize: '16px', width: '40px', height: '40px' }}
              />
            </div>

            <div className="header-right">
              <Space size="middle">
                {/* 通知 */}
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    size="large"
                    className="header-notifications"
                  />
                </Badge>

                {/* 用户信息 */}
                <Dropdown
                  menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <div className="header-user">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                      管理员
                    </span>
                  </div>
                </Dropdown>
              </Space>
            </div>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content className="app-content">
          <div style={{ minHeight: 'calc(100vh - 128px)' }}>
            {children}
          </div>
        </Content>

        {/* 页脚 */}
        <Footer className="app-footer">
          SaasAgent ©2024 - 国际电商AI Agent智能平台
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
