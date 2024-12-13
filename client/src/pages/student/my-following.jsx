import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './my-following.css';

const MyFollowing = () => {
  const [followingList, setFollowingList] = useState([]); // 收藏列表
  const [loading, setLoading] = useState(true); // 加載狀態
  const [sortOrder, setSortOrder] = useState('time-asc'); // 排序順序

  useEffect(() => {
    // 從伺服器獲取收藏課程數據
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
      .post(`/api/unfollow/${courseId}`)
      .then(() => {
        setFollowingList((prevList) =>
          prevList.filter((course) => course.id !== courseId)
        );
      })
      .catch((error) => {
        console.error('Error unfollowing course:', error);
      });
  };

  const handleSortChange = (e) => {
    const selectedOrder = e.target.value;
    setSortOrder(selectedOrder);

    // 根據排序選擇進行重新排序
    const sortedList = [...followingList].sort((a, b) => {
      if (selectedOrder === 'time-asc') {
        return a.schedule.localeCompare(b.schedule);
      } else if (selectedOrder === 'time-desc') {
        return b.schedule.localeCompare(a.schedule);
      } else if (selectedOrder === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (selectedOrder === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    setFollowingList(sortedList);
  };

  if (loading) return <div>正在加載...</div>;

  return (
    <div className="my-following-container">
      <h1 className="title">我的追蹤名單</h1>
      <table className="following-table">
      <thead>
  <tr>
    <th colSpan="5" className="sort-header">
      <span>排序</span>
      <div className="sort-container">
        <select
          id="sort"
          className="sort-select"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="time-asc">時間 A-Z</option>
          <option value="time-desc">時間 Z-A</option>
          <option value="name-asc">名稱 A-Z</option>
          <option value="name-desc">名稱 Z-A</option>
        </select></div>
            </th>
            <th>課程名稱</th>
            <th>教師名字</th>
            <th>星期/節次</th>
            <th>修改</th>
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
              <tr key={course.id}>
                <td>
                  <button
                    className="unfollow-btn"
                    onClick={() => handleUnfollow(course.id)}
                  >
                    ×
                  </button>
                </td>
                <td>{course.name}</td>
                <td>{course.teacher}</td>
                <td>{course.schedule}</td>
                <td>
                  <button className="edit-btn">修改</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="footer">
        <span>{followingList.length} 筆資料</span>
      </div>
    </div>
  );
}
export default MyFollowing;
