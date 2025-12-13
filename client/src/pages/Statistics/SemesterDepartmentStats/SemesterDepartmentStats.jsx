import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./SemesterDepartmentStats.css";

const SemesterDepartmentStats = () => {
  const navigate = useNavigate();

  // 自動產生學期列表
  const allSems = [];
  for (let y = 105; y <= 114; y++) {
    allSems.push(`${y}1`);
    allSems.push(`${y}2`);
  }

  const [semester, setSemester] = useState(""); // 選擇學期
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 取得不同學期的資料
  const fetchData = async (selectedSemester) => {
    if (!selectedSemester) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/courses", {
        params: { semester: selectedSemester }
      });

      // 時段統計
      const timeMap = { 早: 0, 中: 0, 晚: 0 };
      res.data.forEach((course) => {
        const timeStr = course.上課時間 || ""; // 假設是 "08:10" 這種格式
        const hour = Number(timeStr.split(":")[0]) || 0;
        if (hour >= 8 && hour < 11) timeMap.早 += 1;
        else if (hour >= 11 && hour < 17) timeMap.中 += 1;
        else if (hour >= 17 && hour < 21) timeMap.晚 += 1;
      });

      const chartData = Object.keys(timeMap).map((period) => ({
        時段: period,
        課程數量: timeMap[period]
      }));

      setData(chartData);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 當學期改變時，重新抓資料
  useEffect(() => {
    fetchData(semester);
  }, [semester]);

  return (
    <div className="page-wrapper">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← 返回
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>每學期課程上課時段分布</h2>

      {/* 選學期 */}
      <div className="sem-select">
        <label className="sem-label">選擇學期：</label>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="sem-dropdown"
        >
          {allSems.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ textAlign: "center" }}>資料載入中...</p>}

      {!loading && data.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          {/* Bar Chart */}
          <div style={{ width: "100%", height: 350 }}>
            <h3>🕒 課程上課時段分布（Bar Chart）</h3>
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="時段" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="課程數量" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div style={{ marginTop: "20px" }}>
            <h3>📄 課程數量表格</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>時段</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>課程數量</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.時段}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.時段}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.課程數量}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && semester && (
        <p style={{ textAlign: "center" }}>該學期無課程資料</p>
      )}
    </div>
  );
};

export default SemesterDepartmentStats;
