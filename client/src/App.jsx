import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './components/Navbar/Navbar.css'; // 引入 CSS
import Login from './pages/Login/Login';
import CourseSearch from './pages/CourseSearch/CourseSearch';
import Register from './pages/Register/Register';
import AdminDashboard from './pages/AdminDashboard/Home'
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
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/CourseSearch" element={<CourseSearch />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
