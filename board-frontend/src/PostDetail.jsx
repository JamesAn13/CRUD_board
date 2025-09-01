import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// import axios from 'axios'; => api.js로 이동
import { getPostById, getComments, createComment, deleteComment } from './api';
import './App.css';

function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({ author: "", content: ""});

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
        if (!newComment.author || !newComment.content) {
            alert("작성자와 내용을 입력해주세요.");
            return;
        }
        try {
            await createComment( id, newComment); //axios.post(`/api/posts/${id}/comments`, newComment);
            setNewComment({ author: "", content: ""});
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

    if (!post) return <p>로딩 중...</p>;

    return (
        <div className="post-detail">
            <h2>{post.title}</h2>
            <p><b>작성자:</b> {post.author}</p>
            <p>{post.content}</p>
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
                                <button 
                                    className='button-delete'
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    삭제
                                </button>;
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>아직 댓글이 없습니다.</p>
                )}
            </div>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
                <h4>새 댓글 작성</h4>
                <input
                    className="input"
                    type="text"
                    name="author"
                    placeholder="작성자"
                    value={newComment.author}
                    onChange={handleCommentChange}
                />
                <textarea
                    className="textarea"
                    name="content"
                    placeholder="내용"
                    value={newComment.content}
                    onChange={handleCommentChange}
                />
                <button className="button" type="submit">댓글 등록</button>
            </form>
        </div>
    )
}

export default PostDetail;