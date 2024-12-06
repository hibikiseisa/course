import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [id, setId] = useState(''); // 帳號
    const [username, setUsername] = useState(''); // 姓名
    const [password, setPassword] = useState(''); // 密碼
    const [errors, setErrors] = useState({}); // 錯誤訊息
    const navigate = useNavigate();

    const validateInputs = () => {
        const newErrors = {};

        if (id.length < 6 || id.length > 20) {
            newErrors.id = '帳號必須介於 6 至 20 個字之間';
        }
        if (username.length < 2 || username.length > 20) {
            newErrors.username = '姓名必須介於 2 至 20 個字之間';
        }
        if (password.length < 6 || password.length > 20) {
            newErrors.password = '密碼必須介於 6 至 20 個字之間';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // 若無錯誤則返回 true
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateInputs()) return; // 若有錯誤則不繼續提交

        try {
            await axios.post('http://localhost:5000/api/register', {
                id,
                username,
                password,
            });
            alert('註冊成功');
            navigate('/login');
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || '註冊失敗，請稍後再試';
            alert(errorMessage);
            console.error('註冊錯誤：', error);
        }
    };

    return (
        <div className="outer-container">
            <div className="login-container">
                <h2>註冊</h2>
                <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                        <label htmlFor="id">帳號</label>
                        <input
                            type="text"
                            id="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder="請輸入帳號"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">姓名</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="請輸入姓名"
                            required
                            autoComplete="name"
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
                    <div>
                        {errors.id && <p className="error-message">{errors.id}</p>}

                        {errors.username && (
                            <p className="error-message">{errors.username}</p>
                        )}
                        {errors.password && (
                            <p className="error-message">{errors.password}</p>
                        )}
                    </div>
                    <button type="submit" className="login-button">註冊</button>
                </form>
                <a onClick={() => navigate('/login')} className="register-link">
                    已經有帳號？登入
                </a>
            </div>
        </div>
    );
};

export default Register;
