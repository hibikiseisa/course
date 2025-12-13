import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CourseAnalysis.css";


const CourseAnalysis = () => {
          const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmed = keyword.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/teachers/search?keyword=" +
          encodeURIComponent(trimmed)
      );

      if (!res.ok) throw new Error("搜尋失敗，請稍後再試");

      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "發生未知錯誤");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-analysis-container">
     
      <h2 className="course-analysis-title">課程分析 / 老師搜尋</h2>

      {/* 搜尋列 */}
      <form onSubmit={handleSearch} className="teacher-search-form">
        <input
          type="text"
          placeholder="輸入老師名稱關鍵字（支援模糊搜尋）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="teacher-search-input"
        />

        <button
          type="submit"
          className="teacher-search-button"
          disabled={loading}
        >
          {loading ? "搜尋中…" : "搜尋"}
        </button>
      </form>

      {error && <div className="teacher-search-error">{error}</div>}

      {/* 上方摘要列：目前共有 X 位老師 */}
      {teachers.length > 0 && (
        <div className="teacher-summary-bar">
          目前共有 <span className="teacher-summary-count">{teachers.length}</span>{" "}
          位老師
        </div>
      )}

      <div className="teacher-card-list">
        {teachers.length === 0 && !loading && !error && (
          <p className="teacher-search-hint">
            請輸入關鍵字搜尋老師名稱。
          </p>
        )}

        {teachers.map((t) => (
          <Link
            key={t}
            to={`/teacher/${encodeURIComponent(t)}`}
            className="teacher-card"
          >
            <div className="teacher-card-main">
              <div className="teacher-card-title">老師名稱：{t}</div>
              <div className="teacher-card-sub">
                點擊以查看該老師的授課統計與歷年課程
              </div>
            </div>

            <div className="teacher-card-arrow">
              <span>&gt;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CourseAnalysis;
