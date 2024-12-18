import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './PersonalInfo.css';

const PersonalInfo = () => {
    const [userInfo, setUserInfo] = useState({ id: '', username: '', role: '', passwordLength: 0 });
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const userId = localStorage.getItem('id'); // 從 localStorage 取得當前用戶ID

    // 獲取使用者信息
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                setUserInfo(response.data);
            } catch (error) {
                console.error('獲取個人資訊失敗:', error);
            }
        };

        fetchUserInfo();
    }, [userId]);

    // 修改密碼
// 修改密碼函數
const handleChangePassword = async (e) => {
    e.preventDefault();

    if (oldPassword === newPassword) {
        alert('新密碼不可與舊密碼相同');
        return;
    }

    try {
        const response = await axios.put(`http://localhost:5000/api/user/change-password/${userId}`, {
            oldPassword,
            newPassword,
        });

        // 成功提示
        showNotification("密碼修改成功", "您的密碼已成功更新！");
        setUserInfo({ ...userInfo, passwordLength: newPassword.length });

        // 清空輸入框並關閉編輯狀態
        setOldPassword('');
        setNewPassword('');
        setShowEditPassword(false);
    } catch (error) {
        // 處理失敗
        const errorMessage = error.response?.data?.message || '密碼修改失敗，請重試！';

        // 特別處理舊密碼錯誤
        if (errorMessage === '舊密碼錯誤') {
            showNotification("密碼修改失敗", "您輸入的舊密碼不正確，請重新輸入！");
        } else {
            showNotification("密碼修改失敗", errorMessage);
        }
    }
};

    // 顯示通知
    const showNotification = (title, message) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body: message, icon: '/notification-icon.png' });
        } else {
            alert(`${title}: ${message}`);
        }
    };

    // 請求通知權限
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="personal-info-container">
            <h1 className="personaltitle">個人資訊</h1>
            <div className="user-info">
                <p><strong>帳號：</strong> {userInfo.id}</p>
                <p><strong>姓名：</strong> {userInfo.username}</p>
                <p><strong>角色：</strong> {userInfo.role}</p>
                <p>
                    <strong>密碼：</strong>
                    {'*'.repeat(userInfo.passwordLength)} {/* 根據密碼長度顯示 * */}
                    <button
                        className="edit-password-button"
                        onClick={() => setShowEditPassword((prev) => !prev)}
                        style={{ marginLeft: '10px' }}
                    >
                        {showEditPassword ? '取消變更' : '變更密碼'}
                    </button>
                </p>
            </div>

            {/* 顯示修改密碼表單 */}
            {showEditPassword && (
                <form onSubmit={handleChangePassword} className="change-password-form">
                    <div className="form-group">
                        <label>請輸入舊密碼：</label>
                        <div className="password-input-container">
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setShowOldPassword((prev) => !prev)}
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                            >
                                {showOldPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>請輸入新密碼：</label>
                        <div className="password-input-container">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                            >
                                {showNewPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="submit-button">確認修改</button>
                </form>
            )}
        </div>
    );
};

export default PersonalInfo;
