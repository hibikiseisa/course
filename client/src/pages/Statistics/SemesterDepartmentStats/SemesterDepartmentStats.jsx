import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#4CAF50", "#FF9800", "#03A9F4", "#E91E63", "#9C27B0", "#009688"];

const SemesterDepartmentStats = () => {
        const navigate = useNavigate();
    
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

      // 依系所統計課程數量
      const deptMap = {};
      res.data.forEach((course) => {
        const dept = course.系所名稱 || "未分類";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });

      const chartData = Object.keys(deptMap).map((dept) => ({
        系所名稱: dept,
        課程數量: deptMap[dept]
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
    <div className="teacher-page-wrapper">
         <button
                type="button"
                onClick={() => navigate(-1)}
                className="teacher-back-button"
            >
                ← 返回
            </button>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>每學期課程與科系分佈</h2>

      {/* 選學期 */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label>
          選擇學期：
          <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ marginLeft: "10px" }}>
            <option value="">請選擇學期</option>
            <option value="1051">105-1</option>
            <option value="1052">105-2</option>
            <option value="1061">106-1</option>
            {/* 可以改成從 API 取得學期清單 */}
          </select>
        </label>
      </div>

      {loading && <p style={{ textAlign: "center" }}>資料載入中...</p>}

      {!loading && data.length > 0 && (
        <>
          {/* Bar Chart */}
          <div style={{ width: "100%", height: 350 }}>
            <h3>📊 各系所課程數量（Bar Chart）</h3>
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="系所名稱" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="課程數量">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={{ width: "100%", height: 350, marginTop: "40px" }}>
            <h3>🥧 各系所開課比例（Pie Chart）</h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="課程數量" nameKey="系所名稱" outerRadius={120} label>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div style={{ marginTop: "40px" }}>
            <h3>📄 數據表格</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>系所</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>課程數量</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.系所名稱}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.系所名稱}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.課程數量}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && data.length === 0 && semester && <p style={{ textAlign: "center" }}>該學期無課程資料</p>}
    </div>
  );
};

export default SemesterDepartmentStats;
