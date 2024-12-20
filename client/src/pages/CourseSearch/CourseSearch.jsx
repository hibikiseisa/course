import axios from 'axios';
import React, { useState } from 'react';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import CourseModal from './CourseModal/CourseModal';
import CourseSchedule from './CourseSchedule/CourseSchedule';
import './CourseSearch.css';

const CourseSearch = () => {
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('1132');
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
    const [classCode, setClassCode] = useState('');
    const [className, setClassName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [roomName, setRoomName] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(10);

    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = courses.slice(indexOfFirstResult, indexOfLastResult);
    const totalPages = Math.ceil(courses.length / resultsPerPage);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const departments = [
        "長期照護系",
        "健康事業管理系",
        "護助產及婦女健康系",
        "護理系",
        "嬰幼兒保育系",
        "護理教育暨數位學習系",
        "高齡健康照護系",
        "資訊管理系",
        "生死與健康心理諮商系",
        "休閒產業與健康促進系旅遊健康",
        "運動保健系",
        "語言治療與聽力學系"
    ];

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

        const groupedPeriods = {};
        selectedPeriods.forEach((period) => {
            const [day, timeIndex] = period.split("-");
            if (!groupedPeriods[day]) {
                groupedPeriods[day] = [];
            }
            groupedPeriods[day].push(timeIndex);
        });

        const periodFilter = Object.entries(groupedPeriods)
            .map(([day, periods]) => `${day}-${periods.join(',')}`)
            .join(';');

        const params = {
            semester: selectedSemester,
            keyword: searchKeyword,
            educationLevels: educationLevels.join(','),
            department,
            classType,
            grade,
            teacherName,
            courseCode,
            courseName,
            roomName,
            period: selectedPeriods
        };

        try {
            const response = await axios.get('http://localhost:5000/api/courses', { params });
            setCourses(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
            alert('查詢失敗，請檢查輸入條件或伺服器狀態！');
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
    const databaseFormat = convertSelectedPeriodsToDatabaseFormat(selectedPeriods);
    console.log('Database Format:', JSON.stringify(databaseFormat)); // 確認格式是否正確
    onClose();
    // 確保上層組件使用 JSON.stringify 傳遞節次數據
    props.onPeriodSelect(JSON.stringify(databaseFormat));
};


    const convertWeekdayToChinese = (weekday) => {
        if (!weekday) return "未指定";

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
        const userId = localStorage.getItem('id');

        try {
            const response = await axios.post('http://localhost:5000/api/favorites', {
                userId,
                courseId,
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
                        {/* <option value="1131">1131</option>
                        <option value="1122">1122</option>
                        <option value="1121">1121</option> */}
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
                                <label><input type="checkbox" value="二年制" onChange={handleCheckboxChange} /> 二年制</label>
                                <label><input type="checkbox" value="二年制進修部" onChange={handleCheckboxChange} /> 二年制進修部</label>
                                <label><input type="checkbox" value="四年制" onChange={handleCheckboxChange} /> 四年制</label>
                                <label><input type="checkbox" value="學士後學位學程" onChange={handleCheckboxChange} /> 學士後學位學程</label>        
                                <label><input type="checkbox" value="學士後系" onChange={handleCheckboxChange} />學士後系</label>
                                <label><input type="checkbox" value="碩士班" onChange={handleCheckboxChange} /> 碩士班</label>
                                <label><input type="checkbox" value="博士班" onChange={handleCheckboxChange} /> 博士班</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label>系所</label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">請選擇系所</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="more-form-group">
                            <label>課別</label>
                            <div>
                                <label><input type="radio" name="classType" value="通識必修(通識)" onChange={(e) => setClassType(e.target.value)} /> 通識必修</label>
                                <label><input type="radio" name="classType" value="通識選修(通識)" onChange={(e) => setClassType(e.target.value)} /> 通識選修</label>
                                <label><input type="radio" name="classType" value="專業必修(系所)" onChange={(e) => setClassType(e.target.value)} /> 專業必修</label>
                                <label><input type="radio" name="classType" value="專業選修(系所)" onChange={(e) => setClassType(e.target.value)} /> 專業選修</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label>年級</label>
                            <div>
                                <label><input type="radio" name="grade" value="1" onChange={(e) => setGrade(e.target.value)} /> 一年級</label>
                                <label><input type="radio" name="grade" value="2" onChange={(e) => setGrade(e.target.value)} /> 二年級</label>
                                <label><input type="radio" name="grade" value="3" onChange={(e) => setGrade(e.target.value)} /> 三年級</label>
                                <label><input type="radio" name="grade" value="4" onChange={(e) => setGrade(e.target.value)} /> 四年級</label>
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
                            <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="教師姓名" />
                        </div>

                        <div className="more-form-group">
                            <label>班級</label>
                            <input type="text" value={classCode} onChange={(e) => setClassCode(e.target.value)} placeholder="班級代碼" />
                        </div>

                        <div className="more-form-group">
                            <label>課程</label>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
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
