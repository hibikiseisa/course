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

  const terms = ['1132', '1131', '1122'];
  const departments = ['資訊管理系', '護理系', '幼保系'];
  const programs = ['四年制', '二年制'];
  const grades = ['一年級', '二年級', '三年級'];
  const coursesList = ['通識必修', '通識選修', '專業必修', '專業選修'];

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
  setCourseDetails(prev => ({ ...prev, [name]: value }));
};


const handleSaveCourse = async () => {
  if (!courseDetails.科目代碼 || !courseDetails.科目中文名稱 || !courseDetails.學分數) {
    alert('請填寫完整的課程資訊');
    return;
  }

  const isDuplicateId = courses.some(
    (course) => course.科目代碼 === courseDetails.科目代碼 && course.科目代碼 !== editingCourse?.科目代碼
  );
  if (isDuplicateId) {
    alert('科目代號重複，請重新輸入');
    return;
  }

  try {
    let updatedCourses;
    if (editingCourse) {
      // 編輯課程
      await axios.put(`http://localhost:5000/api/courses/${editingCourse.科目代碼}`, courseDetails);
      updatedCourses = courses.map(course =>
        course.科目代碼 === editingCourse.科目代碼 ? { ...courseDetails } : course
      );
    } else {
      // 新增課程
      const response = await axios.post('http://localhost:5000/api/courses', courseDetails);
      console.log('課程儲存成功', response.data);  // 顯示伺服器回應的資料
      updatedCourses = [...courses, response.data]; // 使用伺服器回應資料更新 courses
    }

    // 更新狀態
    setCourses(updatedCourses);
    setFilteredCourses(updatedCourses);

    // 清空表單資料
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

    // 關閉模態視窗
    setShowModal(false);
    setEditingCourse(null);
  } catch (error) {
    console.error('儲存課程失敗:', error);
    alert('儲存課程失敗，請稍後再試');
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
    setSelectedCourses(e.target.checked ? courses.map(course => course.id) : []);
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
      await Promise.all(
        selectedCourses.map(async courseId => {
          await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
        })
      );

      const updatedCourses = courses.filter(course => !selectedCourses.includes(course.id));
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setSelectedCourses([]);
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
        (filter.keyword ? course.科目中文名稱.includes(filter.keyword) || course.授課教師姓名.includes(filter.keyword) : true)
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
    <tr key={course._id}>
      <td>
        <input
          type="checkbox"
          checked={selectedCourses.includes(course.id)}
          onChange={() => handleRowSelect(course.id)}
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
            <label>科目代號: <input type="text" name="科目代碼" value={courseDetails.科目代碼} onChange={handleInputChange} required /></label>
<label>課程名稱: <input type="text" name="科目中文名稱" value={courseDetails.科目中文名稱} onChange={handleInputChange} required /></label>
<label>學分: <input type="number" name="學分數" value={courseDetails.學分數} onChange={handleInputChange} required /></label>
<label>系所:
  <select name="系所名稱" value={courseDetails.系所名稱} onChange={handleInputChange}>
    <option value="">選擇系所</option>
    <option value="資訊管理系">資訊管理系</option>
    <option value="護理系">護理系</option>
    <option value="幼保系">幼保系</option>
                  <option value="長期照護系">長期照護系</option>
                  <option value="健康事業管理系">健康事業管理系</option>
                  <option value="護助產及婦女健康系">護助產及婦女健康系</option>
                  <option value="嬰幼兒保育系">嬰幼兒保育系</option>
                  <option value="護理教育曁數位學習系">護理教育曁數位學習系</option>
                  <option value="高齡健康照護系">高齡健康照護系</option>
                  <option value="生死與健康心理諮商系">生死與健康心理諮商系</option>
                  <option value="休閒產業與健康促進系旅遊健康">休閒產業與健康促進系旅遊健康</option>
                  <option value="運動保健系">運動保健系</option>
                  <option value="語言治療與聽力學系">語言治療與聽力學系</option>
                  
                </select>
              </label>
              <label>學期:
                <select name="學期" value={courseDetails.學期} onChange={handleInputChange}>
                  <option value="">選擇學期</option>
                  <option value="1132">1132</option>
                  <option value="1131">1131</option>
                  <option value="1122">1122</option>
                </select>
              </label>
              <label>教師: <input type="text" name="主開課教師姓名" value={courseDetails.主開課教師姓名} onChange={handleInputChange} /></label>
              <label>學制:
                <select name="學制" value={courseDetails.學制} onChange={handleInputChange}>
                  <option value="">選擇學制</option>
                  <option value="學士後系">學士後系</option>
                  <option value="四年制">四年制</option>
                  <option value="二技">二技</option>
                  <option value="二技(三年)">二技(三年)</option>
                  <option value="學士後多元專長">學士後多元專長</option>
                  <option value="學士後學位學程">學士後學位學程</option>
                  <option value="碩士班">碩士班</option>
                  <option value="博士班">博士班</option>

                </select>
              </label>

              <label>年級:
                <select name="年級" value={courseDetails.年級} onChange={handleInputChange}>
                  <option value="">選擇年級</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>

                </select>
              </label>

              <label>課別:
                <select name="課別名稱" value={courseDetails.課別名稱} onChange={handleInputChange}>
                  <option value="">選擇課別</option>
                  <option value="通識必修(通識)">通識必修(通識)</option>
                  <option value="通識選修(通識)">通識選修(通識)</option>
                  <option value="專業必修(系所)">專業必修(系所)</option>
                  <option value="專業選修(系所)">專業選修(系所)</option>
                </select>
              </label>

              <label>備註: <textarea name="課表備註" value={courseDetails.課表備註} onChange={handleInputChange} /></label>

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
