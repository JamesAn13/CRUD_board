import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tournaments from './pages/Tournaments';
import NotificationPanel from './components/NotificationPanel';
import './styles/App.css';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('로그아웃 되었습니다. 로그인 페이지로 이동합니다.');
    navigate('/login');
    window.location.reload(); // 페이지 새로고침으로 상태 반영
  }; 

  return (
    <div className="container">
      {/* <h1 className="title">CRUD</h1> */}
      <nav>
        <div className="nav-left">
          <Link to="/">홈</Link>
          <Link to="/tournaments">대회</Link>
        </div>
        <div className="nav-right">
          {token ? (
            <>
              <Link to="/profile">내 프로필</Link>
              <NotificationPanel />
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/register">회원가입</Link>
            </>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tournaments" element={<Tournaments />} />
      </Routes>
    </div>
  );
}

export default App;