import { Routes, Route } from 'react-router-dom';
import PostList from './PostList';
import PostDetail from './PostDetail';

function App() {
  return (
    <div className="container">
      {/* <h1 className="title">CRUD</h1> */}
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
    </div>
  );
}

export default App;