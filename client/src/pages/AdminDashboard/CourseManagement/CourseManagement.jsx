import axios from 'axios';
import React, { useState } from 'react';
import './CourseManagement.css';

const CourseManagement = () => {
  const [selectedFile, setSelectedFile] = useState(null); // 選中的檔案
  const [uploadMessage, setUploadMessage] = useState(''); // 上傳狀態訊息
  const [showModal, setShowModal] = useState(false); // 控制新增課程視窗
  const [editingCourse, setEditingCourse] = useState(null); // 編輯課程狀態
  const [courseDetails, setCourseDetails] = useState({
    id: '',
    name: '',
    credits: '',
    department: '',
    teacher: '',
  }); // 課程詳細資料
  const [courses, setCourses] = useState([]); // 所有課程資料
  const [selectedCourses, setSelectedCourses] = useState([]); // 儲存被勾選的課程 ID
  const [filter, setFilter] = useState({ term: '', department: '', keyword: '' }); // 篩選條件

  // 學期選項
  const terms = ['113上', '112下', '112上'];

  // 系所選項（這裡使用假資料）
  const departments = ['資訊管理系', '護理系', '幼保系'];

  // 上傳 CSV 檔案
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('請選擇一個 CSV 檔案');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile); 

    try {
      const response = await axios.post('http://localhost:5000/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadMessage(response.data.message || '檔案上傳成功');
    } catch (error) {
      console.error('檔案上傳失敗:', error.response || error);
      setUploadMessage('檔案上傳失敗，請檢查檔案格式或內容');
    }
  };

  // 更新課程詳細資訊
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  // 儲存課程 (新增或更新)
  const handleSaveCourse = () => {
    if (!courseDetails.id || !courseDetails.name || !courseDetails.credits) {
      alert('請填寫完整的課程資訊');
      return;
    }

    if (editingCourse) {
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === editingCourse.id ? { ...courseDetails } : course
        )
      );
    } else {
      setCourses((prevCourses) => [...prevCourses, courseDetails]);
    }

    setShowModal(false);
    setEditingCourse(null);
    setCourseDetails({ id: '', name: '', credits: '', department: '', teacher: '' });
  };

  // 篩選課程
  const handleSearch = () => {
    const filteredCourses = courses.filter((course) => {
      return (
        (filter.term ? course.term === filter.term : true) &&
        (filter.department ? course.department.includes(filter.department) : true) &&
        (filter.keyword ? course.name.includes(filter.keyword) || course.teacher.includes(filter.keyword) : true)
      );
    });

    setCourses(filteredCourses);
    // 搜尋後清除篩選條件並回到新增課程畫面
    setFilter({ term: '', department: '', keyword: '' }); // 重設搜尋欄位
    setShowModal(true); // 顯示新增課程的視窗
  };

  return (
    <div className="admin-course-management">
      <h2>課程管理</h2>

      {/* 匯入 CSV 部分 */}
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-label">匯入 CSV 檔案</label>
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <button onClick={handleUpload} className="upload-button">上傳</button>
        {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
      </div>

      {/* 篩選區 */}
      <div className="filter-section">
        <select
          value={filter.term}
          onChange={(e) => setFilter({ ...filter, term: e.target.value })}
        >
          <option value="">不分學期</option>
          {terms.map((term, index) => (
            <option key={index} value={term}>{term}</option>
          ))}
        </select>

        <select
          value={filter.department}
          onChange={(e) => setFilter({ ...filter, department: e.target.value })}
        >
          <option value="">不分系所</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="課程名稱、教師"
          value={filter.keyword}
          onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
        />

        <button onClick={handleSearch} className="search-button">搜尋</button>
      </div>

      {/* 控制區 */}
      <div className="controls">
        <button onClick={() => setShowModal(true)} className="control-button">
          新增課程
        </button>
        <button onClick={handleDeleteSelected} className="delete-button">
          刪除
        </button>
      </div>

      {/* 課程表格 */}
      <table className="course-table">
        <thead>
          <tr>
            <th>科目代號</th>
            <th>課程名稱 (學分)</th>
            <th>系所</th>
            <th>教師</th>
            <th>編輯</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name} ({course.credits})</td>
                <td>{course.department}</td>
                <td>{course.teacher}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEditCourse(course)}
                  >
                    編輯
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">無課程</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 編輯課程 Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCourse ? '編輯課程' : '新增課程'}</h3>
            <div className="modal-form">
              <label>
                科目代號:
                <input
                  type="text"
                  name="id"
                  value={courseDetails.id}
                  onChange={handleInputChange}
                  placeholder="輸入科目代號"
                  required
                />
              </label>
              <label>
                課程名稱:
                <input
                  type="text"
                  name="name"
                  value={courseDetails.name}
                  onChange={handleInputChange}
                  placeholder="輸入課程名稱"
                  required
                />
              </label>
              <label>
                學分:
                <input
                  type="number"
                  name="credits"
                  value={courseDetails.credits}
                  onChange={handleInputChange}
                  placeholder="輸入學分數"
                  required
                />
              </label>
              <label>
                系所:
                <input
                  type="text"
                  name="department"
                  value={courseDetails.department}
                  onChange={handleInputChange}
                  placeholder="輸入系所名稱"
                />
              </label>
              <label>
                教師:
                <input
                  type="text"
                  name="teacher"
                  value={courseDetails.teacher}
                  onChange={handleInputChange}
                  placeholder="輸入授課教師"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveCourse} className="add-button">
                保存
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-button">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
