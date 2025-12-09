import axios from 'axios';
import 'jspdf-autotable';
import { useSnackbar } from 'notistack'; // 使用通知系統
import { useEffect, useState } from 'react';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import ods from "../../assets/ods.png"; // 确保图片路径正确
import pdf from "../../assets/pdf.png"; // 确保图片路径正确
import up from "../../assets/up.png"; // 确保图片路径正确
import xlsx from "../../assets/xlsx.png"; // 确保图片路径正确
import CourseModal from '../CourseSearch/CourseModal/CourseModal';
import '../CourseSearch/CourseSearch.css';

const CourseSearch = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false); // 新增 loading 狀態
    const [showButton, setShowButton] = useState(false);
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('1132');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [selectedPeriods, setSelectedPeriods] = useState([]);
    const { enqueueSnackbar } = useSnackbar(); // 引入通知
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
    const currentResults = courses?.slice(indexOfFirstResult, indexOfLastResult) || [];
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

    const [expandedTeachers, setExpandedTeachers] = useState([]);


    const handleToggleExpand = (teacherId) => {
        setExpandedTeachers((prev) =>
            prev.includes(teacherId)
                ? prev.filter((id) => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const getBackgroundColor = (courseName) => {
        // 根據課別名稱設置不同顏色
        switch (courseName) {
            case '通識必修(通識)':
                return 'lightblue';
            case '通識選修(通識)':
                return 'lightgreen';
            case '專業必修(系所)':
                return 'lightyellow';
            case '專業選修(系所)':
                return 'lightpink';
            default:
                return 'lightgray'; // 默認顏色
        }
    };

    const toggleAdvancedSearch = () => {
        setAdvancedSearch(!advancedSearch);
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setEducationLevels((prev) =>
            checked ? [...prev, value] : prev.filter((level) => level !== value)
        );
    };
    useEffect(() => {
        const handleScroll = () => {
            setShowButton(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
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

        setLoading(true); // 設置 loading 為 true
        try {
            const response = await axios.get('http://localhost:5000/api/courses', { params });
            console.log('API Response:', response.data);

            if (response.data && Array.isArray(response.data)) {
                const filteredCourses = selectedPeriods.length > 0
                    ? response.data.filter(course => {
                        const coursePeriods = course.上課星期 && course.上課節次
                            ? course.上課節次.split(',').map(period => `${course.上課星期}-${period}`)
                            : [];
                        return coursePeriods.some(period => selectedPeriods.includes(period));
                    })
                    : response.data;

                setCourses(filteredCourses); // 更新課程資料

                if (filteredCourses.length === 0) {
                    enqueueSnackbar('無符合的查詢結果', { variant: 'info', autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } }); // 顯示通知
                }
            } else {
                setCourses([]);
                enqueueSnackbar('無符合的查詢結果', { variant: 'info', autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } }); // 顯示通知
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
            enqueueSnackbar('查詢失敗，請檢查伺服器狀態！', { variant: 'error', autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } }); // 顯示錯誤通知
        } finally {
            setLoading(false); // 完成後設置 loading 為 false
        }
    };

    // 匯出功能處理函式
    const handleExport = (format) => {
        if (courses.length === 0) {
            alert('請先進行查詢後再匯出！');
            return;
        }

        if (format === 'csv') {
            const csvData = courses.map(course => ({
                學期: course.學期,
                主開課教師姓名: course.主開課教師姓名,
                課程全碼: course.課程全碼,
                系所代碼: course.系所代碼,
                系所名稱: course.系所名稱,
                學制: course.學制,
                科目代碼: course.科目代碼,
                科目組別: course.科目組別,
                年級: course.年級,
                上課班組: course.上課班組,
                科目中文名稱: course.科目中文名稱,
                科目英文名稱: course.科目英文名稱,
                // 如果授課教師姓名是陣列，將其用逗號分隔；否則直接使用
                授課教師姓名: Array.isArray(course.授課教師姓名)
                    ? course.授課教師姓名.join(', ') // 若是陣列，將其連接成字符串
                    : course.授課教師姓名, // 若不是陣列，直接使用原始字符串
                學分數: course.學分數,
                上課週次: course.上課週次,
                課別代碼: course.課別代碼,
                課別名稱: course.課別名稱,
                上課地點: course.上課地點,
                上課星期: course.上課星期,
                上課節次: course.上課節次,
                課表備註: course.課表備註,
                課程中文摘要: course.課程中文摘要,
                課程英文摘要: course.課程英文摘要
            }));

            // 定義 CSV 標題
            const header = '學期,主開課教師姓名,課程全碼,系所代碼,系所名稱,學制,科目代碼,科目組別,年級,上課班組,科目中文名稱,科目英文名稱,授課教師姓名,學分數,上課週次,課別代碼,課別名稱,上課地點,上課星期,上課節次,備註,課程中文摘要,課程英文摘要\n';
            // 生成 CSV 行數據
            const rows = csvData.map(course => `"${course.學期}","${course.主開課教師姓名}","${course.課程全碼}","${course.系所代碼}","${course.系所名稱}","${course.學制}","${course.科目代碼}","${course.科目組別}","${course.年級}","${course.上課班組}","${course.科目中文名稱}","${course.科目英文名稱}","${course.授課教師姓名}","${course.學分數}","${course.上課週次}","${course.課別代碼}","${course.課別名稱}","${course.上課地點}","${course.上課星期}","${course.上課節次}","${course.課表備註}","${course.課程中文摘要}","${course.課程英文摘要}"`).join('\n');
            // 合併標題和資料並加入 BOM
            const csvFileContent = `\ufeff${header}${rows}`;

            // 創建 Blob 並提供下載
            const blob = new Blob([csvFileContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'courses.csv';
            link.click();
            URL.revokeObjectURL(url); // 釋放 URL

        } else if (format === 'pdf') {
            const pdfURL = '/course.pdf'; // 使用相對於伺服器根目錄的路徑
            window.open(pdfURL, '_blank'); // 在新標籤頁中打開 PDF
        }
        else if (format === 'ods') {
            const odsURL = '/course.ods'; // 使用相對於伺服器根目錄的路徑
            window.open(odsURL, '_blank'); // 在新標籤頁中打開 ODS 文件
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
            "1": "星期一",
            "2": "星期二",
            "3": "星期三",
            "4": "星期四",
            "5": "星期五",
            "6": "星期六",
            "7": "星期日",
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
    const handleClearFilters = () => {
        setSelectedSemester('');
        setSearchKeyword('');
        setEducationLevels([]);
        setDepartment('');
        setClassType('');
        setGrade('');
        setTeacherCode('');
        setTeacherName('');
        setClassCode('');
        setClassName('');
        setCourseCode('');
        setCourseName('');
        setRoomName('');
        setSelectedPeriods([]);
    };

    const handleClassTypeChange = (value) => {
        setClassType((prevValue) => (prevValue === value ? '' : value));
    };
    const handleGradeChange = (value) => {
        setGrade((prevValue) => (prevValue === value ? '' : value));
    };
    const handleWeekdayChange = (weekday, isChecked) => {
        if (isChecked) {
            // 勾選該星期，記錄為單獨的星期
            setSelectedPeriods((prev) => [...prev, `${weekday}`]);
        } else {
            // 取消勾選，移除該星期及其相關的節次
            setSelectedPeriods((prev) =>
                prev.filter((period) => !period.startsWith(`${weekday}-`) && period !== `${weekday}`)
            );
        }
    };


    const handlePeriodChange = (period, isChecked) => {
        const selectedWeekdays = selectedPeriods.filter((p) => /^[1-7]$/.test(p)); // 已選的星期

        if (isChecked) {
            // 若勾選該節次，將節次加到已選的星期中
            setSelectedPeriods((prev) => [
                ...prev,
                ...selectedWeekdays.map((weekday) => `${weekday}-${period}`),
            ]);
        } else {
            // 若取消勾選，移除相關節次
            setSelectedPeriods((prev) =>
                prev.filter((p) => !p.endsWith(`-${period}`))
            );
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
                {/* 新增匯出按鈕 */}
                <div className="form-group export-buttons">
                    <button type="button" onClick={() => handleExport('csv')} disabled={courses.length === 0}>
                        <img src={xlsx} alt="xlsx" className="xlsx-image" />匯出 xlsx
                    </button>

                    <button type="button" onClick={() => handleExport('pdf')} disabled={courses.length === 0}>
                        <img src={pdf} alt="pdf" className="pdf-image" /> 匯出 PDF
                    </button>

                    <button type="button" onClick={() => handleExport('ods')} disabled={courses.length === 0}>
                        <img src={ods} alt="ods" className="ods-image" />匯出 ODS
                    </button>
                </div>
                {advancedSearch && (
                    <div className="advanced-search-vertical">
                        <div className="more-form-group">

                            <label><h3>學制</h3></label>
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
                            <label><h3>系所</h3></label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">請選擇系所</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="more-form-group">
                            <label><h3>課別</h3></label>
                            <div>
                                <label><input type="radio" name="classType" value="通識必修(通識)" checked={classType === '通識必修(通識)'} onChange={() => handleClassTypeChange('通識必修(通識)')} /> 通識必修(通識)</label>
                                <label><input type="radio" name="classType" value="通識選修(通識)" checked={classType === '通識選修(通識)'} onChange={() => handleClassTypeChange('通識選修(通識)')} /> 通識選修(通識)</label>
                                <label><input type="radio" name="classType" value="專業必修(系所)" checked={classType === '專業必修(系所)'} onChange={() => handleClassTypeChange('專業必修(系所)')} /> 專業必修(系所)</label>
                                <label><input type="radio" name="classType" value="專業選修(系所)" checked={classType === '專業選修(系所)'} onChange={() => handleClassTypeChange('專業選修(系所)')} /> 專業選修(系所)</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label><h3>年級</h3></label>
                            <div>
                                <label><input type="radio" name="grade" value="1" checked={grade === '一年級'} onChange={() => handleGradeChange('一年級')} /> 一年級</label>
                                <label><input type="radio" name="grade" value="2" checked={grade === '二年級'} onChange={() => handleGradeChange('二年級')} /> 二年級</label>
                                <label><input type="radio" name="grade" value="3" checked={grade === '三年級'} onChange={() => handleGradeChange('三年級')} /> 三年級</label>
                                <label><input type="radio" name="grade" value="4" checked={grade === '四年級'} onChange={() => handleGradeChange('四年級')} /> 四年級</label>
                            </div>
                        </div>

                        <div className="more-form-group">
                            <label><h3>上課星期</h3></label>
                            <div className="weekday-checkbox-group">
                                {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
                                    <label key={index}>
                                        <input
                                            type="checkbox"
                                            value={index + 1}
                                            checked={selectedPeriods.some((period) => period.startsWith(`${index + 1}`))}
                                            onChange={(e) => handleWeekdayChange(index + 1, e.target.checked)}
                                        />
                                        星期{day}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* 只有在選擇了星期後才顯示節次選單 */}
                        {selectedPeriods.some((period) => /^[1-7]$/.test(period)) && (
                            <div className="more-form-group">
                                <label><h3>節次</h3></label>
                                <div className="period-checkbox-group">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((period) => (
                                        <label key={period}>
                                            <input
                                                type="checkbox"
                                                value={period}
                                                checked={selectedPeriods.some((p) => p.endsWith(`-${period}`))}
                                                onChange={(e) => handlePeriodChange(period, e.target.checked)}
                                            />
                                            第{period}節
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}


                        <div className="more-form-group">
                            <label><h3>教師</h3></label>
                            <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="教師姓名" />
                        </div>

                        <div className="more-form-group">
                            <label><h3>班級</h3></label>
                            <input type="text" value={classCode} onChange={(e) => setClassCode(e.target.value)} placeholder="班級代碼" />
                        </div>

                        <div className="more-form-group">
                            <label><h3>課程</h3></label>
                            <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="課程名稱" />
                        </div>

                        <div className="more-form-group">
                            <label><h3>教室</h3></label>
                            <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="教室名稱" />
                        </div>
                        <div className="form-group">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="clear-button"
                            >
                                清除條件
                            </button>
                        </div>

                    </div>

                )}

                <button type="submit" className="search-button">查詢</button>
            </form>
            {loading && (
                <div className="loading-overlay">
                    <p>查詢中，請稍候...</p>
                </div>
            )}
       
            {courses.length > 0 && (
                <>
                    <div className="pagination-controls">
                        <div className="results-per-page">
                            <h4>每頁筆數</h4>
                            <select
                                value={resultsPerPage}
                                onChange={(e) => {
                                    setResultsPerPage(Number(e.target.value));  // 設置新的每頁筆數
                                    setCurrentPage(1);  // 每次更改每頁筆數時，回到第1頁
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
                            <span> / 共 {courses.length} 筆結果</span>
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
                                {currentResults?.length > 0 ? (
                                    currentResults.map((course, index) => (
                                        <tr key={course._id}>
                                            {/* 計算編號 */}
                                            <td>{(currentPage - 1) * resultsPerPage + index + 1}</td>
                                            <td>{course.學期 || "未提供"}</td>
                                            <td>{convertWeekdayToChinese(course.學制)}<br /> {course.系所名稱 || "未提供"}</td>
                                            <td>{course.年級 || "未提供"}</td>
                                            <td>{course.科目代碼 || "未提供"}</td>
                                            <td>{course.科目中文名稱 || "未提供"}</td>
                                            <td>
                                                <span
                                                    className="teacher-name"
                                                    onClick={() => handleToggleExpand(course._id)}
                                                >
                                                    {expandedTeachers.includes(course._id)
                                                        ? course.授課教師姓名
                                                        : course.授課教師姓名?.length > 6
                                                            ? course.授課教師姓名.slice(0, 6) + "..."
                                                            : course.授課教師姓名 || "無固定教師"}
                                                </span>
                                            </td>
                                            <td>{course.上課人數 || "未提供"}</td>
                                            <td>{convertWeekdayToChinese(course.上課星期)} {course.上課節次 || "未提供"}</td>
                                            <td>{course.學分數 || "未提供"}</td>

                                            <td>
                                                <div
                                                    className='color'
                                                    style={{ backgroundColor: getBackgroundColor(course.課別名稱) }} // 設定底色
                                                >
                                                    {course.課別名稱 || "未提供"}
                                                </div>
                                            </td>

                                            <td>
                                                <button onClick={() => openMoreInfo(course)} className="more-button">
                                                    更多資訊
                                                </button>
                                            </td>
                                        </tr>))
                                ) : (
                                    <tr>
                                        <td colSpan="12">暫無資料</td>
                                    </tr>
                                )}
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

export default CourseSearch;
