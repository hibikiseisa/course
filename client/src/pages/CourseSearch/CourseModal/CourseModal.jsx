import React, { useState } from 'react';
import map from "../../../assets/map.png"; // 确保图片路径正确
import './CourseModal.css';

const CourseModal = ({ course, onClose, isFavorite, onAddToFavorites }) => {
    const [showTeacherDetails, setShowTeacherDetails] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
    if (!course) return null;

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
        setShowTeacherDetails(true);
    };

    const handleMapToggle = () => {
        setShowMap((prev) => !prev);
    };

    const toggleMoreInfo = () => {
        setIsMoreInfoOpen(prevState => !prevState); // 切換更多資訊顯示狀態
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
                <p><strong>主開課教師姓名：</strong> {course.主開課教師姓名}</p>
                <p>
                    <strong>教師：</strong>
                    <button onClick={toggleTeacherInfo} className="teacher-info-button">
                        {course.授課教師姓名}
                    </button>
                </p>

                {/* 教師資訊顯示區 */}
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

                {/* 地圖模態視窗 */}
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

                {/* 更多資訊顯示區 */}
                {isMoreInfoOpen && (
                    <div className="more-info">
                        <p><strong>課表備註：</strong> {course.課表備註}</p>
                        <p><strong>課程中文摘要：</strong> {course.課程中文摘要}</p>
                        <p><strong>課程英文摘要：</strong> {course.課程英文摘要}</p>
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
