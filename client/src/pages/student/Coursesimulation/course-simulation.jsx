import axios from 'axios';
import { useSnackbar } from 'notistack'; // 引入 useSnackbar
import React, { useEffect, useState } from 'react';
import ConflictModal from './ConflictModal/ConflictModal';
import './course-simulation.css';

const CourseSimulation = () => {
  const [schedule, setSchedule] = useState({}); // 存放選中的課程
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]); // 可選課程
  const [myCourses, setMyCourses] = useState([]); // 收藏課程
  const [isEditMode, setIsEditMode] = useState(false); // 編輯模式狀態
  const [selectedWeekday, setSelectedWeekday] = useState(''); // 存放當前選擇的星期
  const [selectedPeriod, setSelectedPeriod] = useState(''); // 存放當前選擇的節次
  const [conflictInfo, setConflictInfo] = useState(null); // 正確初始化
  const [originalSchedule, setOriginalSchedule] = useState({});
  const [expandedTeachers, setExpandedTeachers] = useState([]);
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const { enqueueSnackbar } = useSnackbar(); // 使用 enqueueSnackbar 顯示通知

  const userId = localStorage.getItem('id') || 'defaultUserId';

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/schedule/${userId}`);
        console.log('後端返回的課表資料:', response.data);

        const formattedSchedule = {};
        response.data.forEach((item) => {
          item.timeSlots.forEach((slot) => {
            const key = `星期${item.day}-第${slot}節`;
            formattedSchedule[key] = {
              courseId: item.courseId, // 課程ID
              courseName: item.courseName, // 課程名稱
              teacher: item.teacher,// 授課教師（可選）
            };
          });
        });

        console.log('格式化後的課表:', formattedSchedule);
        setSchedule(formattedSchedule);
        setOriginalSchedule(formattedSchedule);
      } catch (error) {
        console.error('獲取課表失敗:', error);
      }
    };

    if (userId) {
      fetchSchedule();
    }
  }, [userId]);

  // 儲存課表到後端
  const saveSchedule = async () => {
    const formattedSchedule = Object.entries(schedule).map(([key, value]) => {
      const [dayPart, periodPart] = key.split('-');
      const day = dayPart.replace('星期', ''); // 星期轉成數字
      const period = periodPart.replace('第', '').replace('節', ''); // 移除多餘文字

      return {
        courseId: value.courseId, // 使用 courseId 傳回後端
        day: day,
        timeSlots: [period],
      };
    });

    console.log('送出的課表資料:', JSON.stringify(formattedSchedule, null, 2));

    try {
      const response = await axios.post('http://localhost:5000/api/schedule', {
        userId,
        schedule: formattedSchedule,
      });
      if (response.status === 200) {
        enqueueSnackbar('課表已成功儲存！',{ variant: 'success' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      }
    } catch (error) {
      console.error('課表儲存失敗:', error);
      enqueueSnackbar('儲存課表時發生錯誤',{ variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };


  // 打開課程選擇視窗並發送 API 請求
  const handleAddClick = async (dayIndex, periodIndex) => {
    const weekday = (dayIndex + 1).toString(); // 星期 1~7
    const period = (periodIndex + 1).toString(); // 節次 1~10

    setSelectedWeekday(weekday);
    setSelectedPeriod(period);

    try {
      const userId = localStorage.getItem('id'); // 獲取當前使用者ID
      const [coursesResponse, favoritesResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${weekday}/${period}`),
        axios.get(`http://localhost:5000/api/favorites/${userId}/${weekday}/${period}`),
      ]);

      setAvailableCourses(coursesResponse.data); // 設置可選課程
      setMyCourses(favoritesResponse.data); // 設置收藏課程
      setPopupVisible(true);
    } catch (error) {
      console.error('獲取課程失敗:', error);
      enqueueSnackbar('獲取課程失敗，請重試！',{ variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };

  // 動態篩選課程
  const filteredCourses = favoriteCourses.filter((favorite) => {
    const course = favorite.courseId;

    // 檢查 course 是否存在且屬性有效
    if (!course || !course.上課星期 || !course.上課節次) {
      console.warn(`跳過無效的課程: ${JSON.stringify(course)}`);
      return false;
    }

    return (
      course.上課星期 === day &&
      course.上課節次.split(',').includes(timeSlot)
    );
  });

  const handleCourseSelect = (course) => {
    const selected = availableCourses.find((c) => c._id === course._id) || course;

    const newTimeSlots = selected.上課節次.split(',');
    const conflictSlots = [];
    const conflictingCourses = [];

    newTimeSlots.forEach((slot) => {
      const key = `星期${selectedWeekday}-第${slot}節`;
      if (schedule[key]) {
        conflictSlots.push(slot);
        conflictingCourses.push(schedule[key]); // 確保 schedule[key] 是一個完整的物件
      }
    });

    if (conflictSlots.length > 0) {
      setConflictInfo({ newCourse: selected, conflictingCourses, conflictSlots });
      console.log('衝堂資訊:', { newCourse: selected, conflictingCourses, conflictSlots }); // Debug
      console.log('衝堂視窗資料:', conflictInfo);
    } else {
      addCourseToSchedule(selected, newTimeSlots);
    }
  };




  // 新增: 處理課程加入課表
  const addCourseToSchedule = (course, timeSlots) => {
    const updatedSchedule = { ...schedule };

    timeSlots.forEach((slot) => {
      const key = `星期${selectedWeekday}-第${slot}節`;
      updatedSchedule[key] = {
        courseId: course._id || course.courseId, // 確保 ID 正確
        courseName: course.科目中文名稱 || course.courseName, // 顯示用名稱
        teacher: course.授課教師姓名 || course.teacher,       // 顯示用教師
      };
    });

    setSchedule(updatedSchedule);
    setPopupVisible(false);
    setConflictInfo(null);
  };



  // 新增: 用戶確認取代衝堂課程

  const handleConfirmReplace = () => {
    if (!conflictInfo) return;

    const { newCourse, conflictingCourses } = conflictInfo;

    // 刪除所有衝堂課程
    conflictingCourses.forEach((conflictingCourse) => {
      Object.keys(schedule).forEach((key) => {
        if (schedule[key].courseId === conflictingCourse.courseId) {
          delete schedule[key];
        }
      });
    });

    // 加入新課程
    addCourseToSchedule(newCourse, newCourse.上課節次.split(','));

    // 清除衝堂資訊
    setConflictInfo(null);
  };




  // 新增: 用戶取消選擇新課程
  const handleCancelReplace = () => {
    setConflictInfo(null);
    setPopupVisible(false);
    setSelectedCourse(null);
  };


  const handleCourseRemove = (key) => {
    const courseToRemove = schedule[key];
    const updatedSchedule = { ...schedule };

    // 移除該課程的所有節次
    Object.keys(updatedSchedule).forEach((scheduleKey) => {
      if (updatedSchedule[scheduleKey].courseId === courseToRemove.courseId) {
        delete updatedSchedule[scheduleKey];
      }
    });

    setSchedule(updatedSchedule);

    // 標記該課程為刪除，等待完成編輯時同步到資料庫
    setDeletedCourses((prev) => [...prev, courseToRemove.courseId]);
  };

  const toggleEditMode = () => {
    setIsEditMode((prevEditMode) => {
      if (prevEditMode) {
        // 如果正在切換到「完成編輯」，保存課表到後端
        saveSchedule(schedule);
      }
      return !prevEditMode;
    });
  };
  const clearSchedule = () => {
    setSchedule({});
    enqueueSnackbar('課表已清空！',{ variant: 'info' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
  };

  const cancelEdit = () => {
    setSchedule(originalSchedule); // 恢復到初始狀態
    setIsEditMode(false);
    enqueueSnackbar('更改已取消，恢復到原始課表！',{ variant: 'info' , autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
  };
  const filteredMyCourses = (myCourses || []).filter(
    (course) =>
      course.科目中文名稱?.includes(searchKeyword) || course.授課教師姓名?.includes(searchKeyword)
  );

  const filteredAvailableCourses = (availableCourses || []).filter(
    (course) =>
      course.科目中文名稱?.includes(searchKeyword) || course.授課教師姓名?.includes(searchKeyword)
  );

  const handleToggleExpand = (courseId) => {
    setExpandedTeachers((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="course-simulation-container">
      <h1 className="title">預選課模擬</h1>

      {/* 編輯模式切換按鈕 */}
      <div className="actions">
        <button className="editcourse-button" onClick={toggleEditMode}>
          {isEditMode ? '完成編輯' : '編輯課表'}
        </button>
        {isEditMode && (
          <>
            <button className="cancel-edit-button" onClick={cancelEdit}>
              取消編輯
            </button>
            <button className="clear-schedule-button" onClick={clearSchedule}>
              清除課表
            </button>
          </>
        )}
      </div>
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
          {[
            '第一節\n8:10~9:00', '第二節\n9:10~10:00', '第三節\n10:10~11:00',
            '第四節\n11:10~12:00', '第五節\n12:40~13:30', '第六節\n13:40~14:30',
            '第七節\n14:40~15:30', '第八節\n15:40~16:30', '第九節\n16:40~17:30', '第十節\n17:40~18:30',
          ].map((time, periodIndex) => (
            <tr key={time}>
              <td>
                {time.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </td>
              {['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'].map((day, dayIndex) => {
                const key = `星期${dayIndex + 1}-第${periodIndex + 1}節`;
                return (
                  <td key={key}>
                    {schedule[key] ? (
                      <div className="course-item">
                        <div>{schedule[key].courseName}</div> {/* 顯示課程名稱 */}
                        <div>
                          <span
                            className="teacher-name"
                            onClick={() => handleToggleExpand(key)}
                          >
                            {expandedTeachers.includes(key)
                              ? schedule[key].teacher
                              : schedule[key].teacher?.length > 7
                                ? `${schedule[key].teacher.slice(0, 7)}...`
                                : schedule[key].teacher}
                          </span>
                        </div>
                        {isEditMode && (
                          <span
                            className="remove-course"
                            onClick={() => handleCourseRemove(key)}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    ) : (
                      isEditMode && (
                        <button
                          className="addcourse-button"
                          onClick={() => handleAddClick(dayIndex, periodIndex)}
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

      {/* 彈出視窗 */}
      {popupVisible && (
<div className="popup">
  <div className="popup-content">
    <h2>選擇課程</h2>

    <div className="form-group">
      <label htmlFor="keyword-search">關鍵字查詢</label>
      <input
        id="keyword-search"
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="請輸入課程名稱或教師名稱"
      />
    </div>

    <div className="course-section">
      <h3>我的收藏課程</h3>
      {filteredMyCourses.length > 0 ? (
        <table className="favorites-table">
          <thead className="table-header">
            <tr>
              <th>選擇</th>
              <th>課程名稱</th>
              <th>授課教師</th>
              <th>節次</th>
            </tr>
          </thead>
          <tbody>
            {filteredMyCourses.map((course, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="radio"
                    name="selectedFavoriteCourse"
                    value={course._id}
                    onChange={() => setSelectedCourse(course)}
                  />
                </td>
                <td>{course.科目中文名稱}</td>
                <td>
                  <span
                    className="teacher-name"
                    onClick={() => handleToggleExpand(course._id)}
                  >
                    {expandedTeachers.includes(course._id)
                      ? course.授課教師姓名
                      : course.授課教師姓名?.length > 3
                        ? course.授課教師姓名.slice(0, 3) + "..."
                        : course.授課教師姓名}
                  </span>
                </td>
                <td>{course.上課節次}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>沒有符合條件的收藏課程</p>
      )}
    </div>

    <div className="course-section">
      <h3>可選課程</h3>
      <table className="course-selection-table">
        <thead className="table-header">
          <tr>
            <th>選擇</th>
            <th>課程名稱</th>
            <th>授課教師</th>
            <th>節次</th>
          </tr>
        </thead>
        <tbody>
          {filteredAvailableCourses?.length > 0 ? (
            filteredAvailableCourses.map((course, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="radio"
                    name="selectedCourse"
                    value={course._id}
                    onChange={() => setSelectedCourse(course)}
                  />
                </td>
                <td>{course.科目中文名稱}</td>
                <td>
                  <span
                    className="teacher-name"
                    onClick={() => handleToggleExpand(course._id)}
                  >
                    {expandedTeachers.includes(course._id)
                      ? course.授課教師姓名
                      : course.授課教師姓名?.length > 3
                        ? course.授課教師姓名.slice(0, 3) + "..."
                        : course.授課教師姓名}
                  </span>
                </td>
                <td>{course.上課節次}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">沒有符合條件的課程</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="actions">
      <button onClick={() => handleCourseSelect(selectedCourse)}>確定</button>
      <button onClick={() => setPopupVisible(false)}>取消</button>
    </div>
  </div>
</div>
      )}
      {/* 衝堂視窗 */}
      {conflictInfo && (
        <ConflictModal
          conflictInfo={conflictInfo}
          onConfirm={handleConfirmReplace}
          onCancel={handleCancelReplace}
        />
      )}


    </div>
  );
};

export default CourseSimulation;
