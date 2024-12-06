import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"; // 确保图片路径正确

const Navbar = ({ isLoggedIn, username, setIsLoggedIn }) => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false); // 控制语言菜单
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

  // 登出逻辑
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // 切换语言菜单
  const toggleLanguageMenu = () => {
    setLanguageMenuOpen((prev) => !prev);
  };

  return (
    <div className="navbar">
      {/* Logo 和标题 */}
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="logo-image" />
        <span className="navbar-title">課程查詢系統</span>
      </div>

      {/* 动态右侧菜单 */}
      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            {localStorage.getItem("role") === "admin" ? (
              // 管理者菜单
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
            ) : (
              // 学生菜单
              <>
                <button onClick={() => navigate("/help")} className="navbar-link">
                  操作說明
                </button>
                <button onClick={() => navigate("/my-following")} className="navbar-link">
                  我的追蹤名單
                </button>
                <button onClick={() => navigate("/course-simulation")} className="navbar-link">
                  預選課模擬
                </button>
                <button onClick={() => navigate("/account-management")} className="navbar-link">
                  個人帳號管理
                </button>
                <button onClick={handleLogout} className="navbar-link">
                  登出
                </button>
              </>
            )}
          </>
        ) : (
          // 未登录的菜单
          <>
            <button onClick={() => navigate("/login")} className="navbar-link">
              登入
            </button>
            <button onClick={() => navigate("/register")} className="navbar-link">
              註冊
            </button>
          </>
        )}


        {/* 语言切换菜单 */}
        <div className="navbar-language" ref={dropdownRef}>
          <button onClick={toggleLanguageMenu} className="language-button">
            語言
          </button>

          {/* 下拉菜单 */}
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
