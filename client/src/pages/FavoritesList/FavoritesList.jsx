import axios from 'axios';
import { useSnackbar } from 'notistack'; // 引入 useSnackbar
import React, { useEffect, useState } from 'react';
import CourseModal from '../CourseSearch/CourseModal/CourseModal';

import './FavoritesList.css';

const FavoritesList = () => {
    const [favorites, setFavorites] = useState([]); // 收藏的課程列表
    const [selectedCourse, setSelectedCourse] = useState(null); // 當前選中的課程
    const [isModalOpen, setIsModalOpen] = useState(false); // 控制模態視窗的開關
    const userId = localStorage.getItem('id'); // 從 localStorage 獲取用戶ID
    const [expandedTeachers, setExpandedTeachers] = useState([]); // 初始化 expandedTeachers
    const { enqueueSnackbar } = useSnackbar(); // 使用 enqueueSnackbar 顯示通知

    useEffect(() => {
        if (userId) {
            fetchFavorites();
        } else {
            console.error('用戶ID未找到，請檢查是否已登入。');
            enqueueSnackbar('無法加載收藏的課程，請先登入。', { variant: 'error' });
        }
    }, [userId]);

    const handleToggleExpand = (courseId) => {
        setExpandedTeachers((prev) =>
            prev.includes(courseId)
                ? prev.filter((id) => id !== courseId)
                : [...prev, courseId]
        );
    };

    // 獲取收藏的課程
    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
            console.log('獲取到的收藏資料:', response.data); // 檢查返回的資料
            if (response.data && Array.isArray(response.data)) {
                setFavorites(response.data.filter((course) => course !== null)); // 過濾掉 null 值
            } else {
                setFavorites([]); // 確保資料是陣列格式
            }
        } catch (error) {
            console.error('獲取收藏課程失敗:', error);
            enqueueSnackbar('無法獲取收藏的課程，請稍後重試。', { variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        }
    };
    const handleAddFavoriteClick = async () => {
        try {
            if (!course._id || !userId) {
                console.error("課程ID或用戶ID缺失！");
                enqueueSnackbar('課程ID或用戶ID缺失，請檢查！', { variant: 'error' });
                return;
            }

            const favoritesResponse = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
            const isAlreadyFavorite = favoritesResponse.data.some(fav => fav.courseId === course._id);

            if (isAlreadyFavorite) {
                enqueueSnackbar('此課程已經收藏過了！', { variant: 'info' });
                return;
            }

            const response = await axios.post('http://localhost:5000/api/favorites', {
                userId,
                courseId: course._id
            });

            if (response.status === 200) {
                setLocalIsFavorite(true);
                localStorage.setItem('favoriteCourses', JSON.stringify([...JSON.parse(localStorage.getItem('favoriteCourses') || '[]'), course._id]));
                enqueueSnackbar('已成功收藏此課程！', { variant: 'success', autoHideDuration: 2000, anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
            } else {
                console.error('伺服器返回錯誤：', response);
                enqueueSnackbar('伺服器錯誤，請稍後重試。', { variant: 'error' });
            }
        } catch (error) {
            console.error('收藏失敗:', error.response || error);
            enqueueSnackbar('收藏失敗，請重試。', { variant: 'error' });
        }
    };  
    // 取消收藏
    const handleRemoveFavorite = async (courseId) => {
        try {
            await axios.delete(`http://localhost:5000/api/favorites/${userId}/${courseId}`);
            setFavorites(favorites.filter((course) => course._id !== courseId)); // 移除本地列表中的課程
            enqueueSnackbar('成功取消收藏！', { variant: 'success', autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        } catch (error) {
            console.error('取消收藏失敗:', error);
            enqueueSnackbar('取消收藏失敗，請重試。', { variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        }
    };
    const openMoreInfo = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };
    const getWeekday = (dayNumber) => {
        const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
        return `星期${weekdays[dayNumber - 1] || '未提供'}`;
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
                            <th>學制/系所</th>
                            <th>年級</th>
                            <th>科目代碼</th>
                            <th>課程名稱</th>
                            <th>教師</th>
                            <th>上課人數</th>
                            <th>上課時間/節次</th>
                            <th>學分</th>
                            <th>課別</th>
                            <th>更多資訊</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {favorites.map((course, index) => (
                            <tr key={course._id}>
                                <td>{index + 1}</td>
                                <td>{course.學期 || '未提供'}</td>
                                <td>{course.學制 || '未提供'}</td>
                                <td>{course.年級 || '未提供'}</td>
                                <td>{course.科目代碼 || '未提供'}</td>
                                <td>{course.科目中文名稱 || '未提供'}</td>
                                <td>
                                    <span
                                        className={`teacher-name ${expandedTeachers.includes(course._id) ? 'expanded' : ''}`}
                                        onClick={() => handleToggleExpand(course._id)}
                                    >
                                        {expandedTeachers.includes(course._id)
                                            ? course.授課教師姓名 || '未提供'
                                            : course.授課教師姓名?.length > 6
                                                ? `${course.授課教師姓名.slice(0, 6)}...`
                                                : course.授課教師姓名 || '未提供'}
                                    </span>
                                </td>
                                <td>{course.上課人數 || '未提供'}</td>
                                <td>{`${getWeekday(course.上課星期)} - ${course.上課節次 || '未提供'}`}</td>
                                <td>{course.學分數 || '未提供'}</td>
                                <td>{course.課別名稱 || "未提供"}</td>
                                <td>
                                    <button onClick={() => openMoreInfo(course)} className="more-button">
                                        更多資訊
                                    </button>
                                </td>
                                <td>
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
               {isModalOpen && selectedCourse && (
                <CourseModal
                    course={selectedCourse}
                    onClose={closeModal}
                />
            )}
            
        </div>
    );
};

export default FavoritesList;
