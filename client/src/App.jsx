import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './components/Navbar/Navbar.css'; // 引入 CSS
import AccountManagement from './pages/AdminDashboard/AccountManagement/AccountManagement';
import CourseManagement from './pages/AdminDashboard/CourseManagement/CourseManagement';
import AdminDashboard from './pages/AdminDashboard/Home';
import CourseSearch from './pages/CourseSearch/CourseSearch';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import CourseSimulator from './pages/CourseSimulator/CourseSimulator';
import FavoritesList from './pages/FavoritesList/FavoritesList';
import PersonalInfo from './pages/PersonalInfo/PersonalInfo';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登陸狀態
  const [Userid, setUserid] = useState(''); // 名字


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
          <Route path="/CourseSimulator" element={<CourseSimulator />} />
          <Route path="/FavoritesList" element={<FavoritesList />} />
          <Route path="/PersonalInfo" element={<PersonalInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
