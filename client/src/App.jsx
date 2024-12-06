import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './components/Navbar/Navbar.css'; // 引入 CSS
import CourseManagement from './pages/AdminDashboard/CourseManagement/CourseManagement';
import AdminDashboard from './pages/AdminDashboard/Home';
import CourseSearch from './pages/CourseSearch/CourseSearch';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import AccountManagement from './pages/AdminDashboard/AccountManagement/AccountManagement';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登陸狀態
  const [username, setUsername] = useState(''); // 名字


  // 本地存取狀態
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} username={username} setIsLoggedIn={setIsLoggedIn} />
      <div className="content">
        <Routes>
        <Route path="/" element={<CourseSearch />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/CourseSearch" element={<CourseSearch />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/CourseManagement" element={<CourseManagement />} />
          <Route path="/AccountManagement" element={<AccountManagement />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
