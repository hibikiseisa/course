import React, { useState } from 'react';
import './course-simulation.css';

const CourseSimulation = () => {
  const [schedule, setSchedule] = useState({}); // 存放選中的課程
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // 控制編輯模式

  const availableCourses = {
    '第一節\n8:10~9:00': ['英文二 A', '數學一 A'],
    '第二節\n9:10~10:00': ['物理一 A', '化學一 A'],
  };

  const myCourses = ['英文二 A', '物理一 A'];

  const handleAddClick = (day, time) => {
    setSelectedCell({ day, time });
    setPopupVisible(true);
  };

  const handleCourseSelect = (course) => {
    if (selectedCell) {
      const key = `${selectedCell.day}-${selectedCell.time}`;
      setSchedule({ ...schedule, [key]: course });
    }
    setPopupVisible(false);
  };

  const handleCourseRemove = (course) => {
    const updatedSchedule = { ...schedule };
    Object.keys(updatedSchedule).forEach((key) => {
      if (updatedSchedule[key] === course) {
        delete updatedSchedule[key];
      }
    });
    setSchedule(updatedSchedule);
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode); // 切換編輯模式
  };

  return (
    <div className="course-simulation-container">
      <h1 className="title">預選課模擬</h1>

      {/* 編輯課表按鈕 */}
      <button className="editcourse-button" onClick={toggleEditMode}>
        {isEditMode ? '完成編輯' : '編輯課表'}
      </button>

      <table className="schedule-table">
        <thead>
          <tr>
            <th>時間</th>
            {['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'].map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {['第一節\n8:10~9:00', '第二節\n9:10~10:00', '第三節\n10:10~11:00',
            '第四節\n11:10~12:00', '第五節\n12:40~13:30', '第六節\n13:40 ~ 14:30',
            '第七節\n14:40 ~ 15:30', '第八節\n15:40 ~ 16:30', '第九節\n16:40 ~ 17:30', '第十節\n17:40 ~ 18:30'].map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'].map((day) => {
                const key = `${day}-${time}`;
                return (
                  <td key={key}>
                    {schedule[key] ? (
                      <div className={`course-item ${schedule[key].includes('A') ? 'required' : ''}`}>
                        {schedule[key]}
                        {isEditMode && (
                          <span
                            className="remove-course"
                            onClick={() => handleCourseRemove(schedule[key])}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    ) : (
                      isEditMode && (
                        <button
                          className="addcourse-button"
                          onClick={() => handleAddClick(day, time)}
                        >
                          +
                        </button>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <h2>選擇課程</h2>
            <div className="course-section">
              <h3>可選課程</h3>
              <div className="course-options">
                {availableCourses[selectedCell?.time]?.map((course) => (
                  <label key={course}>
                    <input
                      type="radio"
                      name="course"
                      value={course}
                      onChange={() => setSelectedCourse(course)}
                    />
                    {course}
                  </label>
                ))}
              </div>
            </div>
            <div className="course-section">
              <h3>我的收藏名單</h3>
              <div className="course-options">
                {myCourses.map((course) => (
                  <label key={course}>
                    <input
                      type="radio"
                      name="course"
                      value={course}
                      onChange={() => setSelectedCourse(course)}
                    />
                    {course}
                  </label>
                ))}
              </div>
            </div>
            <div className="actions">
              <button className="confirm-button" onClick={() => handleCourseSelect(selectedCourse)}>
                確定
              </button>
              <button className="close-button" onClick={handlePopupClose}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSimulation;
