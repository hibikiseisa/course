import axios from 'axios';
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useState } from 'react';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import CourseModal from './CourseModal/CourseModal';
import CourseSchedule from './CourseSchedule/CourseSchedule';
import './CourseSearch.css';

const departmentCategories = [
    { code: '431', name: '人工智慧與健康大數據研究系' },
    { code: '308', name: '國際運動科學專班系' },
    { code: '331', name: '生死與健康心理諮商系' },
    { code: '231', name: '休閒產業與健康促進系' },
    { code: '241', name: '長期照護系' },
    { code: '131', name: '高齡健康照護系' },
    { code: '211', name: '健康事業管理系' },
    { code: '201', name: '健康科技學院系' },
    { code: '268', name: '國際健康科技碩士學程系' },
    { code: '421', name: '智慧健康科技' },
    { code: '221', name: '資訊管理系' },
    { code: '321', name: '運動保健系' },
    { code: '251', name: '語言治療與聽力學系' },
    { code: '311', name: '嬰幼兒保育系' },
    { code: '1D1', name: '醫護教育暨數位學習系' },
    { code: '1C1', name: '護理助產及婦女健康系' },
    { code: '111', name: '護理系' },
    { code: '114', name: '護理系碩士在職專班' },
    { code: '112', name: '進修部護理系' },
    { code: '113', name: '夜間部護理系' },
];
const CourseSearch = () => {
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('1131');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [courses, setCourses] = useState([]);
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [selectedPeriods, setSelectedPeriods] = useState([]);

    const [educationLevels, setEducationLevels] = useState([]);
    const [department, setDepartment] = useState('');
    const [classType, setClassType] = useState('');
    const [grade, setGrade] = useState('');
    const [teacherCode, setTeacherCode] = useState('');
    const [teacherName, setTeacherName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [className, setClassName] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(10);
    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = courses.slice(indexOfFirstResult, indexOfLastResult);

    const totalPages = Math.ceil(courses.length / resultsPerPage);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const toggleAdvancedSearch = () => {
        setAdvancedSearch(!advancedSearch);
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setEducationLevels((prev) =>
            checked ? [...prev, value] : prev.filter((level) => level !== value)
        );
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        // 組成查詢參數
        const params = {
            semester: selectedSemester,
            keyword: searchKeyword,
            educationLevels: educationLevels.join(','), // 將陣列轉成逗號分隔字串
            department, // 系所代碼
            classType,  // 課別名稱
            grade,      // 年級
            teacherName, // 授課教師姓名
            courseCode,  // 科目代碼
            courseName,  // 科目中文名稱
            roomName,    // 教室名稱
            period: selectedPeriods.join(',') // 上課節次
        };

        try {
            const response = await axios.get('http://localhost:5000/api/courses', { params });
            setCourses(response.data); // 設置查詢結果
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]); // 清空結果
            alert('查詢失敗，請檢查輸入條件或伺服器狀態！');
        }
    };

