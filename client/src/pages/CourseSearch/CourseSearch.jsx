import React, { useState } from 'react';
import axios from 'axios';
import './CourseSearch.css';
import { FaAngleDoubleLeft } from "react-icons/fa";
import { FaAngleDoubleRight } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const CourseSearch = () => {
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('1131'); // 預設值
    const [searchKeyword, setSearchKeyword] = useState('');
    const [courses, setCourses] = useState([]);

    // 進階查詢條件
    const [educationLevels, setEducationLevels] = useState([]);
    const [department, setDepartment] = useState('');
    const [classType, setClassType] = useState('');
    const [grade, setGrade] = useState('');
    const [period, setPeriod] = useState('');
    const [courseCategory, setCourseCategory] = useState('');
    const [teacherCode, setTeacherCode] = useState('');
    const [teacherName, setTeacherName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [className, setClassName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [roomName, setRoomName] = useState('');

    const [currentPage, setCurrentPage] = useState(1); // 當前頁數
    const [resultsPerPage, setResultsPerPage] = useState(10); // 每頁顯示
    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = courses.slice(indexOfFirstResult, indexOfLastResult);
    const totalPages = Math.ceil(courses.length / resultsPerPage); // 計算總頁數


    const toggleAdvancedSearch = () => {
        setAdvancedSearch(!advancedSearch);
    };


    const convertWeekdayToChinese = (weekday) => {
        const mapping = {
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六",
            "7": "日"
        };
        return weekday.split(',').map(day => mapping[day] || day).join(', ');
    };
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setEducationLevels((prev) =>
            checked ? [...prev, value] : prev.filter((level) => level !== value)
        );
    };
    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get('http://localhost:5000/api/courses', {
                params: {
                    semester: selectedSemester,
                    keyword: searchKeyword,
                    educationLevels,
                    department,
                    classType,
                    grade,
                    period,
                    courseCategory,
                    teacherCode,
                    teacherName,
                    classCode,
                    className,
                    courseCode,
                    courseName,
                    roomName,
                },
            });
            setCourses(response.data);
            setCurrentPage(1); // 重置为第一页
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    return (
        <div className="course-search-container">
            <h1 className="course-search-title">課程查詢系統</h1>
            <form onSubmit={handleSearch} className="course-search-form">
                <div className="form-group">
                    <label>學年期</label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
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
                                <option value="資訊管理系">資訊管理系</option>
                                <option value="護理系">護理系</option>
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
                                <label><input type="radio" name="grade" value="五年級" onChange={(e) => setGrade(e.target.value)} /> 五年級</label>
                                <label><input type="radio" name="grade" value="六年級" onChange={(e) => setGrade(e.target.value)} /> 六年級</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label>節次</label>
                            <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="課表" />
                        </div>

                        <div className="more-form-group">
                            <label>課程內容分類</label>
                            <select value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)}>
                                <option value="">選擇系所</option>
                                <option value="資訊管理">資訊管理</option>
                                <option value="護理學">護理學</option>
                            </select>
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

            <div>
                {courses.length > 0 && (
                    <>
                        <div className="pagination-controls">
                            <div className="results-per-page">
                                每頁顯示
                                <select
                                    value={resultsPerPage}
                                    onChange={(e) => {
                                        setResultsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // 改变每页显示数后重置到第一页
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                                個結果
                            </div>
                            <div className="pagination-buttons">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                <FaAngleDoubleLeft />
                                </button>
                                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                    &lt; <FaAngleLeft />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(
                                        (page) =>
                                            page === 1 || // 最前頁
                                            page === totalPages || // 最後頁
                                            (page >= currentPage - 2 && page <= currentPage + 2) // 前後各兩頁
                                    )
                                    .map((page) => (
                                        <button
                                            key={page}
                                            className={currentPage === page ? "active" : ""}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                <FaAngleRight /> &gt;
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
                                            <td>四年制/資管系</td>
                                            <td>{course.年級}</td>
                                            <td>{course.核心四碼}</td>
                                            <td>{course.科目中文名稱}</td>
                                            <td>{course.授課教師姓名}</td>
                                            <td>{course.上課人數}</td>
                                            <td>{convertWeekdayToChinese(course.上課星期)} {course.上課節次}</td>
                                            <td>{course.學分數}</td>
                                            <td>{course.課別名稱}</td>
                                            <td><button className="more-button">更多資訊</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default CourseSearch;
