import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import './PersonalInfo.css';

const PersonalInfo = () => {
    const { enqueueSnackbar } = useSnackbar(); // 使用 useSnackbar 來顯示通知
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
            enqueueSnackbar("新密碼不可與舊密碼相同！", { variant: 'error', autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
            return;
        }
    
        setLoading(true); // 開始加載
    
        if (!checkPasswordStrength(newPassword)) {
            enqueueSnackbar("新密碼必須至少包含6個字元！", { variant: 'error', autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
            setLoading(false); // 密碼不合格時停止加載
            return;
        }
    
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
                setShowEditPassword(false); // 密碼修改成功後隱藏表單
                enqueueSnackbar("密碼修改成功！", { variant: 'success', autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
            } else {
                enqueueSnackbar("密碼修改失敗，請重試！", { variant: 'error', autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
            }
        } catch (error) {
            console.error('錯誤:', error);
            const errorMessage = error.response?.data?.message || '密碼修改失敗，請重試！';
            enqueueSnackbar(errorMessage, { variant: 'error', autoHideDuration: 2000,anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        } finally {
            setLoading(false); // 不論成功還是失敗都會停止加載
        }
    };
    
    return (
        <div className="personal-info-container">
            <h1 className="personaltitle">個人資訊</h1>
            <div className="personalcontent">
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
