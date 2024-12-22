import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './PersonalInfo.css';

const PersonalInfo = () => {
    const [userInfo, setUserInfo] = useState({ id: '', username: '', role: '', passwordLength: 0 });
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [loading, setLoading] = useState(false); // 加載狀態
    const [passwordVisibility, setPasswordVisibility] = useState({
        oldPassword: false,
        newPassword: false,
    });

    const userId = localStorage.getItem('id'); // 從 localStorage 取得使用者 ID

    useEffect(() => {
        if (!userId) {
            alert('未登錄，請重新登錄');
            window.location.href = '/login';
            return;
        }

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                setUserInfo(response.data);
            } catch (error) {
                console.error('獲取個人資訊失敗:', error.response || error.message);
                alert('無法獲取用戶資料，請稍後重試');
                window.location.href = '/login'; // 如果資料獲取失敗，強制登出
            }
        };

        fetchUserInfo();
    }, [userId]); // 當 userId 變化時重新拉取資料

    const checkPasswordStrength = (password) => {
        return password.length >= 6; // 密碼至少需要6個字元
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (oldPassword === newPassword) {
            showNotification("密碼修改失敗", "新密碼不可與舊密碼相同！", false);
            return;
        }

        if (!checkPasswordStrength(newPassword)) {
            showNotification("密碼修改失敗", "新密碼必須至少包含6個字元！", false);
            return;
        }

        setLoading(true); // 開始加載

        try {
            console.log('請求資料:', { oldPassword, newPassword });

            const response = await axios.put(
                `http://localhost:5000/api/user/change-password/${userId}`,
                { oldPassword, newPassword },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                setUserInfo(prev => ({
                    ...prev,
                    passwordLength: newPassword.length,
                }));
                showNotification("密碼修改成功", "您的密碼已成功修改！", true);
            } else {
                showNotification("密碼修改失敗", "密碼修改失敗，請重試！", false);
            }
        } catch (error) {
            console.error('錯誤:', error);
            const errorMessage = error.response?.data?.message || '密碼修改失敗，請重試！';
            showNotification("密碼修改失敗", errorMessage, false);
        } finally {
            setLoading(false); // 停止加載
        }
    };

    const showNotification = (title, message, isSuccess) => {
        const icon = isSuccess ? '/success-icon.png' : '/error-icon.png';
        console.log('顯示通知:', title, message, isSuccess);

        if (Notification.permission === "granted") {
            new Notification(title, { body: message, icon });
        } else {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body: message, icon });
                } else {
                    console.warn('通知權限未授予，無法顯示通知');
                    alert(`${title}: ${message}`);
                }
            });
        }
    };

    return (
        <div className="personal-info-container">
            <h1 className="personaltitle">個人資訊</h1>
            <div className="user-info">
                <p><strong>帳號：</strong> {userInfo.id}</p>
                <p><strong>姓名：</strong> {userInfo.username}</p>
                <p><strong>角色：</strong> {userInfo.role}</p>
                <p>
                    <strong>密碼：</strong>
                    {userInfo.passwordLength === 0
                        ? '未設置密碼' 
                        : '*'.repeat(userInfo.passwordLength)} 
                    <button
                        className="edit-password-button"
                        onClick={() => {
                            if (showEditPassword) {
                                setOldPassword('');
                                setNewPassword('');
                            }
                            setShowEditPassword((prev) => !prev);
                        }}
                        style={{ marginLeft: '10px' }}
                    >
                        {showEditPassword ? '取消變更' : '變更密碼'}
                    </button>
                </p>
            </div>

            {showEditPassword && (
                <form onSubmit={handleChangePassword} className="change-password-form">
                    <div className="form-group">
                        <label>請輸入舊密碼：</label>
                        <div className="password-input-container">
                            <input
                                type={passwordVisibility.oldPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setPasswordVisibility(prev => ({ ...prev, oldPassword: !prev.oldPassword }))}
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                            >
                                {passwordVisibility.oldPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>請輸入新密碼：</label>
                        <div className="password-input-container">
                            <input
                                type={passwordVisibility.newPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setPasswordVisibility(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                            >
                                {passwordVisibility.newPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? '修改中...' : '確認修改'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default PersonalInfo;
