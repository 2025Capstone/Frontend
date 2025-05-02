import React from "react";
import styled, { css } from "styled-components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useThemeStore } from "../../store"; // 경로 확인 필요

// --- Styled Components ---

const SidebarContainer = styled.nav`
  width: 18%;
  height: 100vh;
  background-color: ${(props) => props.theme.navBackgroundColor || '#f8f9fa'};
  color: ${(props)=>props.theme.subTextColor};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 25px 0;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
`;

const SidebarTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props)=>props.theme.textColor};
  padding: 0 25px;
  margin-bottom: 50px;
  text-align: left;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavItem = styled.li<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  margin: 0 15px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: ${(props)=>props.theme.subTextColor};

  ${(props) =>
    props.isActive &&
    css`
      background-color: ${(props)=>props.theme.formContainerColor || '#e7f0ff'};
      color: ${(props)=>props.theme.highlightColor || '#1f6feb'};
      font-weight: 600;
    `}

  &:hover {
    ${(props) =>
      !props.isActive &&
      css`
        background-color: ${(props)=>props.theme.subTextColor}10;
        color: ${(props)=>props.theme.highlightColor || '#1f6feb'};
      `}
  }
`;

const Icon = styled.span`
  font-size: 28px;
  display: flex;
  align-items: center;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding: 20px 25px; /* 좌우 패딩 일치 */
  display: flex;
  justify-content: flex-start; /* 오른쪽 정렬로 변경 */
`;

const ThemeToggleButtonBottom = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.subTextColor};
  padding: 0.5rem;
  border-radius:50%;
  cursor: pointer;
  font-size: 2rem;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  .material-symbols-outlined {
    font-size: inherit;
  }

  &:hover {
    background-color: ${(props) => props.theme.subTextColor}1A;
    border-color: ${(props) => props.theme.textColor};
    color: ${(props) => props.theme.textColor};
  }
`;


const MainContent = styled.div`
  margin-left: 18%;
  width: 82%;
  padding: 30px;
  background-color: ${(props) => props.theme.backgroundColor};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

// --- Main Component ---

const Main = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const navItems = [
    { path: "/student/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/student/courses", icon: "menu_book", label: "Courses" },
    { path: "/student/monitoring", icon: "monitoring", label: "Monitoring" },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <SidebarTitle>Project Title</SidebarTitle>

        <NavList>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavItem
                key={item.path}
                isActive={isActive}
                onClick={() => navigate(item.path)}
              >
                <Icon className="material-symbols-outlined">{item.icon}</Icon>
                <span>{item.label}</span>
              </NavItem>
            );
          })}
        </NavList>

        <SidebarFooter>
           <ThemeToggleButtonBottom onClick={toggleTheme} title="Toggle Theme">
              {isDark ? (
                <span className="material-symbols-outlined">light_mode</span>
              ) : (
                <span className="material-symbols-outlined">dark_mode</span>
              )}
            </ThemeToggleButtonBottom>
        </SidebarFooter>

      </SidebarContainer>

      <MainContent>
        <Outlet />
      </MainContent>
    </div>
  );
};

export default Main;