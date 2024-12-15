import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './AccountManagement.css'; // 引入 CSS 文件

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('id');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountDetails, setAccountDetails] = useState({
    id: '',
    username: '',
    role: 'student',
  });
  const [isSaving, setIsSaving] = useState(false); // 用於防止重複提交

  // 初始化加載使用者列表
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails({ ...accountDetails, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSaveAccount = async () => {
    const { id, username, role } = accountDetails;

    // 驗證表單資料
    if (!id || !username || !role) {
      alert('請填寫完整的帳號資訊！');
      return;
    }

    // 檢查是否重複 ID（僅在新增時）
    if (!editingAccount && accounts.some((account) => account.id === id)) {
      alert('此帳號 ID 已存在，請使用其他 ID！');
      return;
    }

    setIsSaving(true); // 防止重複提交
    try {
      if (editingAccount) {
        // 編輯帳號
        await axios.put(`http://localhost:5000/api/accounts/${editingAccount.id}`, accountDetails);
      } else {
        // 新增帳號
        await axios.post('http://localhost:5000/api/accounts', accountDetails);
      }
      alert(editingAccount ? '帳號更新成功！' : '帳號新增成功！');
      fetchAccounts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('保存失敗，請稍後再試！');
    } finally {
      setIsSaving(false); // 恢復按鈕狀態
    }
  };

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/accounts/${accountToDelete}`);
        fetchAccounts();
        alert('帳號刪除成功');
        setShowDeleteConfirm(false);
        setAccountToDelete(null);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          alert('帳號不存在，無法刪除');
        } else {
          console.error('Error deleting account:', error);
          alert('刪除失敗，請稍後再試');
        }
      }
    }
  };

  const handleConfirmDelete = (id) => {
    setAccountToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountDetails(account);
    setShowModal(true);
  };

  const handleAddAccount = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setAccountDetails({ id: '', username: '', role: 'student' });
    setEditingAccount(null);
  };

  const filteredAccounts = accounts.filter((account) =>
    account[searchBy]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="account-management">
      <h1 className="title">帳號管理</h1>
      <div className="toolbar">
        <div className="search-container">
          <input
            type="text"
            placeholder={`搜尋${searchBy === 'id' ? '帳號' : '姓名'}`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="search-select"
          >
            <option value="id">帳號</option>
            <option value="username">姓名</option>
          </select>
        </div>
        <button className="add-button" onClick={handleAddAccount}>
          新增帳號
        </button>
      </div>
      <table className="account-table">
        <thead>
          <tr>
            <th>帳號</th>
            <th>姓名</th>
            <th>管理權限</th>
            <th>修改</th>
            <th>刪除</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map((account) => (
            <tr key={account.id}>
              <td>{account.id}</td>
              <td>{account.username}</td>
              <td>{account.role === 'admin' ? '✔️' : '❌'}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleEditAccount(account)}
                >
                  編輯
                </button>
              </td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => handleConfirmDelete(account.id)}
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingAccount ? '編輯帳號' : '新增帳號'}</h3>
            <div className="modal-form">
              <label>
                帳號:
                <input
                  type="text"
                  name="id"
                  value={accountDetails.id}
                  onChange={handleInputChange}
                  placeholder="輸入帳號"
                  disabled={!!editingAccount}
                  required
                />
              </label>
              <label>
                姓名:
                <input
                  type="text"
                  name="username"
                  value={accountDetails.username}
                  onChange={handleInputChange}
                  placeholder="輸入姓名"
                  required
                />
              </label>
              <label>
                權限:
                <select
                  name="role"
                  value={accountDetails.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="student">學生</option>
                  <option value="admin">管理者</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button
                onClick={handleSaveAccount}
                className="save-button"
                disabled={isSaving} // 防止重複提交
              >
                保存
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-button">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>確認刪除帳號?</h3>
            <div className="modal-actions">
              <button onClick={handleDeleteAccount} className="confirm-button">
                確認刪除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
