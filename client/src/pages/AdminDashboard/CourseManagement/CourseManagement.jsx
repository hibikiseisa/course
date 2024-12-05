import React, { useState } from 'react';
import axios from 'axios';
import './CourseManagement.css';

const CourseManagement = () => {
  const [selectedFile, setSelectedFile] = useState(null); // 選中的檔案
  const [uploadMessage, setUploadMessage] = useState(''); // 上傳狀態訊息

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file); // 更新檔案狀態
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('請選擇一個 CSV 檔案');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 根據後端返回的訊息更新狀態
      setUploadMessage(response.data.message || '檔案上傳成功');
    } catch (error) {
      console.error('檔案上傳失敗:', error.response || error);
      setUploadMessage('檔案上傳失敗，請檢查檔案格式或內容');
    }
  };

  return (
    <div className="admin-course-management">
      <h2>課程管理</h2>
      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-label">匯入 CSV 檔案</label>
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} className="upload-button">上傳</button>
        {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
      </div>
    </div>
  );
};

export default CourseManagement;
