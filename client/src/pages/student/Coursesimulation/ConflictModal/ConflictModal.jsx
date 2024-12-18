import React from 'react';
import './ConflictModal.css';

const ConflictModal = ({ conflictInfo, onConfirm, onCancel }) => {
  const { newCourse, conflictingCourses, conflictSlots } = conflictInfo;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>課程衝堂提示</h2>
        <p>
          您選擇的「<strong>{newCourse.科目中文名稱}</strong>」與以下課程衝突：
        </p>
        <ul>
          {conflictingCourses.map((course, index) => (
            <li key={index}>{course}</li>
          ))}
        </ul>
        <p>重複時間：第 <strong>{conflictSlots.join(', ')}</strong> 節</p>
        <div className="modal-actions">
          <button className="confirm-button" onClick={onConfirm}>
            保留新課程
          </button>
          <button className="cancel-button" onClick={onCancel}>
            取消選擇
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
