import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './personal-management.css';

const PersonalManagement = () => {
  const [userInfo, setUserInfo] = useState(null); // 儲存用戶資料
  const [editMode, setEditMode] = useState(null); // 編輯模式
  const [inputValue, setInputValue] = useState(''); // 輸入框的暫存值
  const [error, setError] = useState(''); // 儲存錯誤訊息
  const [success, setSuccess] = useState(''); // 儲存成功訊息
  const [showPassword, setShowPassword] = useState(false); // 密碼顯示控制

  // 取得登入的用戶 ID
  const userId = localStorage.getItem('userId');

  // 讀取用戶資料
  useEffect(() => {
    if (!userId) {
      setError('請先登入');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/accounts/${userId}`);
        setUserInfo(response.data); // 設定用戶資料
      } catch (err) {
        setError('載入資料失敗');
      }
    };

    fetchUserInfo();
  }, [userId]);

  // 進入編輯模式
  const handleEdit = (field) => {
    setEditMode(field);
    setInputValue(userInfo[field]); // 設定預設值
    setError('');
    setSuccess('');
  };

  // 取消編輯
  const handleCancel = () => {
    setEditMode(null);
    setInputValue('');
    setError('');
    setSuccess('');
  };

  // 確認修改
  const handleConfirm = async () => {
    if (!inputValue) {
      setError('輸入欄位不能為空');
      return;
    }

    try {
      // 更新用戶資料到後端
      const response = await axios.put(`http://localhost:5000/api/accounts/${userId}`, {
        [editMode]: inputValue,
      });

      // 成功更新資料
      setUserInfo((prev) => ({
        ...prev,
        [editMode]: inputValue,
      }));
      setEditMode(null);
      setInputValue('');
      setError('');
      setSuccess(`${editMode === 'id' ? '帳號' : editMode === 'password' ? '密碼' : editMode === 'name' ? '姓名' : '資料'}更新成功`);
    } catch (err) {
      setError('更新失敗，請稍後再試');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // 切換密碼顯示/隱藏
  };

  // 如果 userId 無效，顯示錯誤
  if (!userId) {
    return <div>請先登入</div>;
  }

  if (!userInfo) {
    return <div>載入中...</div>;
  }

  return (
    <div className="personal-management-container">
      <h1 className="title">個人帳號管理</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="info-container">
        {/* 顯示學生姓名 */}
        <div className="info-row">
          <p>
            <strong>姓名：</strong>
            {editMode === 'name' ? (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="輸入新姓名"
              />
            ) : (
              userInfo.username
            )}
          </p>
          {editMode === 'name' ? (
            <div className="action-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                確認修改
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                取消
              </button>
            </div>
          ) : (
            <button className="edit-button" onClick={() => handleEdit('name')}>
              更改姓名
            </button>
          )}
        </div>

        {/* 顯示學生學號 */}
        <div className="info-row">
          <p>
            <strong>學號：</strong>
            {userInfo.studentId}
          </p>
        </div>

        {/* 顯示科系 */}
        <div className="info-row">
          <p>
            <strong>科系：</strong>
            {editMode === 'department' ? (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="輸入新科系"
              />
            ) : (
              userInfo.department
            )}
          </p>
          {editMode === 'department' ? (
            <div className="action-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                確認修改
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                取消
              </button>
            </div>
          ) : (
            <button className="edit-button" onClick={() => handleEdit('department')}>
              更改科系
            </button>
          )}
        </div>

        {/* 顯示帳號 */}
        <div className="info-row">
          <p>
            <strong>帳號：</strong>
            {editMode === 'id' ? (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="輸入新帳號"
              />
            ) : (
              userInfo.id
            )}
          </p>
          {editMode === 'id' ? (
            <div className="action-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                確認修改
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                取消
              </button>
            </div>
          ) : (
            <button className="edit-button" onClick={() => handleEdit('id')}>
              更改帳號
            </button>
          )}
        </div>

        {/* 顯示密碼 */}
        <div className="info-row">
          <p>
            <strong>密碼：</strong>
            {editMode === 'password' ? (
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'} // 根據 showPassword 狀態切換顯示
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="輸入新密碼"
                />
                <span 
                  className="eye-icon" 
                  onClick={togglePasswordVisibility} // 點擊眼睛圖示切換密碼顯示
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            ) : (
              '******' // 隱藏密碼
            )}
          </p>
          {editMode === 'password' ? (
            <div className="action-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                確認修改
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                取消
              </button>
            </div>
          ) : (
            <button className="edit-button" onClick={() => handleEdit('password')}>
              更改密碼
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalManagement;
