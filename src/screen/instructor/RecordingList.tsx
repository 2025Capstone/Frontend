import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Lecture {
  id: number;
  title: string;
}

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 40px;
  margin-bottom: 20px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #1f6feb;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0d4db8;
  }
`;

const RecordingList = () => {
  const navigate = useNavigate();
  const [lectureList, setLectureList] = useState<Lecture[]>([]);

  useEffect(() => {
    const dummyData: Lecture[] = [
      { id: 1, title: "강의 1" },
      { id: 2, title: "강의 2" },
      { id: 3, title: "강의 3" },
    ];
    setLectureList(dummyData);
  }, []);

  return (
    <Container>
      <Title style={{ fontSize: "40px", marginBottom: "100px" }}>
        녹화할 강의 선택
      </Title>
      <List>
        {lectureList.map((lecture) => (
          <ListItem key={lecture.id}>
            <Button onClick={() => navigate(`/lecturer/recording/${lecture.id}`)}>
              {lecture.title} 녹화 시작하기
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
export default RecordingList;
