import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PersonalInfo.css';

const PersonalInfo = () => {
    const [userInfo, setUserInfo] = useState({ id: '', username: '', role: '' });
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const userId = localStorage.getItem('id'); // 從 localStorage 取得當前用戶ID

    // 取得個人資訊
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                setUserInfo(response.data);
            } catch (error) {
                console.error('獲取個人資訊失敗:', error);
                setErrorMessage('無法獲取個人資訊');
            }
        };

        fetchUserInfo();
    }, [userId]);

    // 修改密碼
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await axios.put(`http://localhost:5000/api/user/change-password/${userId}`, {
                oldPassword,
                newPassword
            });
            setSuccessMessage(response.data.message);
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || '修改密碼失敗');
        }
    };

    return (
        <div className="personal-info-container">
            <h2>個人資訊</h2>
            <div className="user-info">
                <p><strong>帳號：</strong> {userInfo.id}</p>
                <p><strong>姓名：</strong> {userInfo.username}</p>
                <p><strong>角色：</strong> {userInfo.role}</p>
            </div>

            <h3>修改密碼</h3>
            <form onSubmit={handleChangePassword} className="change-password-form">
                <div className="form-group">
                    <label>舊密碼：</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>新密碼：</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-button">修改密碼</button>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
        </div>
    );
};

export default PersonalInfo;
