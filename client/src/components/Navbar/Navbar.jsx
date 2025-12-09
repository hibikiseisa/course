import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = ({ isLoggedIn, username, setIsLoggedIn, viewAsStudent, toggleViewAsStudent }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();



  // 登出邏輯
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // 切換語言菜單

  // 切換導航菜單
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="navbar">
      {/* Logo 和標題 */}
      <div className="navbar-logo" onClick={() => navigate("/CourseSearch")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="Logo" className="logo-image" />
        <span className="navbar-title">課程查詢系統</span>
      </div>

      {/* 手機版菜單按鈕 */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      {/* 動態右側菜單 */}
      <div className={`navbar-links ${menuOpen ? "show" : ""}`}>
        {isLoggedIn ? (
          <>
            {viewAsStudent ? (
              // 學生菜單
              <>
                <button onClick={() => navigate("/help")} className="navbar-link">
                  操作說明
                </button>                
                <button onClick={() => navigate("/Statistics")} className="navbar-link">
                  統計與分析                
                </button>
                <button onClick={() => navigate("/FavoritesList")} className="navbar-link">
                  我的追蹤名單
                </button>
                <button onClick={() => navigate("/Coursesimulation")} className="navbar-link">
                  預選課模擬
                </button>
                <button onClick={() => navigate("/PersonalInfo")} className="navbar-link">
                  個人帳號管理
                </button>
                <button onClick={handleLogout} className="navbar-link">
                  登出
                </button>
              </>
            ) : (
              // 管理者菜單
              <>
                <button onClick={() => navigate("/help")} className="navbar-link">
                  操作說明
                </button>
                <button onClick={() => navigate("/CourseManagement")} className="navbar-link">
                  課程管理
                </button>
                <button onClick={() => navigate("/AccountManagement")} className="navbar-link">
                  帳號管理
                </button>
                <button onClick={handleLogout} className="navbar-link">
                  登出
                </button>
              </>
            )}
          </>
        ) : (
          // 未登入的菜單
          <>
            <button onClick={() => navigate("/login")} className="navbar-link">
              登入
            </button>
            <button onClick={() => navigate("/register")} className="navbar-link">
              註冊
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default Navbar;
