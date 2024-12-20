import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './CourseManagement.css';

const CourseManagement = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState({
    id: '',
    name: '',
    credits: '',
    department: '',
    teacher: '',
    term: '',        // 新增学期
    program: '',     // 新增学制
    grade: '',//年級
    course: '',//課別
    notes: '',       // 新增课程备注
    file: null,      // 上传课程计划文件
  });
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('courses');
    return savedCourses ? JSON.parse(savedCourses) : [];
  });
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [filter, setFilter] = useState({ term: '', department: '', keyword: '' });

  const terms = ['113上', '112下', '112上'];
  const departments = ['資訊管理系', '護理系', '幼保系'];
  const program = ['四年制', '二年制'];
  const grade = ['一年級', '二年級', '三年級'];
  const course = ['通識必修', '通識選修', '專業必修', '專業選修'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses', {
          params: {
            semester: filter.term,
            keyword: filter.keyword,
            department: filter.department,
          },
        });
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('無法取得課程資料:', error);
      }
    };

    fetchCourses();
  }, [filter]);


  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('請選擇一個 CSV 檔案');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await axios.post('http://localhost:5000/api/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage(response.data.message || '檔案上傳成功');
    } catch (error) {
      console.error('檔案上傳失敗:', error);
      setUploadMessage('檔案上傳失敗，請檢查檔案格式或內容');
    }
  };

  const handleDownloadCSV = () => {
    const csvData = courses.map(course => ({
      id: course.id,
      name: course.name,
      credits: course.credits,
      department: course.department,
      teacher: course.teacher,
    }));

    const header = 'id,name,credits,department,teacher\n';
    const rows = csvData.map(course => `${course.id},${course.name},${course.credits},${course.department},${course.teacher}`).join('\n');
    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCourse = () => {
    if (!courseDetails.id || !courseDetails.name || !courseDetails.credits) {
      alert('請填寫完整的課程資訊');
      return;
    }

    const isDuplicateId = courses.some(
      (course) => course.id === courseDetails.id && course.id !== editingCourse?.id
    );
    if (isDuplicateId) {
      alert('科目代號重複，請重新輸入');
      return;
    }

    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map((course) =>
        course.id === editingCourse.id ? { ...courseDetails } : course
      );
    } else {
      updatedCourses = [...courses, courseDetails];
    }

    // 更新 courses 狀態
    setCourses(updatedCourses);
    // 更新 localStorage，確保課程被保存在本地存儲
    localStorage.setItem('courses', JSON.stringify(updatedCourses));

    // 更新 filteredCourses 根據過濾條件
    setFilteredCourses(
      updatedCourses.filter((course) => {
        return (
          (filter.term ? course.term === filter.term : true) &&
          (filter.department ? course.department.includes(filter.department) : true) &&
          (filter.keyword ? course.name.includes(filter.keyword) || course.teacher.includes(filter.keyword) : true)
        );
      })
    );

    setShowModal(false);
    setEditingCourse(null);
    setCourseDetails({ id: '', name: '', credits: '', department: '', teacher: '', term: '', program: '', notes: '' });
  };
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseDetails({ ...course });
    setShowModal(true);
  };

  const handleRowSelect = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked && courses.length > 0) {
      setSelectedCourses(courses.map((course) => course.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCourses.length === 0) {
      alert('請選擇至少一項課程進行刪除');
      return;
    }
    const updatedCourses = courses.filter((course) => !selectedCourses.includes(course.id));
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));  // 更新 localStorage
    setSelectedCourses([]);
  };

  const handleSearch = () => {
    const result = courses.filter((course) => {
      return (
        (filter.term ? course.term === filter.term : true) &&
        (filter.department ? course.department.includes(filter.department) : true) &&
        (filter.keyword ? course.name.includes(filter.keyword) || course.teacher.includes(filter.keyword) : true)
      );
    });
    setFilteredCourses(result);
  };

  return (
    <div className="admin-course-management">
      <h2>課程管理</h2>

      <div className="controls">
        <div className="button-group">
          <button onClick={handleDeleteSelected} className="delete-button">刪除</button>
          <button
            onClick={() => {
              setEditingCourse(null); // 确保编辑课程为 null
              setShowModal(true);
            }}
            className="handleUpload" // 使用相同的樣式類名
          >
            新增課程
          </button>

          {/* 修改這裡的按鈕類名為 handleUpload 和 handleDownloadCSV */}
          <button onClick={handleUpload} className="handleUpload">匯入</button>
          <button onClick={handleDownloadCSV} className="handleDownloadCSV">匯出</button>
        </div>

        {/* 搜尋欄位代碼保持不變 */}
        <div className="search-group">
          <div className="search-item">
            <label>學期:</label>
            <select value={filter.term} onChange={(e) => setFilter({ ...filter, term: e.target.value })}>
              <option value="">不分學期</option>
              {terms.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
          <div className="search-item">
            <label>系所:</label>
            <select value={filter.department} onChange={(e) => setFilter({ ...filter, department: e.target.value })}>
              <option value="">不分系所</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="search-item">
            <input
              type="text"
              placeholder="課程名稱、教師"
              value={filter.keyword}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            />
          </div>
          <button onClick={handleSearch} className="search-button">搜尋</button>
        </div>
      </div>

      <table className="course-table">
  <thead>
    <tr>
      <th>
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={selectedCourses.length === courses.length && courses.length > 0}
        />
      </th>
      <th>科目代號</th>
      <th>課程名稱 (學分)</th>
      <th>系所</th>
      <th>教師</th>
      <th>編輯</th>
    </tr>
  </thead>
  <tbody>
  {filteredCourses.length > 0 ? (
    filteredCourses.map((course) => (
      <tr key={course.id}> {/* Added the key prop here */}
        <td>
          <input
            type="checkbox"
            checked={selectedCourses.includes(course.id)}
            onChange={() => handleRowSelect(course.id)}
          />
        </td>
        <td>{course.科目代碼}</td>
        <td>{course.科目中文名稱} ({course.學分數})</td>
        <td>{course.系所代碼}</td>
        <td>{course.主開課教師姓名}</td>
        <td>
          <button className="edit-button" onClick={() => handleEditCourse(course)}>編輯</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="no-results">
        無課程
      </td>
    </tr>
  )}
</tbody>
</table>

      <div className="data-count">總共 {filteredCourses.length} 筆資料</div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCourse ? '編輯課程' : '新增課程'}</h3>
            <div className="modal-form">
              <label>科目代號: <input type="text" name="id" value={courseDetails.科目代碼} onChange={handleInputChange} required /></label>
              <label>課程名稱: <input type="text" name="name" value={courseDetails.科目中文名稱} onChange={handleInputChange} required /></label>
              <label>學分: <input type="number" name="credits" value={courseDetails.學分數} onChange={handleInputChange} required /></label>
              <label>系所:
                <select name="department" value={courseDetails.系所代碼} onChange={handleInputChange}>
                  <option value="">選擇系所</option>
                  <option value="資訊管理系">資訊管理系</option>
                  <option value="護理系">護理系</option>
                  <option value="幼保系">幼保系</option>
                </select>
              </label>
              <label>學期:
                <select name="term" value={courseDetails.學期} onChange={handleInputChange}>
                  <option value="">選擇學期</option>
                  <option value="113上">113上</option>
                  <option value="112下">112下</option>
                  <option value="112上">112上</option>
                </select>
              </label>
              <label>教師: <input type="text" name="teacher" value={courseDetails.主開課教師姓名} onChange={handleInputChange} /></label>
              <label>學制:
                <select name="program" value={courseDetails.program} onChange={handleInputChange}>
                  <option value="">選擇學制</option>
                  <option value="四年制">四年制</option>
                  <option value="二年制">二年制</option>
                </select>
              </label>

              <label>年級:
                <select name="grade" value={courseDetails.年級} onChange={handleInputChange}>
                  <option value="">選擇年級</option>
                  <option value="一年級">一年級</option>
                  <option value="二年級">二年級</option>
                  <option value="三年級">三年級</option>
                </select>
              </label>

              <label>課別:
                <select name="course" value={courseDetails.課別名稱} onChange={handleInputChange}>
                  <option value="">選擇課別</option>
                  <option value="通識必修">通識必修</option>
                  <option value="通識選修">通識選修</option>
                  <option value="專業必修">專業必修</option>
                  <option value="專業選修">專業選修</option>
                </select>
              </label>

              <label>備註: <textarea name="notes" value={courseDetails.notes} onChange={handleInputChange} /></label>

              <label>課程計畫:
                <input type="file" name="file" onChange={handleFileChange} />
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveCourse} className="add-button">確定</button>
              <button onClick={() => setShowModal(false)} className="cancel-button">取消</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseManagement;
