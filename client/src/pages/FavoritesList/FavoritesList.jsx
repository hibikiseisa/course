import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './FavoritesList.css';

const FavoritesList = () => {
    const [favorites, setFavorites] = useState([]); // 收藏的課程列表
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
            console.log('獲取到的收藏資料:', response.data); // 檢查返回的資料
            if (response.data && Array.isArray(response.data)) {
                setFavorites(response.data.filter((course) => course !== null)); // 過濾掉 null 值
            } else {
                setFavorites([]); // 確保資料是陣列格式
            }
        } catch (error) {
            console.error('獲取收藏課程失敗:', error);
            alert('無法獲取收藏的課程，請稍後重試。');
        }
    };

    // 取消收藏
    const handleRemoveFavorite = async (courseId) => {
        try {
            await axios.delete(`http://localhost:5000/api/favorites/${userId}/${courseId}`);
            setFavorites(favorites.filter((course) => course._id !== courseId)); // 移除本地列表中的課程
            alert('成功取消收藏！');
        } catch (error) {
            console.error('取消收藏失敗:', error);
            alert('取消收藏失敗，請重試。');
        }
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
        </div>
    );
};

export default FavoritesList;
