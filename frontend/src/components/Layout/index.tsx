import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout as AntLayout, Menu, Avatar, Dropdown, Badge } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  TeamOutlined,
  FilePdfOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import type { MenuProps } from "antd";
import "./Layout.css";

const { Header, Sider, Content } = AntLayout;

const NOTIFICATIONS = gql`
  query Notifications($unreadOnly: Boolean) {
    notifications(unreadOnly: $unreadOnly) { id title isRead }
  }
`;

const menuItems: MenuProps["items"] = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/projects", icon: <ProjectOutlined />, label: "Projects" },
  { key: "/contracts", icon: <FileTextOutlined />, label: "Contracts" },
  { key: "/vendors", icon: <TeamOutlined />, label: "Vendors" },
  { key: "/reports", icon: <FilePdfOutlined />, label: "Daily Reports" },
  { key: "/ra-bills", icon: <DollarOutlined />, label: "RA Bills" },
  { key: "/users", icon: <UserOutlined />, label: "Users" },
];

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data } = useQuery(NOTIFICATIONS, { variables: { unreadOnly: true } });
  const unread = data?.notifications?.filter((n: { isRead: boolean }) => !n.isRead).length ?? 0;

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
  ];

  return (
    <AntLayout className="app-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="app-sider"
      >
        <div className="logo">
          <img
            src="/favicon.svg"
            alt="BuildFlow logo"
            style={{ width: 28, height: 28, marginRight: 8 }}
          />
          <span className="logo-text">{collapsed ? "BF" : "BuildFlow"}</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>
      <AntLayout>
        <Header className="app-header">
          <div className="header-left">
            <div
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>
          <div className="header-right">
            <Badge count={unread} size="small">
              <BellOutlined className="header-icon" />
            </Badge>
            <Dropdown
              menu={{
                items: userMenu,
                onClick: ({ key }) => key === "logout" && logout(),
              }}
              placement="bottomRight"
            >
              <div className="user-menu">
                <Avatar icon={<UserOutlined />} />
                <span className="user-name">{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ height: "100%" }}
            >
              {children ?? <Outlet />}
            </motion.div>
          </AnimatePresence>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
