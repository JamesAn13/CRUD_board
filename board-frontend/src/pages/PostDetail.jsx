import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios'; => api.js로 이동
import { getPostById, getComments, createComment, deleteComment, updatePost, deletePost } from '../api/api';
import '../styles/App.css';
import { jwtDecode } from 'jwt-decode';
import Modal from '../components/Modal'; //모달 추가(게시글 수정)

function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({ content: ""}); //author 제거-> id로 바꿈

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    //로그인한 유저 이름 가져오기
    const token = localStorage.getItem('token');
    let loggedInUsername = null;
    if(token) {
        try {
            const decodedToken = jwtDecode(token);
            loggedInUsername = decodedToken.username;
        } catch (error) {
            console.error("토큰 디코인 오류", error);
            localStorage.removeItem('token');
        }
    }

    //댓글 가져오기
    const fetchComments = async () => {
        try {
            const res = await getComments(id); //axios.get(`/api/posts/${id}/comments`);
            setComments(res.data);
        } catch (error) {
            console.error("댓글을 불러오는데 실패했습니다.", error);
        }
    };

    useEffect(() => {
        getPostById(id)
            .then(res => {
                setPost(res.data);//axios.get(`http://localhost:4000/api/posts/${id}`).then(res => setPost(res.data));
                fetchComments(); //게시글 불러온 다음에 댓글 불러옴
            })
            .catch(error => {
                console.error("게시글을 불러오는데 실패했습니다.", error);
            });
    },[id]);

    const handleCommentChange = (e) => {
        const { name, value } = e.target;
        setNewComment(prev => ({ ...prev, [name]: value }));
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        //로그인 기능 구현 -> 작성자 X
        if (!newComment.content) {
            alert("내용을 입력해주세요.");
            return;
        }
        //로그인 X -> 댓글 작성 불가
        if (!loggedInUsername) {
            alert("로그인해야 댓글을 작성할 수 있습니다.");
            return;
        }
        try {
            await createComment( id, { author: loggedInUsername, content: newComment.content});
            setNewComment({ content: ""});
            fetchComments(); //댓글 작성 후 댓글 목록 갱신
        } catch (error) {
            console.error("댓글 작성에 실패했습니다.", error);
            alert("댓글 작성에 실패했습니다.");
        }
    };

    //댓글 삭제
    const handleDeleteComment = async (commentId) => {
        if(window.confirm("댓글을 삭제하시겠습니까?")) {
            try {
                await deleteComment(id, commentId); //axios.delete(`/api/posts/${id}/comments/${commentId}`);
                setComments(comments.filter(comment => comment.id !== commentId)); //삭제된 댓글을 상태에서 제거
            } catch (error) {
                console.error("댓글 삭제에 실패했습니다.", error);
                alert("댓글 삭제에 실패했습니다.");
            }
        }
    };
    //글 수정
    const handleEdit = () => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedPost) => {
        try { 
            const response = await updatePost(id, updatedPost);
            setPost(response.data); //수정된 내용 -> 현재 페이지 상태 update
            setIsModalOpen(false);
            setEditingPost(null);
            // window.location.reload(); 사용가능 - 부드러운 UX제공
        } catch (error) {
            console.error("게시글 수정에 실패했습니다.", error);
            alert("게시글 수정에 실패했습니다.");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const handleDelete = async () => {
        if(window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            try{
                await deletePost(id);
                alert("게시글이 삭제되었습니다.");
                navigate('/'); //삭제 후 홈으로 이동
            } catch (error) {
                console.error("게시글 삭제에 실패했습니다.", error);
                alert("게시글 삭제에 실패했습니다.");
            }
        }
    };

    if (!post) return <p>로딩 중...</p>;

    return (
        <div className="post-detail">
            <h2>{post.title}</h2>
            <p><b>작성자:</b> {post.author}</p>
            <p>{post.content}</p>

            {/* 로그인 사용자와 글 작성자가 같을 때만 버튼 표시 */}
            {loggedInUsername && loggedInUsername === post.author && (
                <div className="post-actions">
                    <button onClick={handleEdit}>수정</button>
                    <button onClick={handleDelete} className="button-delete">삭제</button>
                </div>
            )}

            <Link to="/">목록으로</Link>

            <hr />

            <div className="comments-section">
                <h3>댓글</h3>
                {comments.length > 0 ? (
                    <ul className="comment-list">
                        {comments.map(comment => (
                            <li key={comment.id} className="comment-item">
                                <strong>{comment.author}</strong>
                                <p>{comment.content}</p>
                                <span className="comment-date">
                                    {new Date(comment.createdAt).toLocaleString()}
                                </span>
                                {loggedInUsername && loggedInUsername === comment.author && (
                                    <button 
                                        className='button-delete'
                                        onClick={() => handleDeleteComment(comment.id)}
                                    >
                                        삭제
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>아직 댓글이 없습니다.</p>
                )}
            </div>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
                <h4>새 댓글 작성</h4>
                {loggedInUsername ? (
                    <p>댓글 작성자: <b>{loggedInUsername}</b></p>
                ) : (
                    <p>댓글을 작성하려면 <Link to="/login">로그인</Link>해주세요.</p>
                )}
                <textarea
                    className="textarea"
                    name="content"
                    placeholder="내용"
                    value={newComment.content}
                    onChange={handleCommentChange}
                    disabled={!loggedInUsername} // 로그인하지 않으면 비활성화
                />
                <button 
                    className="button" 
                    type="submit"
                    disabled={!loggedInUsername} // 로그인하지 않으면 비활성화
                >
                    댓글 등록
                </button>
            </form>
            
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                post={editingPost}
            />
        </div>
    )
}

export default PostDetail;