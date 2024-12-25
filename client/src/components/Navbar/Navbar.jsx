import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"; // 確保圖片路徑正確

const Navbar = ({ isLoggedIn, username, setIsLoggedIn, viewAsStudent, toggleViewAsStudent }) => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false); // 控制語言菜單
  const [menuOpen, setMenuOpen] = useState(false); // 控制導航菜單在手機版的展開/收縮
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 登出邏輯
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // 切換語言菜單
  const toggleLanguageMenu = () => {
    setLanguageMenuOpen((prev) => !prev);
  };

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

        {/* 語言切換菜單 */}
        <div className="navbar-language" ref={dropdownRef}>
          <button onClick={toggleLanguageMenu} className="language-button">
            語言
          </button>

          {/* 下拉菜單 */}
          {languageMenuOpen && (
            <div className="language-dropdown">
              <li onClick={() => setLanguageMenuOpen(false)} className="dropdown-item">
                中文
              </li>
              <li onClick={() => setLanguageMenuOpen(false)} className="dropdown-item">
                English
              </li>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
