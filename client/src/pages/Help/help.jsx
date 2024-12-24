import React, { useState } from 'react';
import './help.css';

const Help = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  const renderContent = () => {
    switch (selectedSection) {
      case 'admin':
        return (
          <div className="help-content">
            <h2>管理者操作說明</h2>
            <button onClick={() => setSelectedSection(null)} className="back-button">
              回上頁
            </button>
            <p>1. 登錄管理者帳號後，進入「管理者後台」。</p>
            <p>2. 使用課程管理功能可新增、修改或刪除課程。</p>
            <p>3. 使用帳號管理功能可新增或停用用戶帳號。</p>
            <img src="/path/to/admin-guide-image.png" alt="管理者操作示例" className="help-image" />
            <div className="help-video">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/example-admin-video"
                title="管理者操作影片"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
          </div>
        );
      case 'student':
        return (
          <div className="help-content">
            <h2>學生操作說明</h2>
            <button onClick={() => setSelectedSection(null)} className="back-button">
              回上頁
            </button>
            <p>1. 登錄學生帳號後，進入「課程查詢」頁面。</p>
            <p>2. 使用篩選條件查詢所需課程，並將課程加入收藏清單。</p>
            <p>3. 進入模擬排課頁面，拖放課程安排個人時間表。</p>
            <img src="/path/to/student-guide-image.png" alt="學生操作示例" className="help-image" />
            <div className="help-video">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/example-student-video"
                title="學生操作影片"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
           
          </div>
        );
      default:
        return (
          <div className="help-buttons">
            <button onClick={() => setSelectedSection('admin')} className="help-button">
              管理者
            </button>
            <button onClick={() => setSelectedSection('student')} className="help-button">
              學生
            </button>
          </div>
        );
    }
  };

  return (
    <div className="help-container">
      <h1>操作說明</h1>
      {renderContent()}
    </div>
  );
};

export default Help;
