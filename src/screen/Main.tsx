import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
const SidebarContainer = styled.nav`
  width: 11%;
  height: 100vh;
  background-color: #0d1b2a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
`;

const Logo = styled.span`
  font-size: 60px;
  font-weight: bold;
  margin-bottom: 80px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

const NavItem = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #1f6feb;
  }
`;
const Icon = styled.span`
  font-size: 35px;
`;

const BottomIcon = styled.div`
  margin-top: auto;
  padding-bottom: 20px;
  transition: color 0.3s;
  &:hover {
    color: #1f6feb;
  }
`;

const Main = () => {
  return (
    <>
    <Outlet />
      <SidebarContainer>
        {/* 로고 */}
        <Logo className="material-symbols-outlined">notifications_paused</Logo>
        {/* 메뉴 리스트 */}
        <NavList>
          <NavItem>
            <Icon className="material-symbols-outlined">menu_book</Icon>
          </NavItem>
          <NavItem>
            <Icon className="material-symbols-outlined">query_stats</Icon>
          </NavItem>
          <NavItem>
            <Icon className="material-symbols-outlined">chat</Icon>
          </NavItem>
        </NavList>

        {/* 하단 아이콘 */}
        <BottomIcon>
          <Icon className="material-symbols-outlined">settings</Icon>
        </BottomIcon>
      </SidebarContainer>
    </>
  );
};
export default Main;
