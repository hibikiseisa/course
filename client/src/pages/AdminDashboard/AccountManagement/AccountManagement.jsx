import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import './AccountManagement.css'; // 引入 CSS 文件

const AccountManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
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
    const { name, value } = e.target;
    setAccountDetails({ ...accountDetails, [name]: value });
    };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 保存帳號（新增或編輯）
  const handleSaveAccount = async () => {
    const { id, username, role, password } = accountDetails;
  
    if (!id.trim() || !username.trim() || !role.trim()) {
      enqueueSnackbar('所有欄位必須填寫完整！', { variant: 'warning' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
      return;
    }
  
    if (!editingAccount && accounts.some((account) => account.id === id)) {
      enqueueSnackbar('此帳號 ID 已存在，請使用其他 ID！', { variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
      return;
    }
  
    setIsSaving(true);
    try {
      if (editingAccount) {
        await axios.put(`http://localhost:5000/api/accounts/${editingAccount.id}`, accountDetails);
        enqueueSnackbar('帳號更新成功！', { variant: 'success' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
      } else {
        await axios.post('http://localhost:5000/api/accounts', { id, username, role, password });
        enqueueSnackbar('帳號新增成功！', { variant: 'success' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
      }
      fetchAccounts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '保存失敗，請稍後再試！';
      enqueueSnackbar(`保存失敗: ${errorMessage}`, { variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 刪除帳號
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
  
    try {
      await axios.delete(`http://localhost:5000/api/accounts/${accountToDelete}`);
      fetchAccounts();
      enqueueSnackbar('帳號刪除成功！', { variant: 'success' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
      setShowDeleteConfirm(false);
      setAccountToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '刪除失敗，請稍後再試！';
      enqueueSnackbar(`刪除失敗: ${errorMessage}`, { variant: 'error' , autoHideDuration: 2000,anchorOrigin: { vertical: 'top', horizontal: 'center' } });
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
    onClick={() => handleConfirmDelete(account.id)} // 修正為顯示確認框的邏輯
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
              <label>
    密碼:
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={accountDetails.password}
      onChange={handleInputChange}
      placeholder="輸入密碼"
      required
    />
    <button type="button" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? '隱藏' : '顯示'}
    </button>
  </label>
            </div>
            <div className="modal-actions">
            <button onClick={handleSaveAccount} className="save-button" disabled={isSaving}>
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
          確認
        </button>
        <button
          onClick={() => setShowDeleteConfirm(false)} // 關閉確認框
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
