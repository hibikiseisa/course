import axios from 'axios';
import { useSnackbar } from 'notistack'; // 引入 useSnackbar
import React, { useEffect, useState } from 'react';
import map from "../../../assets/map.png";
import './CourseModal.css';

const CourseModal = ({ course, onClose, isFavorite, onAddToFavorites }) => {
    const userId = localStorage.getItem('id'); // 從 localStorage 獲取用戶ID
    const { enqueueSnackbar } = useSnackbar(); // 使用 enqueueSnackbar 顯示通知

    const [showTeacherDetails, setShowTeacherDetails] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mapImage, setMapImage] = useState('');
    const [roomLocation, setRoomLocation] = useState('');
    const [isTeacherInfoOpen, setIsTeacherInfoOpen] = useState(false);
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

    if (!course) return null;

    useEffect(() => {
        // 每次打開視窗時檢查當前課程是否已經收藏
        const favoriteCourses = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
        if (favoriteCourses.includes(course._id)) {
            setLocalIsFavorite(true);
        } else {
            setLocalIsFavorite(false);
        }
    }, [course._id]); // 依賴課程ID，確保每次課程改變時都重新檢查收藏狀態
        
    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
            // 假設 API 返回收藏的課程資料
            console.log('已加載收藏資料:', response.data);
    
            // 更新localIsFavorite狀態
            const isFavorite = response.data.some(fav => fav.courseId === course._id);
            setLocalIsFavorite(isFavorite);
        } catch (error) {
            console.error('獲取收藏資料失敗:', error);
        }
    };
    
    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
        setShowTeacherDetails(true);
    };

    const handleMapToggle = () => {
        setShowMap((prev) => !prev);
    };

    const toggleMoreInfo = () => {
        setIsMoreInfoOpen((prevState) => !prevState);
    };

    const handleOpenMap = async () => {
        const location = course.上課地點;

        if (!location) {
            setRoomLocation('無相關位置資訊');
            return;
        }

        let mapPath;

        if (location.startsWith('G')) {
            mapPath = import('../../../assets/mapG.png');
        } else if (location.startsWith('S')) {
            mapPath = import('../../../assets/mapS.png');
        } else if (location.startsWith('B')) {
            mapPath = import('../../../assets/mapB.png');
        } else if (location.startsWith('F')) {
            mapPath = import('../../../assets/mapF.png');
        } else {
            setRoomLocation('無相關位置資訊');
            return;
        }

        mapPath.then((image) => {
            setMapImage(image.default);
            setIsMapOpen(true);
        });
    };

    const handleCloseMap = () => {
        setIsMapOpen(false);
    };

    const toggleTeacherInfo = () => {
        setIsTeacherInfoOpen((prevState) => !prevState);
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
                enqueueSnackbar('已成功收藏此課程！', { variant: 'success', autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
            } else {
                console.error('伺服器返回錯誤：', response);
                enqueueSnackbar('伺服器錯誤，請稍後重試。', { variant: 'error' });
            }
        } catch (error) {
            console.error('收藏失敗:', error.response || error);
            enqueueSnackbar('收藏失敗，請重試。', { variant: 'error' });
        }
    };
    
    const handleRemoveFavoriteClick = async () => {
        try {
            if (!course._id || !userId) {
                console.error("Course ID 或 User ID 缺失！");
                return;
            }
    
            await axios.delete(`http://localhost:5000/api/favorites/${userId}/${course._id}`);
            setLocalIsFavorite(false);
    
            // 更新 localStorage
            const favorites = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
            localStorage.setItem('favoriteCourses', JSON.stringify(favorites.filter(favId => favId !== course._id)));
            
            enqueueSnackbar('已取消收藏此課程！', { variant: 'info', autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        } catch (error) {
            console.error('取消收藏失敗:', error);
            enqueueSnackbar('取消收藏失敗，請重試。', { variant: 'error' });
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>課程詳情</h2>
                <p><strong>學期：</strong> {course.學期}</p>
                <p><strong>主開課教師姓名：</strong> {course.主開課教師姓名}</p>
                <p>
                    <strong>教師：</strong>
                    <button onClick={toggleTeacherInfo} className="teacher-info-button">
                        {course.授課教師姓名}
                    </button>
                </p>

                {isTeacherInfoOpen && (
                    <div className="teacher-info">
                        <p><strong>教師姓名：</strong> {course.授課教師姓名}</p>
                        <p><strong>研究領域：</strong> 這裡是教師的研究領域介紹。</p>
                    </div>
                )}

                <p><strong>課程全碼：</strong> {course.課程全碼}</p>
                <p><strong>系所代碼：</strong> {course.系所代碼}</p>
                <p><strong>系所名稱：</strong> {course.系所名稱}</p>
                <p><strong>學制：</strong> {course.學制}</p>
                <p>
                    <strong>教室：</strong> {course.上課地點 ? course.上課地點 : roomLocation}
                    <button onClick={handleOpenMap} className="open-map-button">
                        <img src={map} alt="map" className="map-image" />
                    </button>
                </p>

                {isMapOpen && mapImage && (
                    <div className="map-modal">
                        <div className="map-content">
                            <img src={mapImage} alt="教室地圖" />
                            <button onClick={handleCloseMap} className="close-map-button">×</button>
                        </div>
                    </div>
                )}

                <p><strong>科目代碼：</strong> {course.科目代碼}</p>
                <p><strong>科目組別：</strong> {course.科目組別}</p>
                <p><strong>年級：</strong> {course.年級}</p>
                <p><strong>上課班組：</strong> {course.上課班組}</p>
                <p><strong>科目中文名稱：</strong> {course.科目中文名稱}</p>
                <p><strong>科目英文名稱：</strong> {course.科目英文名稱}</p>
                <p><strong>學分：</strong> {course.學分數}</p>
                <p><strong>上課週次：</strong> {course.上課週次}</p>
                <p><strong>課別代碼：</strong> {course.課別代碼}</p>
                <p><strong>課別名稱：</strong> {course.課別名稱}</p>
                <p><strong>上課星期：</strong> {course.上課星期}</p>
                <p><strong>上課節次：</strong> {course.上課節次}</p>
                <p>
                    <button onClick={toggleMoreInfo} className="more-info-button">
                        {isMoreInfoOpen ? '隱藏更多資訊' : '顯示更多資訊'}
                    </button>
                </p>

                {isMoreInfoOpen && (
                    <div className="more-info">
                        <p><strong>課表備註：</strong> {course.課表備註}</p>
                        <p><strong>課程中文摘要：</strong> {course.課程中文摘要}</p>
                        <p><strong>課程英文摘要：</strong> {course.課程英文摘要}</p>
                    </div>
                )}

                <div className="modal-buttons">
                    {localIsFavorite ? (
                        <button onClick={handleRemoveFavoriteClick} className="add-to-favorites">
                            取消收藏
                        </button>
                    ) : (
                        <button onClick={handleAddFavoriteClick} className="add-to-favorites">
                            收藏
                        </button>
                    )}
                    <button onClick={onClose} className="close-button">
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseModal;
