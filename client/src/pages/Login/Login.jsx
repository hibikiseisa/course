import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ setIsLoggedIn, setUsername }) => {
  const [inputUsername, setInputUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false); // 是否顯示角色選擇
  const [selectedPage, setSelectedPage] = useState(''); // 管理者選擇的頁面
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit 被触发了');

    try {
      // 如果正在選擇角色，直接跳轉到對應頁面
      if (showRoleSelection) {
        if (selectedPage === 'admin') {
          setIsLoggedIn(true);
          setUsername(inputUsername);
          navigate('/AdminDashboard'); // 跳轉到管理者頁面
        } else if (selectedPage === 'student') {
          setIsLoggedIn(true);
          setUsername(inputUsername);
          navigate('/CourseSearch'); // 跳轉到學生頁面
        } else {
          setError('請選擇角色頁面');
        }
        return;
      }

      // 第一次提交時，驗證用戶身份
      const response = await axios.post('http://localhost:5000/api/login', {
        username: inputUsername,
        password,
      });

      const { token, role } = response.data;

      // 儲存 JWT Token 和角色到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', inputUsername);
      localStorage.setItem('role', role);

      console.log('後端返回數據:', response.data);
      console.log('後端返回的角色:', role);

      // 根據角色判斷邏輯
      if (role === 'admin') {
        // 如果是管理者，顯示角色選擇界面
        setShowRoleSelection(true);
        setError(null);
      } else if (role === 'student') {
        // 如果是學生，直接跳轉到學生頁面
        setIsLoggedIn(true);
        setUsername(inputUsername);
        navigate('/CourseSearch');
      }
    } catch (error) {
      setError(error.response?.data?.message || '登入失敗，請檢查帳號或密碼');
    }
  };

  return (
    <div className="outer-container">
      <div className="login-container">
        <h2>登入</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error-message">{error}</p>} {/* 顯示錯誤訊息 */}
          <div className="form-group">
            <label htmlFor="username">帳號</label>
            <input
              type="text"
              id="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="請輸入帳號"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
            />
          </div>

          {/* 管理者角色選擇 */}
          {showRoleSelection && (
            <div className="role-selection">
              <h4>選擇角色頁面</h4>
              <label>
                <input
                  type="radio"
                  value="admin"
                  checked={selectedPage === 'admin'}
                  onChange={(e) => setSelectedPage(e.target.value)}
                />{' '}
                管理者頁面
              </label>
              <label>
                <input
                  type="radio"
                  value="student"
                  checked={selectedPage === 'student'}
                  onChange={(e) => setSelectedPage(e.target.value)}
                />{' '}
                學生頁面
              </label>
            </div>
          )}

          <button type="submit" className="login-button">
            {showRoleSelection ? '進入頁面' : '登入'}
          </button>
        </form>
        <a onClick={() => navigate('/register')} className="register-link">
          沒有帳號？註冊
        </a>
      </div>
    </div>
  );
};

export default Login;
