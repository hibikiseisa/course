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
        const fetchAndSyncFavorites = async () => {
            try {
                if (!userId || !course?._id) return; // 確保 userId 和 course._id 存在
    
                // 向後端請求用戶收藏的課程資料
                const response = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
                console.log('後端返回的收藏資料:', response.data);
    
                // 判斷當前課程是否已收藏
                const isFavoriteNow = response.data.some(fav => fav._id === course._id || fav.courseId === course._id);
                console.log('當前課程收藏狀態:', isFavoriteNow);
    
                setLocalIsFavorite(isFavoriteNow); // 更新收藏狀態
            } catch (error) {
                console.error('獲取收藏資料失敗:', error);
            }
        };
    
        fetchAndSyncFavorites();
    }, [userId, course._id]); // 當 userId 或 course._id 改變時重新檢查
    

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

    const handleTeacherClick = async (teacherName) => {
        // 如果詳細資料已顯示，則關閉
        if (showTeacherDetails && selectedTeacher?.[0]?.name === teacherName) {
            console.log(`關閉教師資訊，教師姓名：${teacherName}`);
            setShowTeacherDetails(false);
            setSelectedTeacher(null);
            return;
        }

        // 如果詳細資料未顯示，則獲取資料並顯示
        try {
            console.log(`開始獲取教師資訊，教師姓名：${teacherName}`); // 確認點擊事件觸發

            const response = await axios.get(`http://localhost:5000/api/teacher/${encodeURIComponent(teacherName)}`);
            console.log('從後端獲取的教師資訊:', response.data); // 檢查從後端收到的資料

            const teacherData = response.data && response.data.success && response.data.data
                ? [{
                    name: response.data.data.name,
                    position: response.data.data.position,
                    phone: response.data.data.phone,
                    email: response.data.data.email,
                    specialties: response.data.data.expertise || ['未提供'],
                }]
                : [{
                    name: teacherName,
                    position: '北護教職',
                    phone: '02-2822-7128',
                    email: `${teacherName}@ntunhs.edu.tw`,
                    specialties: ['未提供']
                }];

            console.log('處理後的教師資訊:', teacherData); // 確認處理後的教師資訊

            setSelectedTeacher(teacherData); // 更新教師資訊
            setShowTeacherDetails(true); // 顯示教師詳細資料
        } catch (error) {
            console.error('獲取教師資訊失敗:', error);
            enqueueSnackbar('獲取教師資訊失敗，請重試。', { variant: 'error' });
        }
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
            // 檢查課程ID和用戶ID是否存在
            if (!course?._id || !userId) {
                console.error("課程ID或用戶ID缺失！");
                enqueueSnackbar('課程ID或用戶ID缺失，請檢查！', { variant: 'error' });
                return;
            }

            // 從後端檢查該課程是否已被收藏
            const favoritesResponse = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
            const isAlreadyFavorite = favoritesResponse.data.some(fav => fav.courseId === course._id);

            if (isAlreadyFavorite) {
                enqueueSnackbar('此課程已經收藏過了！', { variant: 'info' });
                return;
            }

            // 發送收藏請求
            const response = await axios.post('http://localhost:5000/api/favorites', {
                userId,
                courseId: course._id
            });

            // 收藏成功處理
            if (response.status === 200) {
                setLocalIsFavorite(true);
                const updatedFavorites = [...JSON.parse(localStorage.getItem('favoriteCourses') || '[]'), course._id];
                localStorage.setItem('favoriteCourses', JSON.stringify(updatedFavorites));

                enqueueSnackbar('已成功收藏此課程！', {
                    variant: 'success',
                    autoHideDuration: 2000,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
                });
            } else {
                console.error('伺服器返回錯誤：', response);
                enqueueSnackbar('伺服器錯誤，請稍後重試。', { variant: 'error' });
            }
        } catch (error) {
            // 錯誤處理，包含伺服器錯誤和其他潛在問題
            if (error.response && error.response.status === 400) {
                enqueueSnackbar('無法收藏該課程，請檢查伺服器！', { variant: 'warning' });
            } else if (error.response && error.response.status === 500) {
                enqueueSnackbar('伺服器錯誤，請稍後重試。', { variant: 'error' });
            } else {
                enqueueSnackbar('未知錯誤，請檢查網路連線或重新嘗試。', { variant: 'error' });
            }
            console.error('收藏失敗:', error.response || error);
        }
    };


    const handleRemoveFavoriteClick = async () => {
        try {
            if (!course._id || !userId) {
                console.error("Course ID 或 User ID 缺失！");
                return;
            }

            // 向後端請求取消收藏
            await axios.delete(`http://localhost:5000/api/favorites/${userId}/${course._id}`);
            setLocalIsFavorite(false);

            // 更新localStorage
            const favorites = JSON.parse(localStorage.getItem('favoriteCourses') || '[]');
            localStorage.setItem('favoriteCourses', JSON.stringify(favorites.filter(favId => favId !== course._id)));

            // 重新加載收藏資料
            fetchFavorites();

            enqueueSnackbar('已取消收藏此課程！', { variant: 'info', autoHideDuration: 2000, anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
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
                    {course.授課教師姓名.split(',').map((teacherName, index) => (
                        <button
                            key={index}
                            onClick={() => handleTeacherClick(teacherName.trim())}
                            className="teacher-name-button"
                        >
                            {teacherName.trim()}
                        </button>
                    ))}
                </p>

                {showTeacherDetails && selectedTeacher && (
                    <div className="teacher-details">
                        {selectedTeacher.map((teacher, index) => (
                            <div key={index}>
                                <p><strong>姓名：</strong>{teacher.name}</p>
                                <p><strong>職位：</strong>{teacher.position}</p>
                                <p><strong>電話：</strong>{teacher.phone}</p>
                                <p><strong>信箱：</strong>{teacher.email}</p>
                                <details>
                                    <summary><strong>專長：</strong></summary>
                                    <ul>
                                        {teacher.specialties.map((specialty, idx) => (
                                            <li key={idx}>{specialty}</li>
                                        ))}
                                    </ul>
                                </details>
                            </div>
                        ))}

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
