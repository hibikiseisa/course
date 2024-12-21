import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'; // 引入 react-toastify
import 'react-toastify/dist/ReactToastify.css'; // 引入樣式
import CourseModal from '../CourseSearch/CourseModal/CourseModal'; // 確保這裡正確導入
import './FavoritesList.css';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]); // 收藏的課程列表
  const [course, setCourse] = useState(null);  // 當前顯示的課程
  const [isFavorite, setIsFavorite] = useState(false);  // 當前課程是否已收藏
  const userId = localStorage.getItem('id'); // 從 localStorage 獲取用戶ID

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      console.error('用戶ID未找到，請檢查是否已登入。');
      alert('無法加載收藏的課程，請先登入。');
    }
  }, [userId]);

  // 獲取收藏的課程
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
      setFavorites(response.data); // 更新收藏課程列表
    } catch (error) {
      console.error('獲取收藏課程失敗:', error);
      alert('無法獲取收藏的課程，請稍後重試。');
    }
  };

  // 收藏課程
  const handleAddToFavorites = async (courseId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/favorites', { userId, courseId });
      console.log(response);  // 用來檢查 API 回應
      if (response.status === 200) {
        // 更新課程列表中的收藏狀態
        setFavorites(prevFavorites => {
          return prevFavorites.map(course =>
            course._id === courseId ? { ...course, isFavorite: true } : course
          );
        });
        toast.success('課程已成功收藏！', { autoClose: 3000 }); // 顯示成功通知，並自動消失
      }
    } catch (error) {
      console.error('收藏失敗:', error);
      toast.error('收藏失敗，請重試。', { autoClose: 3000 });
    }
  };

  // 取消收藏
  const handleRemoveFavorite = async (courseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/favorites/${userId}/${courseId}`);
      setFavorites(favorites.filter(course => course._id !== courseId));
      toast.error('成功取消收藏！', { autoClose: 3000 }); // 顯示取消成功的通知，並自動消失
    } catch (error) {
      console.error('取消收藏失敗:', error);
      toast.error('取消收藏失敗，請重試。', { autoClose: 3000 });
    }
  };

  // 處理顯示課程詳情
  const handleShowCourseDetails = (course) => {
    setCourse(course);
    const isFavorite = favorites.some(fav => fav._id === course._id);
    setIsFavorite(isFavorite); // 更新課程是否收藏的狀態
  };

  // 關閉課程詳情視窗
  const handleCloseModal = () => {
    setCourse(null);
    setIsFavorite(false); // 清除收藏狀態
  };

  return (
    <div className="favorites-list-container">
      <h1 className="title">我的追蹤清單</h1>
      {favorites.length === 0 ? (
        <p>目前沒有收藏的課程。</p>
      ) : (
        <table className="favorites-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>學期</th>
              <th>系所名稱</th>
              <th>課程名稱</th>
              <th>教師</th>
              <th>學分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((course, index) => (
              <tr key={course._id}>
                <td>{index + 1}</td>
                <td>{course?.學期 || '未提供'}</td>
                <td>{course?.系所名稱 || '未提供'}</td>
                <td>{course?.科目中文名稱 || '未提供'}</td>
                <td>{course?.授課教師姓名 || '未提供'}</td>
                <td>{course?.學分數 || '未提供'}</td>
                <td>
                  <button
                    onClick={() => handleShowCourseDetails(course)}
                    className="view-button"
                  >
                    查看詳情
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(course._id)}
                    className="remove-button"
                  >
                    取消收藏
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {course && (
        <CourseModal
          course={course}
          onClose={handleCloseModal}
          isFavorite={isFavorite} // 傳遞收藏狀態
          onAddToFavorites={handleAddToFavorites} // 傳遞收藏功能
        />
      )}

      <ToastContainer /> {/* 加入 ToastContainer 以顯示通知 */}
    </div>
  );
};

export default FavoritesList;
