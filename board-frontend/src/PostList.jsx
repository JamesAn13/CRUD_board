import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './App.css';
import Modal from './Modal';
import { getPosts, createPost, updatePost, deletePost } from './api';
import Pagination from './Pagination';

//게시글 목록을 보여주고, 작성, 수정, 삭제 기능을 제공하는 컴포넌트
function PostList() {
  //useState : 상태를 추가하고 관리하는 hook
  const[posts, setPosts] = useState([]);
  const[form, setForm] = useState({ title: "", content:"", author : ""});
  const[ isModalOpen, setIsModalOpen] = useState(false);
  const[ editingPost, setEditingPost] = useState(null);

  //페이지네이션 상태 추가
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ totalPages, setTotalPages ] = useState(0);
  const [ limit ] = useState(10); //한 페이지에 보여줄 글 개수

  //데이터를 페이지네이션에 맞게 불러오는 함수
  const fetchPosts = async (page) =>{
    try {
      const res = await getPosts(page, limit);
      setPosts(res.data.posts); //axios.get("http://localhost:4000/api/posts").then(res => setPosts(res.data));
      setTotalPages(Math.ceil(res.data.total / limit)); //총 페이지 수 계산
    } catch (error) {
      console.log("게시글을 불러오는데 실패했습니다.", error);
    }
  }

  //useEffect : 컴포넌트가 렌더링된 후 특정 작업을 수행하는 hook
  //빈 배열을 두번째 인자로 전달하여 컴포넌트가 처음 렌더링될 때만 실행되도록 설정
  //게시글 목록을 서버에서 가져오는 기능을 담당
  // useEffect(() => {
  //   // axios.get("http://localhost:4000/api/posts").then(res => setPosts(res.data));
  //   getPosts().then(res => setPosts(res.data));
  // }, []);
  //페이지네이션을 고려하여 게시글을 불러오도록 수정
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]); //currentPage가 변경될 때마다 fetchPosts 호출

  //게시글 작성 폼을 제출하는 기능을 담당하는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPost(form); //axios.post("http://localhost:4000/api/posts", form);
    setForm({ title: "", content:"", author : ""});
    // fetchPosts(1); //새 글 작성 후 첫 페이지로 이동하여 글 목록 갱신

    //setCurrentPage(1); //현재 페이지를 1로 설정 -> useEffect가 감지하여 fetchPosts(1) 호출, 글 목록 갱신, 현재 페이지 유지
    //fetchPosts(1);//새 글 작성 후 첫 페이지로 이동하여 글 목록 갱신 but 불필요한 중복 호출 !!!!!!!

    //위의 두 줄을 아래와 같이 최적화
    if (currentPage !== 1) {
      // 다른 페이지에 있었다면, 상태 변경으로 useEffect를 트리거
      setCurrentPage(1); //현재 페이지를 1로 설정 -> useEffect가 감지하여 fetchPosts(1) 호출, 글 목록 갱신
    } else {
      fetchPosts(1); //현재 페이지가 1이면 직접 호출
    }
  };

  //게시글 상세 보기 -> 라우팅을 하면서 새로운 PostDetail 컴포넌트를 보여주도록 수정
  // const handleView = async (id) => {
  //   const res = await axios.get(`http://localhost:4000/api/posts/${id}`);
  //   alert(`제목: ${res.data.title}\n작성자: ${res.data.author}\n내용: ${res.data.content}`);
  // };

  //게시글 수정 -> prompt 대신 모달 창을 사용하도록 수정
  // const handleEdit = async (post) => {
  //   const newTitle = prompt("새 제목 입력:");    
  //   const newAuthor = prompt("새 작성자 입력:");
  //   const newContent = prompt("새 내용 입력:");
  //   if (!newTitle || !newContent) return;

  //   await axios.put(`http://localhost:4000/api/posts/${post.id}`, {
  //     title: newTitle,
  //     content: newContent,
  //     author: newAuthor || "익명"
  //   });
  //   const res = await axios.get("http://localhost:4000/api/posts");
  //   setPosts(res.data);
  // };

  //Modal에서 수정할 게시글을 상태에서 저장 & 모달 열기
  const handleEdit = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  //Modal에서 저장 버튼 클릭 시 호출되는 함수
  const handleSave = async ( updatedPost) => {
    await updatePost(updatedPost.id, updatedPost); //axios.put(`http://localhost:4000/api/posts/${updatedPost.id}`, updatedPost);
    //const res = await getPosts(); //await axios.get("http://localhost:4000/api/posts");
    //setPosts(res.data);
    fetchPosts(currentPage); //게시글 목록을 다시 불러오는 함수 -> 수정 후 현재 페이지 유지
    setIsModalOpen(false);
    setEditingPost(null);
  }
  //Modal에서 닫기 버튼 클릭 시 호출되는 함수
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  //게시글 삭제
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("삭제하시겠습니까?");

    if (isConfirmed){
      try{
        const response = await deletePost(id); //axios.delete(`http://localhost:4000/api/posts/${id}`);
        alert(response.data.message);
        //const res = await getPosts(); //axios.get("http://localhost:4000/api/posts");
        fetchPosts(currentPage); //setPosts(res.data);
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다.");
      }    
    }
  }

  //페이지 변경 핸들러 
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            <Link to={`/post/${post.id}`}>상세보기</Link>
            <button onClick={() =>handleEdit(post)}>수정</button>
            <button onClick={() =>handleDelete(post.id)}>삭제</button>
          </li>
        ))}        
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          post={editingPost}
        />
      </ul>
      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
      />
    </div>   
  ); 
}

export default PostList;
  
