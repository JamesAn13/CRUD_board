import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import '../styles/AuthForm.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            localStorage.setItem('token', response.data.token);
            alert('로그인 성공! 메인 페이지로 이동합니다.');
            navigate('/');
            window.location.reload();
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.message);
            } else {
                setMessage('로그인 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>로그인</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <div>
                    <label>아이디:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="button">로그인</button>
            </form>
            {message && <p className="auth-message">{message}</p>}
            <p className="auth-switch-link">
                계정이 없으신가요? <Link to="/register">회원가입</Link>
            </p>
        </div>
    );
}

export default Login;