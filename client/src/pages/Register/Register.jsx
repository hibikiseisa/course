import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:5000/api/register', {
                username,
                password,
            });
            alert('註冊成功');
            navigate('/login');
        } catch (error) {
            alert('註冊失敗');
            console.error("註冊錯誤：", error);
        }
    };

    return (
        <div className="outer-container">
            <div className="login-container">
                <h2>註冊</h2>
                <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">帳號</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="請輸入帳號"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">密碼</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="請輸入密碼"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    
                    <button type="submit" className="login-button">註冊</button>
                </form>
                <a onClick={() => navigate('/login')} className="register-link">已經有帳號？登入</a>
            </div>
        </div>
    );
};

export default Register;
