import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import './components/Navbar/Navbar.css';
import AccountManagement from './pages/AdminDashboard/AccountManagement/AccountManagement';
import CourseManagement from './pages/AdminDashboard/CourseManagement/CourseManagement';
import AdminDashboard from './pages/AdminDashboard/Home';
import CourseSearch from './pages/CourseSearch/CourseSearch';
import FavoritesList from './pages/FavoritesList/FavoritesList';
import Help from './pages/Help/help';
import Login from './pages/Login/Login';
import PersonalInfo from './pages/PersonalInfo/PersonalInfo';
import Register from './pages/Register/Register';
import SemesterStats from './pages/Statistics/SemesterDepartmentStats/SemesterDepartmentStats';
import Statistics from './pages/Statistics/Statistics';
import Coursesimulation from './pages/student/Coursesimulation/course-simulation';
import CourseAnalysis from './pages/CourseAnalysis/CourseAnalysis';
import Teacher from './pages/CourseAnalysis/Teacher';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登錄狀態
  const [Userid, setUserid] = useState(''); // 用户 ID
  const [viewAsStudent, setViewAsStudent] = useState(() => {
    // 從 localStorage 獲取初始化值
    const storedView = localStorage.getItem('viewAsStudent');
    return storedView ? JSON.parse(storedView) : false; // 預設為 false
  });

  // 切換 viewAsStudent 並保存到 localStorage
  const toggleViewAsStudent = () => {
    const newViewAsStudent = !viewAsStudent;
    setViewAsStudent(newViewAsStudent);
    localStorage.setItem('viewAsStudent', JSON.stringify(newViewAsStudent));
  };

  // 初始化登錄狀態
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserid = localStorage.getItem('id');
    if (token && savedUserid) {
      setIsLoggedIn(true);
      setUserid(savedUserid);
    }
  }, []);

  // 確保每次 viewAsStudent 改變時同步更新 localStorage
  useEffect(() => {
    localStorage.setItem('viewAsStudent', JSON.stringify(viewAsStudent));
  }, [viewAsStudent]);

  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <Navbar
          isLoggedIn={isLoggedIn}
          Userid={Userid}
          setIsLoggedIn={setIsLoggedIn}
          viewAsStudent={viewAsStudent}
          toggleViewAsStudent={toggleViewAsStudent}
        />
        <div className="content">
          <Routes>
            <Route path="/" element={<CourseSearch />} />
            <Route
              path="/login"
              element={
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  setUserid={setUserid}
                  setViewAsStudent={setViewAsStudent}
                  toggleViewAsStudent={toggleViewAsStudent}
                />
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/CourseSearch" element={<CourseSearch />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/CourseManagement" element={<CourseManagement />} />
            <Route path="/AccountManagement" element={<AccountManagement />} />
            <Route path="/Coursesimulation" element={<Coursesimulation />} />
            <Route path="/FavoritesList" element={<FavoritesList />} />
            <Route path="/PersonalInfo" element={<PersonalInfo />} />
            <Route path="/Statistics" element={<Statistics />} />
            <Route path="/CourseAnalysis" element={<CourseAnalysis />} />
 <Route path="/teacher/:name" element={<Teacher />} />
            <Route path="/help" element={<Help />} />
<Route path="/Statistics/semester" element={<SemesterStats />} />
          </Routes>
        </div>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
