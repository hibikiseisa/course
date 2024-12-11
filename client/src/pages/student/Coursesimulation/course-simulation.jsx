import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './course-simulation.css';

export default function CourseSimulation() {
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    axios
      .get('/api/Coursesimulation')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setFollowingList(response.data);
        } else {
          console.error('Response data is not an array:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching following list:', error);
      });
  }, []);
  {followingList.map((course, index) => (
    <tr key={course.id || index}> {/* 使用 index 作为 fallback key */}
      <td>{index + 1}</td>
      <td>{course.name}</td>
      <td>{course.teacher}</td>
      <td>{course.schedule}</td>
      <td>
        <button onClick={() => handleUnfollow(course.id)}>取消收藏</button>
      </td>
    </tr>
  ))}
  
  const handleUnfollow = (courseId) => {
    // 取消收藏操作
    axios
      .post(`/api/unfollow/${courseId}`) // 替換為你的 API 端點
      .then(() => {
        setFollowingList((prevList) =>
          prevList.filter((course) => course.id !== courseId)
        );
      })
      .catch((error) => {
        console.error('Error unfollowing course:', error);
      });
  };

  return (
    <div className="my-following-container">
      <h1 className="title">預選課模擬</h1>
    </div>
  );
}
