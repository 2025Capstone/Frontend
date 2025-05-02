import React from "react";
import styled from "styled-components";
import { Outlet, useMatch, useNavigate } from "react-router-dom";

const SidebarContainer = styled.nav`
  width: 11%;
  height: 100vh;
  background-color: #0d1b2a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
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

const Icon = styled.span<{ isActive: boolean }>`
  font-size: 35px;
  color: ${(props) => (props.isActive ? "#1f6feb" : "white")};
  transition: color 0.3s;
  &:hover {
    color: #1f6feb;
  }
`;

const BottomIcon = styled.div`
  margin-top: auto;
  padding-bottom: 20px;
`;

const MainContent = styled.div`
  margin-left: 11%;
  width: 89%;
  padding: 20px;
`;

const Main = () => {
  const navigate = useNavigate();
  const lecturesdMatch = useMatch("/student/lectures");
  const analysisdMatch = useMatch("/student/analysis");
  const chatMatch = useMatch("/student/chat");
  const settomgMatch = useMatch("/student/setting");
  return (
    <>
      <SidebarContainer>
        {/* 로고 */}
        <Logo className="material-symbols-outlined">notifications_paused</Logo>

        {/* 메뉴 리스트 */}
        <NavList>
          <NavItem onClick={() => navigate("/lecturer/lectures")}>
            <Icon
              isActive={lecturesdMatch != null}
              className="material-symbols-outlined"
            >
              menu_book
            </Icon>
          </NavItem>
          <NavItem onClick={() => navigate("/lecturer/recording")}>
            <Icon
              isActive={analysisdMatch != null}
              className="material-symbols-outlined"
            >
              videocam
            </Icon>
          </NavItem>
        </NavList>

        {/* 하단 아이콘 */}
        <BottomIcon onClick={() => navigate("/lecturer/setting")}>
          <Icon
            isActive={settomgMatch != null}
            className="material-symbols-outlined"
          >
            settings
          </Icon>
        </BottomIcon>
      </SidebarContainer>

      {/* 메인 컨텐츠 */}
      <MainContent>
        <Outlet />
      </MainContent>
    </>
  );
};

export default Main;
