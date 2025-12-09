import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Teacher.css";

const Teacher = () => {
    const { name } = useParams();
    const navigate = useNavigate();

    const decodedName = decodeURIComponent(name || "");

    const [selectedSem, setSelectedSem] = useState("1132");
    const [chartType, setChartType] = useState("line"); // line | bar | pie

    const [teacher, setTeacher] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 所有學期
    const allSems = [];
    for (let y = 105; y <= 114; y++) {
        allSems.push(`${y}1`);
        allSems.push(`${y}2`);
    }
    // 年級對照
    const gradeMapping = {
        "1": "一年級",
        "2": "二年級",
        "3": "三年級",
        "4": "四年級",
    };

    // 星期轉中文
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
        return weekday
            .toString()
            .split(",")
            .map((day) => mapping[day] || day)
            .join(", ");
    };

    // 課別顏色
    const getBackgroundColor = (courseType) => {
        switch (courseType) {
            case "通識必修(通識)":
                return "lightblue";
            case "通識選修(通識)":
                return "lightgreen";
            case "專業必修(系所)":
                return "lightyellow";
            case "專業選修(系所)":
                return "lightpink";
            default:
                return "lightgray";
        }
    };

    // 取得老師基本資料
    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/teacher/${encodeURIComponent(
                        decodedName
                    )}`
                );
                if (!res.ok) throw new Error("查詢老師資料失敗");
                const data = await res.json();
                if (!data.success) throw new Error("查無老師資料");
                setTeacher(data.data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };
        fetchTeacher();
    }, [decodedName]);

    // 取得統計資料（隨學期變動）
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `http://localhost:5000/api/teacher-stats?teacher=${encodeURIComponent(
                    decodedName
                )}&sem=${encodeURIComponent(selectedSem)}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("查詢教師統計資料失敗");
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (decodedName) fetchStats();
    }, [decodedName, selectedSem]);

    const coursesPerSem = stats?.courses_per_semester || {};
    const departments = stats?.departments || [];
    const top3Courses = stats?.top3_courses || [];
    const thisSemInfo = stats?.this_semester || {};
    const thisSemCourses = thisSemInfo.courses || [];

    const semEntries = Object.entries(coursesPerSem);
    const semValues = semEntries.map(([, v]) => Number(v) || 0);
    const maxSemCount = semValues.length ? Math.max(...semValues) : 0;

    const maxTopTotal = top3Courses.length
        ? Math.max(...top3Courses.map((c) => c.total_students || 0))
        : 0;

    // 折線圖 points 計算
    const buildLinePoints = () => {
        if (!semEntries.length || !maxSemCount) return "";

        const width = Math.max(semEntries.length * 40, 120);
        const height = 150;
        const paddingX = 20;
        const paddingY = 10;
        const innerW = width - paddingX * 2;
        const innerH = height - paddingY * 2;

        return semEntries
            .map(([_, count], idx) => {
                const x =
                    semEntries.length === 1
                        ? width / 2
                        : paddingX + (innerW * idx) / (semEntries.length - 1);
                const ratio = Number(count) / maxSemCount;
                const y = paddingY + innerH * (1 - ratio);
                return `${x},${y}`;
            })
            .join(" ");
    };

    // 圓餅圖 conic-gradient
    const buildPieBackground = () => {
        if (!semEntries.length) return "#e5e7eb";

        const total = semEntries.reduce(
            (sum, [, c]) => sum + (Number(c) || 0),
            0
        );
        if (!total) return "#e5e7eb";

        const colors = [
            "#3b82f6",
            "#10b981",
            "#f97316",
            "#6366f1",
            "#ec4899",
            "#22c55e",
            "#facc15",
            "#0ea5e9",
            "#a855f7",
            "#4b5563",
        ];

        let currentAngle = 0;
        const segments = semEntries.map(([_, c], idx) => {
            const value = Number(c) || 0;
            const angle = (value / total) * 360;
            const start = currentAngle;
            const end = currentAngle + angle;
            currentAngle = end;
            return `${colors[idx % colors.length]} ${start}deg ${end}deg`;
        });

        return `conic-gradient(${segments.join(", ")})`;
    };

    const linePoints = buildLinePoints();
    const pieBackground = buildPieBackground();
    const lineSvgWidth = Math.max(semEntries.length * 40, 120);

    return (
        <div className="teacher-page-wrapper">
            {/* 返回按鈕 */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="teacher-back-button"
            >
                ← 返回
            </button>

            {loading && <p>載入中…</p>}
            {error && <p className="teacher-error">{error}</p>}

            {!loading && !error && (
                <>
                    {/* 老師基本資訊卡片 */}
                    {teacher && (
                        <div className="teacher-card teacher-header-card">
                            <div className="teacher-header-main">
                                <div>
                                    <h2 className="teacher-header-name">{teacher.name}</h2>
                                </div>
                                <div className="teacher-header-info">
                                    <p>職稱：{teacher.position}</p>
                                    <p>電話：{teacher.phone}</p>
                                    <p>信箱：{teacher.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 學期下拉選單 */}
                    <div className="teacher-sem-select">
                        <label className="teacher-sem-label">選擇學期：</label>
                        <select
                            value={selectedSem}
                            onChange={(e) => setSelectedSem(e.target.value)}
                            className="teacher-sem-dropdown"
                        >
                            {allSems.map((sem) => (
                                <option key={sem} value={sem}>
                                    {sem}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="teacher-charts">
                        {/* 每學期授課堂數：可切換三種圖表 */}
                        <div className="teacher-card teacher-chart-card">
                            <div className="teacher-chart-header">
                                <h3 className="teacher-chart-title">每學期授課堂數</h3>
                                <div className="teacher-chart-type-switch">
                                    <button
                                        type="button"
                                        className={
                                            "teacher-chart-type-btn" +
                                            (chartType === "line" ? " active" : "")
                                        }
                                        onClick={() => setChartType("line")}
                                    >
                                        折線圖
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "teacher-chart-type-btn" +
                                            (chartType === "bar" ? " active" : "")
                                        }
                                        onClick={() => setChartType("bar")}
                                    >
                                        長條圖
                                    </button>
                                   
                                </div>
                            </div>

                            {semEntries.length === 0 ? (
                                <p>無資料</p>
                            ) : (
                                <>
                                    {/* 折線圖 */}
                                    {chartType === "line" && (
                                        <div className="teacher-chart-line-wrapper">
                                            <svg
                                                className="teacher-chart-line-svg"
                                                viewBox={`0 0 ${lineSvgWidth} 150`}
                                                preserveAspectRatio="none"
                                            >
                                                {/* 底線 */}
                                                <line
                                                    x1="0"
                                                    y1="140"
                                                    x2={lineSvgWidth}
                                                    y2="140"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="1"
                                                />
                                                {/* 折線 */}
                                                <polyline
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="2"
                                                    points={linePoints}
                                                />
                                                {/* 節點 */}
                                                {semEntries.map(([sem, count], idx) => {
                                                    const width = lineSvgWidth;
                                                    const paddingX = 20;
                                                    const paddingY = 10;
                                                    const innerW = width - paddingX * 2;
                                                    const innerH = 150 - paddingY * 2;
                                                    const x =
                                                        semEntries.length === 1
                                                            ? width / 2
                                                            : paddingX +
                                                            (innerW * idx) / (semEntries.length - 1);
                                                    const ratio =
                                                        maxSemCount > 0 ? Number(count) / maxSemCount : 0;
                                                    const y = paddingY + innerH * (1 - ratio);

                                                    return (
                                                        <g key={sem}>
                                                            <circle
                                                                cx={x}
                                                                cy={y}
                                                                r="3"
                                                                fill="#3b82f6"
                                                                stroke="#ffffff"
                                                                strokeWidth="1"
                                                            />
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                            <div className="teacher-chart-line-labels">
                                                {semEntries.map(([sem, count]) => (
                                                    <div
                                                        key={sem}
                                                        className="teacher-chart-line-label-item"
                                                    >
                                                        <div className="teacher-chart-line-sem">
                                                            {sem}
                                                        </div>
                                                        <div className="teacher-chart-line-count">
                                                            {count}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 長條圖 */}
                                    {chartType === "bar" && (
                                        <div className="teacher-chart-scroll">
                                            <div className="teacher-chart-bar-container">
                                                {semEntries.map(([sem, count]) => {
                                                    const ratio =
                                                        maxSemCount > 0 ? Number(count) / maxSemCount : 0;
                                                    return (
                                                        <div key={sem} className="teacher-chart-bar-item">
                                                            <div
                                                                className="teacher-chart-bar"
                                                                style={{ height: `${ratio * 120 + 20}px` }}
                                                            />
                                                            <div className="teacher-chart-bar-sem">{sem}</div>
                                                            <div className="teacher-chart-bar-count">{count}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}


                                
                                </>
                            )}
                        </div>

                        {/* 歷年授課系所 */}
                        <div className="teacher-card teacher-chart-card">
                            <h3 className="teacher-chart-title">歷年授課系所</h3>
                            <p className="teacher-dept-count">
                                共 {departments.length} 個系所
                            </p>
                            <div className="teacher-dept-tags">
                                {departments.map((d) => (
                                    <span key={d} className="teacher-dept-tag">
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Top3 課程：頒獎台 */}
                        <div className="teacher-card teacher-chart-card">
                            <h3 className="teacher-chart-title">歷年人氣 Top 3 課程</h3>

                            {top3Courses.length < 3 ? (
                                top3Courses.length === 0 ? (
                                    <p>無資料</p>
                                ) : (
                                    top3Courses.map((c, i) => (
                                        <div key={i} className="teacher-top-course-row">
                                            <span className="teacher-top-course-rank">
                                                {i + 1}.
                                            </span>
                                            <span className="teacher-top-course-name">
                                                {c.course_name}
                                            </span>
                                            <span className="teacher-top-course-count">
                                                {c.total_students} 人
                                            </span>
                                        </div>
                                    ))
                                )
                            ) : (
                                <div className="teacher-podium-wrapper">
                                    <div className="teacher-podium-columns">
                                        {/* 第二名（左） */}
                                        <PodiumColumn
                                            course={top3Courses[1]}
                                            rank={2}
                                            maxTotal={maxTopTotal}
                                        />
                                        {/* 第一名（中） */}
                                        <PodiumColumn
                                            course={top3Courses[0]}
                                            rank={1}
                                            maxTotal={maxTopTotal}
                                        />
                                        {/* 第三名（右） */}
                                        <PodiumColumn
                                            course={top3Courses[2]}
                                            rank={3}
                                            maxTotal={maxTopTotal}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 指定學期課程列表*/}
                    <h3 className="teacher-course-list-title">
                        {selectedSem} 學期課程列表
                    </h3>
                    <div className="teacher-card teacher-course-list-card">


                        {thisSemCourses.length === 0 ? (
                            <p className="teacher-course-empty-text">該學期無課程</p>
                        ) : (
                            <div className="teacher-course-results">
                                <table className="teacher-course-table">
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>學期</th>
                                            <th>學制 / 系所</th>
                                            <th>年級</th>
                                            <th>科目代碼</th>
                                            <th>課程名稱</th>
                                            <th>教師</th>
                                            <th>上課人數</th>
                                            <th>上課時間 / 節次</th>
                                            <th>學分</th>
                                            <th>課別</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {thisSemCourses.map((course, index) => {
                                            const semester = course.學期 || course.semester || selectedSem;
                                            const edu = course.學制 || course.education || "未提供";
                                            const dept = course.系所名稱 || course.group_name || "未提供";
                                            const gradeKey = (course.年級 || course.grade || "").toString();
                                            const gradeText = gradeMapping[gradeKey] || "未提供";

                                            const courseCode = course.科目代碼 || course.course_no || "未提供";
                                            const courseName =
                                                course.科目中文名稱 || course.course_name || "未提供";

                                            const teacherName = Array.isArray(course.授課教師姓名)
                                                ? course.授課教師姓名.join("、")
                                                : course.授課教師姓名 ||
                                                course.main_teacher ||
                                                "無固定教師";

                                            const people = course.上課人數 || course.total_count || "未提供";
                                            const weekdayText = convertWeekdayToChinese(
                                                course.上課星期 || course.weekday
                                            );
                                            const periods = course.上課節次 || course.periods || "未提供";
                                            const credit = course.學分數 || course.credit || "未提供";
                                            const type = course.課別名稱 || course.course_type || "未提供";

                                            return (
                                                <tr key={course._id || index}>
                                                    <td>{index + 1}</td>
                                                    <td>{semester}</td>
                                                    <td>
                                                        {edu}
                                                        <br />
                                                        {dept}
                                                    </td>
                                                    <td>{gradeText}</td>
                                                    <td>{courseCode}</td>
                                                    <td>{courseName}</td>
                                                    <td>{teacherName}</td>
                                                    <td>{people}</td>
                                                    <td>
                                                        {weekdayText} {periods}
                                                    </td>
                                                    <td>{credit}</td>
                                                    <td>
                                                        <span
                                                            className="teacher-course-type-badge"
                                                            style={{ backgroundColor: getBackgroundColor(type) }}
                                                        >
                                                            {type}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </>
            )}
        </div>
    );
};

// 頒獎台欄位元件
const PodiumColumn = ({ course, rank, maxTotal }) => {
    if (!course) return null;
    const ratio =
        maxTotal > 0 ? (course.total_students || 0) / maxTotal : 0;
    const base = rank === 1 ? 120 : rank === 2 ? 90 : 70;
    const height = base * (0.6 + ratio * 0.4); // 保證有高度

    return (
        <div className={`teacher-podium-column podium-rank-${rank}`}>
            <div
                className="teacher-podium-block"
                style={{ height: `${height}px` }}
            >
                <div className="teacher-podium-rank-text">{rank}</div>
                <div className="teacher-podium-total">
                    {course.total_students} 人
                </div>
            </div>
            <div className="teacher-podium-course-name">
                {course.course_name}
            </div>
        </div>
    );
};

export default Teacher;
