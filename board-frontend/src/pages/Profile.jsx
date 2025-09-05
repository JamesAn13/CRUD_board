import { jwtDecode } from "jwt-decode";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import api from "../api/api"; 
import {getMyComments} from "../api/api"


function Profile() {
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');
    const [posts, setPosts] = useState([]); //내가 작성한 글 목록 저장상태
    const [myComments, setMyComments] = useState([]); //내가 작성한 댓글 목록
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUsername(decodedToken.username);
                setUserId(decodedToken.id);    
                
                //API호출 -> 내가 쓴 목록 가져와이
                const fetchMyPosts = async () => {
                    try {
                        const response = await api.get('/my-posts');
                        setPosts(response.data);
                    } catch (error) {
                        console.error("내 글 목록을 가져오는데 실패했습니다.", error);
                    }
                };
                //내가 쓴 댓글 가져와이
                const fetchMyComments = async () => {
                    try {
                        const response = await getMyComments();
                        setMyComments(response.data);
                    } catch (error) {
                        console.error("내 댓글 목록을 가져오는데 실패했습니다.", error);
                    }
                };

                fetchMyPosts();
                fetchMyComments();

            } catch (error) {
                console.error("토큰 디코딩 오류:", error);
                localStorage.removeItem('token'); // 유효하지 않은 토큰 삭제
                navigate('/login'); // 로그인 페이지로 리다이렉트
            }
        } else {
            //토큰 X -> login페이지로 이동
            navigate('/login');
        }
    }, [navigate]) //navigate가 변경될때마다 useEffect 재실행

    return (
        <div className="container">
            <h1 className="title">내 프로필</h1>
            <div className="profile-info">
                <p><strong>아이디:</strong> {username}</p>
                <p><strong>사용자 ID:</strong> {userId}</p>
                {/* 여기에 비밀번호 변경 등 추가 기능 버튼을 넣을 수 있습니다. */}
            </div>

            <div className="my-posts">
                <h2 className="subtitle">내가 작성한 게시글</h2>
                {posts.length > 0 ? (
                    <ul>
                        {posts.map(post => (
                            <li key={post.id}>
                                <Link to={`/posts/${post.id}`}>{post.title}</Link>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (<p>작성한 게시글이 없습니다.</p>) }
            </div>

            <div className="my-comments">
                <h2 className="subtitle">내가 작성한 댓글</h2>
                {myComments.length > 0 ? (
                    <ul>
                        {myComments.map(comment => (
                            <li key={comment.id}>
                                <div className="comment-content">"{comment.content}"</div>
                                <div className="comment-post-link">
                                    <Link to={`/posts/${comment.postId}`}>
                                        '{comment.postTitle}' 게시글에서
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (<p>작성한 댓글이 없습니다.</p>) }
            </div>
            <Link to="/">홈으로 돌아가기</Link>
        </div>
    );
}

export default Profile;