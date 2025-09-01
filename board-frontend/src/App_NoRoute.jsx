import { useEffect, useState } from 'react';
import axios from 'axios';
import {link} from 'react-router-dom';
import './App.css';

function App() {
  //useState : 상태를 추가하고 관리하는 hook
  const[posts, setPosts] = useState([]);
  const[form, setForm] = useState({ title: "", content:"", author : ""});

  //useEffect : 컴포넌트가 렌더링된 후 특정 작업을 수행하는 hook
  //빈 배열을 두번째 인자로 전달하여 컴포넌트가 처음 렌더링될 때만 실행되도록 설정
  //게시글 목록을 서버에서 가져오는 기능을 담당
  useEffect(() => {
    axios.get("http://localhost:4000/api/posts").then(res => setPosts(res.data));
  }, []);

  //게시글 작성 폼을 제출하는 기능을 담당하는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:4000/api/posts", form);
    setForm({ title: "", content:"", author : ""});
    const res = await axios.get("http://localhost:4000/api/posts");
    setPosts(res.data);
  };

  //게시글 상세 보기
  const handleView = async (id) => {
    const res = await axios.get(`http://localhost:4000/api/posts/${id}`);
    alert(`제목: ${res.data.title}\n작성자: ${res.data.author}\n내용: ${res.data.content}`);
  };

  //게시글 수정
  const handleEdit = async (post) => {
    const newTitle = prompt("새 제목 입력:");
    const newContent = prompt("새 내용 입력:");
    const newAuthor = prompt("새 작성자 입력:");
    if (!newTitle || !newContent) return;

    await axios.put(`http://localhost:4000/api/posts/${post.id}`, {
      title: newTitle,
      content: newContent,
      author: newAuthor || "익명"
    });
    const res = await axios.get("http://localhost:4000/api/posts");
    setPosts(res.data);
  };

  //게시글 삭제
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("삭제하시겠습니까?");

    if (isConfirmed){
      try{
        const response = await axios.delete(`http://localhost:4000/api/posts/${id}`);
        alert(response.data.message);
        const res = await axios.get("http://localhost:4000/api/posts");
        setPosts(res.data);
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다.");
      }    
    }
  }

  return (
    <div className='container'>
      <h1 className='title'>게시판</h1>

      <form className='form' onSubmit={handleSubmit}>
        <input
          className='input'
          placeholder='제목'
          value ={form.title}
          onChange={e => setForm({...form, title: e.target.value})}
        />  
        <input
          className='input'
          placeholder="작성자"
          value={form.author}
          onChange={e => setForm({ ...form, author: e.target.value })}
        />
        <textarea
          className='textarea'
          placeholder='내용'
          value={form.content}
          onChange={e => setForm({...form, content: e.target.value})}
        />
        <button className='button' type="submit">등록</button>        
      </form>

      <ul className='post-list'>
        {posts.map(post => (
          <li className="post-item" key={post.id}>
            <strong className="post-title">{post.title}</strong>
            <span className="post-author">({post.author})</span>
            <p className="post-content">{post.content}</p>
            <button onClick={() =>handleView(post.id)}>상세보기</button>
            <button onClick={() =>handleEdit(post)}>수정</button>
            <button onClick={() =>handleDelete(post.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>   
  ); 
}

export default App;
  
