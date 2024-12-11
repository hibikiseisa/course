import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './my-following.css';

export default function MyFollowing() {
  const [followingList, setFollowingList] = useState([]); // 預設為空陣列
  const [loading, setLoading] = useState(true); // 加載狀態

  useEffect(() => {
    // 模擬從伺服器獲取收藏課程的數據
    axios
      .get('/api/my-following')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setFollowingList(response.data);
        } else {
          console.error('Response data is not an array:', response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching following list:', error);
        setLoading(false);
      });
  }, []);

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

  if (loading) return <div>正在加載...</div>;

  return (
    <div className="my-following-container">
      <h1 className="title">我的收藏名單</h1>
      <table className="following-table">
        <thead>
          <tr>
            <th>排序</th>
            <th>課程名稱</th>
            <th>教師名字</th>
            <th>星期/節次</th>
            <th>取消收藏</th>
          </tr>
        </thead>
        <tbody>
  {followingList.length === 0 ? (
    <tr>
      <td colSpan="5" className="no-courses-message">
        目前沒有收藏的課程
      </td>
    </tr>
  ) : (
    followingList.map((course, index) => (
      <>
        <tr key={course.id || index}>
          <td>{index + 1}</td>
          <td>{course.name}</td>
          <td>{course.teacher}</td>
          <td>{course.schedule}</td>
          <td>
            <button onClick={() => handleUnfollow(course.id)}>取消收藏</button>
          </td>
        </tr>
        {/* 每行底部插入分隔線 */}
        <tr>
          <td colSpan="5"><hr className="table-divider" /></td>
        </tr>
      </>
    ))
  )}
  
</tbody>
      </table>
    </div>
  );
}
