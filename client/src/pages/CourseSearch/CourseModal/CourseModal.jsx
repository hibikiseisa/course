import React from 'react';
import './CourseModal.css'; // 確保添加樣式

const CourseModal = ({ course, onClose, isFavorite, onAddToFavorites }) => {
    if (!course) return null; // 確保 course 存在

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>課程詳情</h2>
                <p><strong>學期：</strong> {course.學期}</p>
                <p><strong>系所代碼：</strong> {course.系所代碼}</p>
                <p><strong>課程名稱：</strong> {course.科目中文名稱}</p>
                <p><strong>教師：</strong> {course.授課教師姓名}</p>
                <p><strong>學分：</strong> {course.學分數}</p>
                <p><strong>教室：</strong> {course.上課地點}</p>

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
