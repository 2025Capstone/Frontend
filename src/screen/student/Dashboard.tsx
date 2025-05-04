import React from "react";
import styled from "styled-components";

// --- Styled Components for Dashboard ---
const MainTitle = styled.h2`
  color: ${(props) => props.theme.textColor};
  font-size: 20px;
  font-weight: bold;
`;
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px; /* 섹션 간의 간격 */
`;

const Row = styled.div`
  display: flex;
  gap: 25px; /* 카드 간의 간격 */
  width: 100%;

  @media (max-width: 1024px) {
    /* 작은 화면에서는 세로로 쌓기 */
    flex-direction: column;
  }
`;

// 기본 카드 스타일
const Card = styled.div`
  background-color: ${(props) => props.theme.formContainerColor}; // 테마 적용
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  flex: 1; /* Flex 아이템이 공간을 차지하도록 */
  transition: background-color 0.3s ease;
`;

// 카드 제목
const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
  margin: 0 0 15px 0;
`;

// 카드 부제목 (날짜 등)
const CardSubtitle = styled.p`
  font-size: 0.85rem;
  color: ${(props) => props.theme.subTextColor};
  margin: -10px 0 15px 0;
`;

// 리스트 (오늘/내일 수업, 할 일)
const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.textColor};
  padding-bottom: 10px;
  border-bottom: 1px solid ${(props) => props.theme.btnColor}; // 테마 또는 하드코딩

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ItemTime = styled.span`
  font-size: 0.85rem;
  color: ${(props) => props.theme.subTextColor};
  min-width: 50px; /* 시간 영역 너비 고정 */
`;

const ItemText = styled.span`
  flex-grow: 1; /* 텍스트가 남은 공간 차지 */
`;

// 아이콘 스타일
const ListIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.1rem; /* 아이콘 크기 */

  &.dot-icon {
    color: ${(props) => props.theme.btnColor}; /* 노란색 점 */
    font-size: 0.8rem; /* 점 아이콘 크기 */
  }
  &.play-icon {
    color: ${(props) => props.theme.subTextColor}; /* 회색 재생 아이콘 */
    cursor: pointer;
    &:hover {
      color: ${(props) => props.theme.textColor};
    }
  }
`;

// 빈 카드 스타일 (뭐넣노)
const PlaceholderCard = styled(Card)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px; /* 최소 높이 */
  color: ${(props) => props.theme.subTextColor};
  font-size: 1rem;
`;

// Detection Analytics 카드 (더 클 수 있음)
const WideCard = styled(Card)`
  flex: 2; /* 다른 카드보다 너비 비율 크게 */
  min-height: 200px; /* 최소 높이 */
  padding: 0px 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.subTextColor}; /* 임시 텍스트 색상 */
  /* 나중에 실제 내용 채우기 */

  @media (max-width: 1024px) {
    flex-basis: auto; /* 세로로 쌓일 때 기본 크기 */
    min-height: 150px;
  }
`;

// Continue Learning 섹션
const ContinueLearningContainer = styled.div`
  margin-top: 10px; /* 위 카드와의 간격 */
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
  margin: 0 0 15px 0;
`;

const CourseList = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto; /* 가로 스크롤 */
  padding-bottom: 15px; /* 스크롤바 공간 */

  /* 스크롤바 스타일링 (선택 사항) */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 4px;
  }
`;

const CourseCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor};
  border-radius: 10px;
  overflow: hidden; /* 이미지 모서리 처리 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  min-width: 250px; /* 카드 최소 너비 */
  max-width: 250px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CourseImage = styled.img`
  width: 100%;
  height: 140px; /* 이미지 높이 고정 */
  object-fit: cover; /* 이미지 비율 유지하며 채우기 */
  display: block;
`;

const CourseInfo = styled.div`
  padding: 15px;
  flex-grow: 1; /* 내용이 적어도 높이 차지 */
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CourseTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
  margin: 0;
  line-height: 1.3;
`;

const CourseDetail = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.subTextColor};
  margin: 0;
`;

const CourseFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 15px 15px 15px; /* 아래쪽 패딩 */
`;

const ProgressBar = styled.div`
  flex-grow: 1;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
`;

const Progress = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background-color: ${(props) => props.theme.btnColor}; // 테마 또는 하드코딩
  border-radius: 3px;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.btnColor};
  cursor: pointer;
  padding: 0;
  display: flex;

  .material-symbols-outlined {
    font-size: 1.8rem;
  }
`;

