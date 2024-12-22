import React, { useState } from 'react';
import './CourseModal.css';

const CourseModal = ({ course, onClose, isFavorite, onAddToFavorites }) => {
    const [showTeacherDetails, setShowTeacherDetails] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showMap, setShowMap] = useState(false);

    if (!course) return null;

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
        setShowTeacherDetails(true);
    };

    const handleMapToggle = () => {
        setShowMap((prev) => !prev);
    };


    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mapImage, setMapImage] = useState(''); // 用來存放圖片的 state
    const [roomLocation, setRoomLocation] = useState(''); // 用來存放教室位置的 state
    const [isTeacherInfoOpen, setIsTeacherInfoOpen] = useState(false); // 新增狀態控制教師資訊顯示

    const handleOpenMap = async () => {
        const location = course.上課地點; // 假設教室位置在這裡

        if (!location) {
            setRoomLocation('無相關位置資訊');
            return;
        }

        let mapPath;

        if (location.startsWith('G')) {
            mapPath = import('../../../assets/mapG.png');  // G區地圖
        } else if (location.startsWith('S')) {
            mapPath = import('../../../assets/mapS.png');  // S區地圖
        } else if (location.startsWith('B')) {
            mapPath = import('../../../assets/mapB.png');  // B區地圖
        } else if (location.startsWith('F')) {
            mapPath = import('../../../assets/mapF.png');  // F區地圖
        } else {
            setRoomLocation('無相關位置資訊'); // 無匹配的地圖
            return;
        }

        // 使用 import() 加載圖片並設置為狀態
        mapPath.then(image => {
            setMapImage(image.default); // 使用 default 屬性獲取圖片 URL
            setIsMapOpen(true); // 打開地圖視窗
        });
    };

    const handleCloseMap = () => {
        setIsMapOpen(false); // 關閉地圖視窗
    };

    const toggleTeacherInfo = () => {
        setIsTeacherInfoOpen(prevState => !prevState); // 切換教師資訊顯示狀態
    };

    if (!course) return null; // 確保 course 存在

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>課程詳情</h2>
                <p><strong>學期：</strong> {course.學期}</p>
                <p><strong>系所代碼：</strong> {course.系所代碼}</p>
                <p><strong>課程名稱：</strong> {course.科目中文名稱}</p>
                <p>
                    <strong>教師：</strong> 
                    <button onClick={toggleTeacherInfo} className="teacher-info-button">
                        {course.授課教師姓名}
                    </button>
                </p>

                {/* 教師資訊顯示區 */}
                {isTeacherInfoOpen && (
                    <div className="teacher-info">
                        {/* 這裡可以加入更多教師的相關資訊 */}
                        <p><strong>教師姓名：</strong> 這裡是教師的簡短介紹。</p>
                        <p><strong>研究領域：</strong> 這裡是教師的研究領域介紹。</p>
                        
                    </div>
                )}

                <p><strong>學分：</strong> {course.學分數}</p>
                <p>
                    <strong>教室：</strong> {course.上課地點 ? course.上課地點 : roomLocation}
                    <button onClick={handleOpenMap} className="open-map-button">打開地圖</button>
                </p>

                {/* 地圖模態視窗 */}
                {isMapOpen && mapImage && (
                    <div className="map-modal">
                        <div className="map-content">
                            <img src={mapImage} alt="教室地圖" />
                            <button onClick={handleCloseMap} className="close-map-button">×</button> {/* 叉叉符號 */}
                        </div>
                    </div>
                )}

                <div className="modal-buttons">
                    {!isFavorite && (
                        <button onClick={() => onAddToFavorites(course._id)} className="add-to-favorites">
                            收藏
                        </button>
                    )}
                    {isFavorite && (
                        <button disabled className="add-to-favorites">
                            已收藏
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
