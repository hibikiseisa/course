import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AccountManagement.css'; // 引入 CSS 文件

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('id');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountDetails, setAccountDetails] = useState({
    id: '',
    username: '',
    role: 'student',
  });

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

  const handleSaveAccount = async () => {
    try {
      if (editingAccount) {
        await axios.put(
          `http://localhost:5000/api/accounts/${editingAccount.id}`,
          accountDetails
        );
      } else {
        await axios.post('http://localhost:5000/api/accounts', accountDetails);
      }
      fetchAccounts();
      setShowModal(false);
      setEditingAccount(null);
      setAccountDetails({ id: '', username: '', role: 'student' });
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDeleteAccount = async (id) => {
    console.log('傳遞的 ID:', id);
    try {
      await axios.delete(`http://localhost:5000/api/accounts/${id}`);
      fetchAccounts();
      alert('帳號刪除成功');
    } catch (error) {
        if (error.response && error.response.status === 404) {
            alert('帳號不存在，無法刪除');
            
        } else {
            console.error('Error deleting account:', error);
            alert('刪除失敗，請稍後再試');
        }

    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountDetails(account);
    setShowModal(true);
  };

  const filteredAccounts = accounts.filter((account) =>
    account[searchBy].toLowerCase().includes(searchTerm.toLowerCase())
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