// --- Placeholder Data ---
const todayClasses = [
  { time: "09:00", name: "Course Name Example 1" },
  { time: "11:00", name: "Another Course Name" },
  { time: "14:00", name: "Third Course Today" },
];
const tomorrowClasses = [
  { time: "10:00", name: "Tomorrow Course Intro" },
  { time: "13:00", name: "Advanced Topic" },
];
const todoItems = [
  { name: "Lecture Name", week: 6, date: "04-29", time: "09:23" },
  { name: "Lecture Name", week: 6, date: "04-30", time: "11:00" },
  { name: "Lecture Name", week: 6, date: "05-01", time: "14:15" },
];
const learningCourses = [
  // Placeholder 이미지 URL 사용
  {
    id: 1,
    img: "https://via.placeholder.com/250x140/777/fff?text=Intro+to+AI",
    title: "Introduction TO AI",
    lecture: "Lecture Name",
    professor: "Professor Name",
    progress: 70,
  },
  {
    id: 2,
    img: "https://via.placeholder.com/250x140/4a90e2/fff?text=Data+Analysis",
    title: "Data Analysis Techniques",
    lecture: "Lecture Name",
    professor: "Professor Name",
    progress: 30,
  },
  {
    id: 3,
    img: "https://via.placeholder.com/250x140/cccccc/333?text=Generic+Course",
    title: "Another Course Title",
    lecture: "Lecture Name",
    professor: "Professor Name",
    progress: 90,
  },
  {
    id: 4,
    img: "https://via.placeholder.com/250x140/cccccc/333?text=Generic+Course",
    title: "Another Course Title",
    lecture: "Lecture Name",
    professor: "Professor Name",
    progress: 50,
  },
];

const formatDateWithDay = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const dayOfMonth = date.getDate().toString().padStart(2, "0");
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[date.getDay()];
  return `${month}.${dayOfMonth}(${dayOfWeek})`;
};

// --- Dashboard Component ---

const Dashboard = () => {
  const today = new Date();
  const formattedToday = formatDateWithDay(today);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const formattedTomorrow = formatDateWithDay(tomorrow);

  return (
    <DashboardContainer>
      <MainTitle>Dashboard</MainTitle>
      <Row>
        <Card>
          <CardTitle>Today's Class</CardTitle>
          <CardSubtitle>{formattedToday}</CardSubtitle>
          <List>
            {todayClasses.map((item, index) => (
              <ListItem key={index}>
                <ListIcon className="material-symbols-outlined dot-icon">
                  fiber_manual_record
                </ListIcon>
                <ItemTime>{item.time}</ItemTime>
                <ItemText>{item.name}</ItemText>
              </ListItem>
            ))}
          </List>
        </Card>
        <Card>
          <CardTitle>Tomorrow's Class</CardTitle>
          <CardSubtitle>{formattedTomorrow}</CardSubtitle>{" "}
          {/* 날짜는 동적으로 받아와야 함 */}
          <List>
            {tomorrowClasses.map((item, index) => (
              <ListItem key={index}>
                <ListIcon className="material-symbols-outlined dot-icon">
                  fiber_manual_record
                </ListIcon>
                <ItemTime>{item.time}</ItemTime>
                <ItemText>{item.name}</ItemText>
              </ListItem>
            ))}
          </List>
        </Card>
        <PlaceholderCard>
          여기 프로필 간략하게 넣는 것도 괜춘할듯
        </PlaceholderCard>
      </Row>

      <Row>
        <WideCard>Detection Analytics (내용 추가 예정)</WideCard>
        <Card>
          <CardTitle>To-do (04-29 ~ 05-06)</CardTitle>{" "}
          {/* 날짜 범위 동적 처리 필요 */}
          <List>
            {todoItems.map((item, index) => (
              <ListItem key={index}>
                <ListIcon className="material-symbols-outlined play-icon">
                  play_circle
                </ListIcon>
                <ItemText>
                  {item.name} Video Week {item.week} <br />
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>
                    {item.date} | {item.time}
                  </span>
                </ItemText>
              </ListItem>
            ))}
          </List>
        </Card>
      </Row>

      {/* 하단 행 */}
      <ContinueLearningContainer>
        <SectionTitle>Continue Learning</SectionTitle>
        <CourseList>
          {learningCourses.map((course) => (
            <CourseCard key={course.id}>
              <CourseImage src={course.img} alt={course.title} />
              <CourseInfo>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDetail>{course.lecture}</CourseDetail>
                <CourseDetail>{course.professor}</CourseDetail>
              </CourseInfo>
              <CourseFooter>
                <ProgressBar>
                  <Progress percentage={course.progress} />
                </ProgressBar>
                <PlayButton title="Continue course">
                  <span className="material-symbols-outlined">play_arrow</span>
                </PlayButton>
              </CourseFooter>
            </CourseCard>
          ))}
        </CourseList>
      </ContinueLearningContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
