import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/api';
import '../styles/AuthForm.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await register(username, password);
            setMessage(response.data.message);
            alert('회원가입 성공! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.message);
            } else {
                setMessage('회원가입 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>회원가입</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <div>
                    <label>아이디:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">가입하기</button>
            </form>
            {message && <p className="auth-message">{message}</p>}
            <p className="auth-switch-link">
                이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            </p>
        </div>
    );
}

export default Register;