// 匯出功能處理函式
const handleExport = (format) => {
    if (courses.length === 0) {
        alert('請先進行查詢後再匯出！');
        return;
    }

    if (format === 'csv') {
        const csvContent = courses.map(course =>
            [course.學期, course.系所代碼, course.科目中文名稱, course.授課教師姓名].join(',')
        ).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'courses.csv';
        link.click();
    } else if (format === 'pdf') {
        const pdf = new jsPDF();
        pdf.text('課程資料匯出', 20, 20);
        pdf.autoTable({
            head: [['學期', '系所代碼', '課程名稱', '授課教師']],
            body: courses.map(course => [
                course.學期,
                course.系所代碼,
                course.科目中文名稱,
                course.授課教師姓名
            ]),
        });
        pdf.save('courses.pdf');
    } else if (format === 'odt') {
        const odtContent = `<xml version="1.0" encoding="UTF-8">
            <office:document><body><table>`;
        const rows = courses.map(course =>
            `<tr><td>${course.學期}</td><td>${course.系所代碼}</td><td>${course.科目中文名稱}</td></tr>`
        ).join('');
        const finalContent = odtContent + rows + `</table></body></office:document>`;
        const blob = new Blob([finalContent], { type: 'application/vnd.oasis.opendocument.text' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'courses.odt';
        link.click();
        }  
};

    const handlePeriodClick = (day, period) => {
        const selected = `${day}-${period}`;
        setSelectedPeriods((prev) =>
            prev.includes(selected)
                ? prev.filter((item) => item !== selected)
                : [...prev, selected]
        );
    };

    const handlePeriodSubmit = () => {
        setIsPeriodModalOpen(false);
    };
    const convertWeekdayToChinese = (weekday) => {
        if (!weekday) return "未指定"; // 如果為 undefined 或 null，返回預設值「未指定」

        const mapping = {
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六",
            "7": "日",
        };
        return weekday.split(',').map((day) => mapping[day] || day).join(', ');
    };
    const openMoreInfo = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };
    const handleAddToFavorites = async (courseId) => {
        const userId = localStorage.getItem('id'); // 從 localStorage 獲取用戶ID
    
        try {
            const response = await axios.post('http://localhost:5000/api/favorites', {
                userId,
                courseId, // 傳遞課程唯一ID
            });
            alert(response.data.message);
        } catch (error) {
            console.error('收藏失敗:', error);
            alert('收藏失敗，請重試');
        }
    };
    
    

    return (
        <div className="course-search-container">
            <h1 className="course-search-title">課程查詢系統</h1>
            <form onSubmit={handleSearch} className="course-search-form">
                <div className="form-group">
                    <label>學年期</label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                        <option value="1132">1132</option>
                        <option value="1131">1131</option>
                        <option value="1122">1122</option>
                        <option value="1121">1121</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>關鍵字查詢</label>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="請輸入關鍵字"
                    />
                </div>

                <div className="form-group">
                    <button type="button" onClick={toggleAdvancedSearch} className="toggle-button">
                        {advancedSearch ? '簡易查詢' : '進階查詢'}
                    </button>
                </div>
{/* 新增匯出按鈕 */}
<div className="form-group export-buttons">
<div>
                <button onClick={() => handleExport('csv')}>匯出 CSV</button>
                <button onClick={() => handleExport('pdf')}>匯出 PDF</button>
                <button onClick={() => handleExport('odt')}>匯出 ODT</button>
            </div>
                </div>
                {advancedSearch && (
                    <div className="advanced-search-vertical">
                        <div className="more-form-group">
                            <label>學制</label>
                            <div>
                                <label><input type="checkbox" value="二技" onChange={handleCheckboxChange} /> 二技</label>
                                <label><input type="checkbox" value="二技(三年)" onChange={handleCheckboxChange} /> 二技(三年)</label>
                                <label><input type="checkbox" value="四技" onChange={handleCheckboxChange} /> 四技</label>
                                <label><input type="checkbox" value="學士後專長" onChange={handleCheckboxChange} /> 學士後專長</label>
                                <label><input type="checkbox" value="碩士班" onChange={handleCheckboxChange} /> 碩士班</label>
                                <label><input type="checkbox" value="博士班" onChange={handleCheckboxChange} /> 博士班</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label>系所</label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">請選擇系所</option>
                                {departmentCategories.map((dept) => (
                                    <option key={dept.code} value={dept.code}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="more-form-group">
                            <label>課別</label>
                            <div>
                                <label><input type="radio" name="classType" value="通識必修" onChange={(e) => setClassType(e.target.value)} /> 通識必修</label>
                                <label><input type="radio" name="classType" value="通識選修" onChange={(e) => setClassType(e.target.value)} /> 通識選修</label>
                                <label><input type="radio" name="classType" value="專業必修" onChange={(e) => setClassType(e.target.value)} /> 專業必修</label>
                                <label><input type="radio" name="classType" value="專業選修" onChange={(e) => setClassType(e.target.value)} /> 專業選修</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label>年級</label>
                            <div>
                                <label><input type="radio" name="grade" value="一年級" onChange={(e) => setGrade(e.target.value)} /> 一年級</label>
                                <label><input type="radio" name="grade" value="二年級" onChange={(e) => setGrade(e.target.value)} /> 二年級</label>
                                <label><input type="radio" name="grade" value="三年級" onChange={(e) => setGrade(e.target.value)} /> 三年級</label>
                                <label><input type="radio" name="grade" value="四年級" onChange={(e) => setGrade(e.target.value)} /> 四年級</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label>節次</label>
                            <button type="button" onClick={() => setIsPeriodModalOpen(true)} className="period-button">
                                課表
                            </button>
                        </div>

                        <div className="more-form-group">
                            <label>教師</label>
                            <input type="text" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} placeholder="教師代碼" />
                            <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="教師姓名" />
                        </div>

                        <div className="more-form-group">
                            <label>班級</label>
                            <input type="text" value={classCode} onChange={(e) => setClassCode(e.target.value)} placeholder="班級代碼" />
                            <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="班級名稱" />
                        </div>

                        <div className="more-form-group">
                            <label>課程</label>
                            <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="課程代碼" />
                            <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="課程名稱" />
                        </div>

                        <div className="more-form-group">
                            <label>教室</label>
                            <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="教室名稱" />
                        </div>
                    </div>
                )}
                <button type="submit" className="search-button">查詢</button>
            </form>

            <CourseSchedule
                isOpen={isPeriodModalOpen}
                onClose={() => setIsPeriodModalOpen(false)}
                selectedPeriods={selectedPeriods}
                setSelectedPeriods={setSelectedPeriods}
            />
            {courses.length > 0 && (
                <>
                    <div className="pagination-controls">
                        <div className="results-per-page">
                            <h4>每頁顯示</h4>
                            <select
                                value={resultsPerPage}
                                onChange={(e) => {
                                    setResultsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            <h4>個結果</h4>
                        </div>
                        <div className="pagination-buttons">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                <FaAngleDoubleLeft />
                            </button>
                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                <FaAngleLeft />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2))
                                .map((page) => (
                                    <button
                                        key={page}
                                        className={currentPage === page ? 'active' : ''}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                <FaAngleRight />
                            </button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                <FaAngleDoubleRight />
                            </button>
                        </div>
                        <div className="jump-to-page">
                            跳至頁數
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                    const page = Number(e.target.value);
                                    if (page >= 1 && page <= totalPages) setCurrentPage(page);
                                }}
                            />
                        </div>
                    </div>

                    <div className="course-results">
                        <table className="course-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>學期</th>
                                    <th>學制/系所</th>
                                    <th>年級</th>
                                    <th>科目代碼</th>
                                    <th>課程名稱</th>
                                    <th>教師</th>
                                    <th>上課人數</th>
                                    <th>上課時間/節次</th>
                                    <th>學分</th>
                                    <th>課別</th>
                                    <th>更多</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentResults.map((course, index) => (
                                    <tr key={course._id}>
                                        <td>{index + 1}</td>
                                        <td>{course.學期}</td>
                                        <td>{course.系所代碼}</td>
                                        <td>{course.年級}</td>
                                        <td>{course.核心四碼}</td>
                                        <td>{course.科目中文名稱}</td>
                                        <td>{course.授課教師姓名}</td>
                                        <td>{course.上課人數}</td>
                                        <td>{convertWeekdayToChinese(course.上課星期)} {course.上課節次}</td>
                                        <td>{course.學分數}</td>
                                        <td>{course.課別名稱}</td>
                                        <td>
                                            <button onClick={() => openMoreInfo(course)} className="more-button">
                                                更多資訊
                                            </button>
                                        </td>                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {/* 更多資訊視窗 */}
            {isModalOpen && selectedCourse && (
               <CourseModal
               course={selectedCourse}
               onClose={closeModal}
               onAddToFavorites={handleAddToFavorites}
           />
            )}
        </div>
    );
};

export default CourseSearch;
