import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './components/Navbar/Navbar.css'; // 引入 CSS
import AccountManagement from './pages/AdminDashboard/AccountManagement/AccountManagement'; //所有帳號管理
import CourseManagement from './pages/AdminDashboard/CourseManagement/CourseManagement'; //課程管理
import AdminDashboard from './pages/AdminDashboard/Home';
import CourseSearch from './pages/CourseSearch/CourseSearch'; //課程查詢頁面
import Login from './pages/Login/Login'; //登入
import Register from './pages/Register/Register'; //註冊
import Coursesimulation from "./pages/student/Coursesimulation/course-simulation"; //預選課模擬
import PersonalManagement from "./pages/student/PersonalManagement/personal-management"; //個人帳號管理
import MyFollowing from './pages/student/my-following'; //我的追蹤名單

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登錄狀態
  const [Userid, setUserid] = useState(''); // 用户 ID

  // 本地存取狀態
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserid = localStorage.getItem('id');
    if (token && savedUserid) {
      setIsLoggedIn(true);
      setUserid(savedUserid);
    }
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} Userid={Userid} setIsLoggedIn={setIsLoggedIn} />
      <div className="content">
        <Routes>
          <Route path="/" element={<CourseSearch />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setUserid={setUserid} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/CourseSearch" element={<CourseSearch />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/CourseManagement" element={<CourseManagement />} />
          <Route path="/AccountManagement" element={<AccountManagement />} />
          <Route path="/my-following" element={<MyFollowing />} />
          <Route path="/course-simulation" element={<Coursesimulation />} />
          <Route path="/personal-management" element={<PersonalManagement />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
