import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './AccountManagement.css'; // 引入 CSS 文件

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
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
    password: '', // 添加密碼欄位
  });
    const [isSaving, setIsSaving] = useState(false);

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
    const { username, value } = e.target;
    setAccountDetails({ ...accountDetails, [username]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 保存帳號（新增或編輯）
  const handleSaveAccount = async () => {
    const { id, username, role, password } = accountDetails;

    console.log('Saving account details:', accountDetails);

    // 驗證表單資料
    if (!id.trim() || !username.trim() || !role.trim()) {
      alert('所有欄位必須填寫完整！');
      return;
    }

    // 檢查重複 ID（僅在新增時檢查）
    if (!editingAccount && accounts.some((account) => account.id === id)) {
      alert('此帳號 ID 已存在，請使用其他 ID！');
      return;
    }

    setIsSaving(true);
    try {
      if (editingAccount) {
        // 編輯帳號
        await axios.put(`http://localhost:5000/api/accounts/${editingAccount.id}`, accountDetails);
      } else {
        // 新增帳號
        const { id, username, role, password } = accountDetails;
        await axios.post('http://localhost:5000/api/accounts', { id, username, role, password });
              }
      alert(editingAccount ? '帳號更新成功！' : '帳號新增成功！');
      fetchAccounts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('保存失敗，請稍後再試！');
    } finally {
      setIsSaving(false);
    }
  };

  // 刪除帳號
  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/accounts/${accountToDelete}`);
        fetchAccounts();
        alert('帳號刪除成功');
        setShowDeleteConfirm(false);
        setAccountToDelete(null);
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  // 確認刪除
  const handleConfirmDelete = (id) => {
    setAccountToDelete(id);
    setShowDeleteConfirm(true);
  };

  // 編輯帳號
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountDetails(account);
    setShowModal(true);
  };

  // 新增帳號
  const handleAddAccount = () => {
    resetForm();
    setShowModal(true);
  };

  // 重置表單
  const resetForm = () => {
    setAccountDetails({ id: '', username: '', role: 'student' });
    setEditingAccount(null);
  };

  // 過濾帳號列表
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
        <button className="add-button" onClick={() => setShowModal(true)}>
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
                  onClick={() => handleDeleteAccount(account.id)}
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
              <button onClick={handleSaveAccount} className="save-button">
                保存
              </button>
              <button
                onClick={() => setShowModal(false)}
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
