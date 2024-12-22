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

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>課程詳情</h2>

                <table className="course-info-table">
                    <tbody>
                        <tr>
                            <td><strong>學期：</strong></td>
                            <td>{course.學期}</td>
                            <td><strong>系所：</strong></td>
                            <td>{course.系所名稱}</td>
                        </tr>
                        <tr>
                            <td><strong>課別名稱：</strong></td>
                            <td>{course.課別名稱}</td>
                            <td><strong>科目代碼：</strong></td>
                            <td>{course.科目代碼}</td>
                        </tr>
                        <tr>
                            <td><strong>中文科目名稱：</strong></td>
                            <td>{course.科目中文名稱}</td>
                            <td><strong>英文科目名稱：</strong></td>
                            <td>{course.英文科目名稱}</td>
                        </tr>
                        <tr>
                            <td><strong>年級：</strong></td>
                            <td>{course.年級}</td>
                            <td><strong>學分：</strong></td>
                            <td>{course.學分數}</td>
                        </tr>
                        <tr>
                            <td><strong>修課人數：</strong></td>
                            <td>{course.修課人數}</td>
                            <td><strong>上課週次：</strong></td>
                            <td>{course.上課週次}</td>
                        </tr>
                        <tr>
                            <td><strong>上課時間及地點：</strong></td>
                            <td colSpan="3">
                                {course.上課時間.map((time, index) => (
                                    <div key={index}>{time}</div>
                                ))}
                                <button className="map-toggle-button" onClick={handleMapToggle}>
                                    {showMap ? '隱藏地圖' : '顯示地圖'}
                                </button>
                                {showMap && <div className="map-container">地圖顯示中...</div>}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>授課教師：</strong></td>
                            <td colSpan="3">
                                {course.授課教師.map((teacher, index) => (
                                    <div key={index}>
                                        <span
                                            className="teacher-name"
                                            onClick={() => handleTeacherClick(teacher)}
                                        >
                                            {teacher}
                                        </span>
                                    </div>
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {showTeacherDetails && selectedTeacher && (
                    <div className="teacher-details">
                        <h3>教師介紹</h3>
                        <p>{selectedTeacher} 的詳細資訊顯示區...</p>
                        <button onClick={() => setShowTeacherDetails(false)}>關閉</button>
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
