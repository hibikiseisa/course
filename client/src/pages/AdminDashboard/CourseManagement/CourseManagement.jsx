import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './CourseManagement.css';
import up from "/src/assets/up.png";

const CourseManagement = () => {
  const [showButton, setShowButton] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState({
    科目代碼: '',
    科目中文名稱: '',
    學分數: '',
    系所名稱: '',
    主開課教師姓名: '',
    學期: '',
    學制: '',
    年級: '',
    課別名稱: '',
    課程中文摘要: '',
    課程英文摘要: '',
    上課地點: '',
    授課教師姓名: '',
    課表備註: '',
  });
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [filter, setFilter] = useState({ term: '', department: '', keyword: '' });
  const [expandedTeachers, setExpandedTeachers] = useState([]);
  const [errors, setErrors] = useState({});

  const terms = ['1132'];
  const departments = ['資訊管理系', '護理系', '幼保系', '長期照護系', '健康事業管理系', '護助產及婦女健康系', '嬰幼兒保育系', '護理教育曁數位學習系', '高齡健康照護系', '生死與健康心理諮商系', '休閒產業與健康促進系旅遊健康', '運動保健系', '語言治療與聽力學系'];
  const programs = ['學士後系', '四年制', '二技', '二技(三年)', '學士後多元專長', '學士後學位學程', '碩士班', '博士班'];
  const grades = ['一年級', '二年級', '三年級', '四年級'];
  const coursesList = ['通識必修(通識)', '通識選修(通識)', '專業必修(系所)', '專業選修(系所)'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses', {
          params: filter,
        });
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('無法取得課程資料:', error);
      }
    };

    fetchCourses();
  }, [filter]);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

      // 更新課程列表
      const responseCourses = await axios.get('http://localhost:5000/api/courses');
      setCourses(responseCourses.data); // 假設後端有 API 來獲取所有課程
      setFilteredCourses(responseCourses.data);

    } catch (error) {
      console.error('檔案上傳失敗:', error);
      setUploadMessage('檔案上傳失敗，請檢查檔案格式或內容');
    }
  };

  const handleDownloadCSV = () => {
    const csvData = courses.map(course => ({
      科目代碼: course.科目代碼,
      科目中文名稱: course.科目中文名稱,
      學分數: course.學分數,
      課別名稱: course.課別名稱,
      授課教師姓名: course.授課教師姓名,
    }));

    const header = '科目代碼,課程名稱,學分數,課別名稱,授課教師姓名\n';
    const rows = csvData.map(course => `"${course.科目代碼}","${course.科目中文名稱}","${course.學分數}","${course.課別名稱}","${course.授課教師姓名}"`).join('\n');
    const csvContent = '\ufeff' + header + rows;  // 加入 BOM 來確保 UTF-8 編碼

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
    setCourseDetails((prev) => ({
      ...prev,
      [name]: name === '學分數' || name === '年級' ? value.toString() : value,
    }));
  };


  const handleSaveCourse = async () => {
    // 確保所有欄位轉為字串
    const formattedCourseDetails = Object.fromEntries(
      Object.entries(courseDetails).map(([key, value]) => [key, value?.toString() || ''])
    );

    // 驗證必填欄位
    const newErrors = {};
    Object.entries(formattedCourseDetails).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = true; // 如果欄位為空，記錄錯誤
      }
    });

    setErrors(newErrors); // 更新錯誤狀態

    // 如果有錯誤，則中止執行
    if (Object.keys(newErrors).length > 0) {
      alert('請填寫所有必填欄位');
      return;
    }

    try {
      if (editingCourse) {
        // 如果是編輯模式，呼叫 PUT API
        const response = await axios.put(
          `http://localhost:5000/api/courses/${editingCourse._id}`,
          formattedCourseDetails
        );
        console.log('課程更新成功', response.data);

        // 更新前端課程列表
        const updatedCourses = courses.map(course =>
          course._id === editingCourse._id ? response.data : course
        );
        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
      } else {
        // 如果是新增模式，呼叫 POST API
        const response = await axios.post('http://localhost:5000/api/courses', formattedCourseDetails);
        console.log('課程儲存成功', response.data);

        // 更新前端課程列表
        setCourses([...courses, response.data]);
        setFilteredCourses([...filteredCourses, response.data]);
      }

      // 清空表單與錯誤狀態
      setCourseDetails({
        科目代碼: '',
        科目中文名稱: '',
        學分數: '',
        系所名稱: '',
        主開課教師姓名: '',
        學期: '',
        學制: '',
        年級: '',
        課別名稱: '',
        課程中文摘要: '',
        課程英文摘要: '',
        上課地點: '',
        授課教師姓名: '',
        課表備註: '',
      });
      setErrors({});
      setShowModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('儲存課程失敗:', error.response?.data || error.message);
      alert('儲存課程失敗，請檢查資料格式或內容。');
    }
  };




  const handleToggleExpand = (teacherId) => {
    setExpandedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseDetails({ ...course });
    setShowModal(true);
  };


  const handleSelectAll = (e) => {
    setSelectedCourses(e.target.checked ? courses.map(course => course._id) : []);
  };

  const handleRowSelect = (id) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedCourses.length === 0) {
      alert('請選擇至少一項課程進行刪除');
      return;
    }

    try {
      // 使用 Promise.all 確保並行刪除
      await Promise.all(
        selectedCourses.map(async (courseId) => {
          // 假設伺服器使用 _id 作為課程識別
          await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
        })
      );

      // 更新課程列表，過濾掉已刪除的課程
      const updatedCourses = courses.filter(course => !selectedCourses.includes(course._id)); // 使用 _id
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setSelectedCourses([]);  // 清空選擇的課程
    } catch (error) {
      console.error('刪除課程失敗:', error);
      alert('刪除課程失敗，請稍後再試');
    }
  };

  const handleSearch = () => {
    setFilteredCourses(
      courses.filter(course =>
        (filter.term ? course.學期 === filter.term : true) &&
        (filter.department ? course.系所名稱.includes(filter.department) : true) &&
        (filter.keyword ?
          course.科目中文名稱.includes(filter.keyword) ||
          course.授課教師姓名.includes(filter.keyword) : true)
      )
    );
  };

  return (
    <div className="admin-course-management">
      <h2>課程管理</h2>
      <div className="selected-count">
        已選擇 {selectedCourses.length} 筆課程
      </div>

      <div className="controls">
        <div className="button-group">
          <button onClick={handleDeleteSelected} className="delete-button">刪除</button>
          <button
            onClick={() => {
              setEditingCourse(null);  // 確保編輯課程為 null，清空先前編輯資料
              setCourseDetails({
                科目代碼: '',
                科目中文名稱: '',
                學分數: '',
                系所名稱: '',
                主開課教師姓名: '',
                學期: '',
                學制: '',
                年級: '',
                課別名稱: '',
                課程中文摘要: '',
                課程英文摘要: '',
                上課地點: '',
                授課教師姓名: '',
                課表備註: '',
              });
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
              <tr key={course._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => handleRowSelect(course._id)}
                  />
                </td>
                <td>{course.科目代碼}</td>
                <td>{course.科目中文名稱} ({course.學分數})</td>
                <td>{course.系所名稱}</td>
                <td>
                  <span
                    className="teacher-name"
                    onClick={() => handleToggleExpand(course._id)}
                  >
                    {expandedTeachers.includes(course._id)
                      ? course.授課教師姓名
                      : course.授課教師姓名?.length > 6
                        ? course.授課教師姓名.slice(0, 6) + "..."
                        : course.授課教師姓名 || "未提供"}
                  </span>
                </td>
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
              <label>
                科目代碼:
                <input type="text" name="科目代碼" value={courseDetails.科目代碼} onChange={handleInputChange} required />
                {errors['科目代碼'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                科目中文名稱:
                <input type="text" name="科目中文名稱" value={courseDetails.科目中文名稱} onChange={handleInputChange} required />
                {errors['科目中文名稱'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                學分數:
                <input type="number" name="學分數" value={courseDetails.學分數} onChange={(e) => handleInputChange({ target: { name: e.target.name, value: e.target.value.toString() } })} required />
                {errors['學分數'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                系所名稱:
                <select name="系所名稱" value={courseDetails.系所名稱} onChange={handleInputChange}>
                  <option value="">選擇系所</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors['系所名稱'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                主開課教師姓名:
                <input type="text" name="主開課教師姓名" value={courseDetails.主開課教師姓名} onChange={handleInputChange} />
                {errors['主開課教師姓名'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                學期:
                <select name="學期" value={courseDetails.學期} onChange={handleInputChange}>
                  <option value="">選擇學期</option>
                  {terms.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
                {errors['學期'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                學制:
                <select name="學制" value={courseDetails.學制} onChange={handleInputChange}>
                  <option value="">選擇學制</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
                {errors['學制'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                年級:
                <select name="年級" value={courseDetails.年級} onChange={(e) => handleInputChange({ target: { name: e.target.name, value: e.target.value.toString() } })}>
                  <option value="">選擇年級</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors['年級'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                課別名稱:
                <select name="課別名稱" value={courseDetails.課別名稱} onChange={handleInputChange}>
                  <option value="">選擇課別</option>
                  {coursesList.map((courseType) => (
                    <option key={courseType} value={courseType}>{courseType}</option>
                  ))}
                </select>
                {errors['課別名稱'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                課程中文摘要:
                <textarea name="課程中文摘要" value={courseDetails.課程中文摘要} onChange={handleInputChange} />
                {errors['課程中文摘要'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                課程英文摘要:
                <textarea name="課程英文摘要" value={courseDetails.課程英文摘要} onChange={handleInputChange} />
                {errors['課程英文摘要'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                上課地點:
                <input type="text" name="上課地點" value={courseDetails.上課地點} onChange={handleInputChange} />
                {errors['上課地點'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                授課教師姓名:
                <input type="text" name="授課教師姓名" value={courseDetails.授課教師姓名} onChange={handleInputChange} />
                {errors['授課教師姓名'] && <span style={{ color: 'red' }}>*</span>}
              </label>
              <label>
                課表備註:
                <textarea name="課表備註" value={courseDetails.課表備註} onChange={handleInputChange} />
                {errors['課表備註'] && <span style={{ color: 'red' }}>*</span>}
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveCourse} className="add-button">
                {editingCourse ? '修改' : '新增'}
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-button">取消</button>
            </div>

          </div>
        </div>
      )}

      {showButton && (
        <><button
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        ><img src={up} alt="up" className="up-image" />

        </button></>
      )}
    </div>
  );
};

export default CourseManagement;
