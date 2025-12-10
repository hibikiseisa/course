import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Statistics.css";

const Statistics = () => {
  const navigate = useNavigate();

  // 用來記錄目前選到哪一個
  const [selected, setSelected] = useState(1);

  const handleSelect = (index, path) => {
    setSelected(index);
    navigate(path);
  };

  return (
    <div>
              <div className="statistics-title">選擇想看的統計類別</div>

      <div className="statistics-container">

        {/* 第一個 */}
        <button
          className={`statistics-card ${selected === 1 ? "selected" : ""}`}
          onClick={() => handleSelect(1, "/Statistics/semester")}
        >
          每學期課程與科系分佈
        </button>

        {/* 第二個 */}
        <button
          className={`statistics-card ${selected === 2 ? "selected" : ""}`}
          onClick={() => handleSelect(2, "/CourseAnalysis")}
        >
          各老師與課程相關統計
        </button>

        {/* 第三個 */}
        <button
          className={`statistics-card ${selected === 3 ? "selected" : ""}`}
          onClick={() => handleSelect(3, "/Statistics/popularity")}
        >
          課程熱門度
        </button>
      </div>
    </div>
  );
};

export default Statistics;
