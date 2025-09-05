import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/App.css';
import Modal from '../components/Modal';
import { getPosts, createPost, updatePost, deletePost } from '../api/api';
import Pagination from '../components/Pagination';
import { jwtDecode } from 'jwt-decode';

//게시글 목록을 보여주고, 작성, 수정, 삭제 기능을 제공하는 컴포넌트
function PostList() {
  //useState : 상태를 추가하고 관리하는 hook
  const[posts, setPosts] = useState([]);
  const[form, setForm] = useState({ title: "", content:""});// 로그인 기능 구현 하면서 author는 없어짐
  const[ isModalOpen, setIsModalOpen] = useState(false);
  const[ editingPost, setEditingPost] = useState(null);

  const token = localStorage.getItem('token');
  //로그인 -> 사용지의 username를 저장하는 변수
  let loggedInUsername = null;
  if (token ) {
    try {
      const decodedToken = jwtDecode(token);
      loggedInUsername = decodedToken.username;
    } catch (error) {
      console.error("토큰 디코딩 오류:", error);
      //토큰이 유효하지 않으면 로그아웃 처리
      localStorage.removeItem('token');
    }
  }

  //페이지네이션 상태 추가
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ totalPages, setTotalPages ] = useState(0);
  const [ limit ] = useState(10); //한 페이지에 보여줄 글 개수

  // --- 검색 기능에 필요한 새로운 상태(State) 변수들 ---
  // 사용자가 검색창에 입력하는 값을 실시간으로 저장하는 상태
  const [searchTerm, setSearchTerm] = useState("");
  // 실제 검색 실행 버튼을 눌렀을 때의 검색어를 저장하는 상태 (이 값으로 API 요청)
  const [searchQuery, setSearchQuery] = useState("");

  //데이터를 페이지네이션과 '검색어'에 맞게 불러오는 함수로 수정
  const fetchPosts = async (page, search) =>{ // search 인자 추가
    try {
      // api.js에서 수정한 getPosts 함수에 page, limit, search 값을 모두 전달
      const res = await getPosts(page, limit, search);
      setPosts(res.data.posts); //axios.get("http://localhost:4000/api/posts").then(res => setPosts(res.data));
      setTotalPages(Math.ceil(res.data.total / limit)); //총 페이지 수 계산
    } catch (error) {
      console.log("게시글을 불러오는데 실패했습니다.", error);
    }
  }

  //useEffect : 컴포넌트가 렌더링된 후 특정 작업을 수행하는 hook
  // useEffect가 currentPage(페이지 이동)뿐만 아니라 searchQuery(검색 실행)가 변경될 때도 실행되도록 수정
  useEffect(() => {
    fetchPosts(currentPage, searchQuery);
  }, [currentPage, searchQuery]); // 의존성 배열에 searchQuery 추가

  //게시글 작성 폼을 제출하는 기능을 담당하는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPost(form);
    setForm({ title: "", content:""});
    // 새 글 작성 후에는 검색 상태를 초기화하고 첫 페이지로 이동
    setSearchTerm("");
    setSearchQuery("");
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPosts(1, "");
    }
  };

  //Modal에서 수정할 게시글을 상태에서 저장 & 모달 열기
  const handleEdit = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  //Modal에서 저장 버튼 클릭 시 호출되는 함수
  const handleSave = async ( updatedPost) => {
    // 수정 시에는 현재 검색 상태를 유지하며 데이터만 새로고침
    await updatePost(updatedPost.id, updatedPost);
    fetchPosts(currentPage, searchQuery);
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
        await deletePost(id);
        // 삭제 시에도 현재 검색 상태를 유지하며 데이터만 새로고침
        fetchPosts(currentPage, searchQuery);
      } catch (error) {
        // 백엔드에서 오는 상세한 오류 메시지를 보여주는 것이 더 좋습니다.
        alert(error.response?.data?.message || "삭제 중 오류가 발생했습니다.");
      }
    }
  }

  //페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  // --- 검색 실행을 처리할 새로운 핸들러 함수 ---
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // form 태그의 기본 동작(페이지 새로고침) 방지
    setCurrentPage(1); // 검색 결과는 항상 1페이지부터 보여줘야 함
    setSearchQuery(searchTerm); // 사용자가 입력한 searchTerm을 실제 API 요청에 사용할 searchQuery에 반영
  }


  // --- 7. JSX(화면 UI) 부분 수정 ---
  return (
    <div className='container'>
      <h1 className='title'>게시판</h1>
      {/* 토큰 있을 때만 작성가능(작성폼 보여줌) */}
      {token && (
        <form className='form' onSubmit={handleSubmit}>
          {/* ... 글쓰기 form 내용은 기존과 동일 ... */}
          <input
            className='input'
            placeholder='제목'
            value ={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
          <textarea
            className='textarea'
            placeholder='내용'
            value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
          />
          <button className='button' type="submit">등록</button>
        </form>
      )}

      {/* --- 검색창 UI 추가 --- */}
      <form className='search-form' onSubmit={handleSearchSubmit}>
        <input
          className='input'
          type="text"
          placeholder="제목 또는 내용으로 검색"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className='button' type="submit">검색</button>
      </form>
      {/* --- 검색창 UI 끝 --- */}


      <ul className='post-list'>
        {/* ... 게시글 목록을 보여주는 부분은 기존과 동일 ... */}
        {posts.map(post => (
          <li className="post-item" key={post.id}>
            <strong className="post-title">{post.title}</strong>
            <span className="post-author">({post.author})</span>
            <p className="post-content">{post.content}</p>
            <Link to={`/posts/${post.id}`}>상세보기</Link>
            {/* 수정/삭제 버튼 조건부 렌더링 */}
            {loggedInUsername && loggedInUsername === post.author && (
              <>
                <button onClick={() => handleEdit(post)}>수정</button>
                <button onClick={() => handleDelete(post.id)}>삭제</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        post={editingPost}
      />
      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
      />
    </div>
  );
}

export default PostList;
  
