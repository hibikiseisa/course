import React, { useState } from 'react';
import './help.css';

const Help = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});

  const toggleTopic = (topic) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'admin':
        return (
          <div className="help-content">
            <h2>管理者操作說明</h2>
            <button onClick={() => setSelectedSection(null)} className="back-button">
              回上頁
            </button>
            <div className="expandable-topic">
              <button className="expand-button" onClick={() => toggleTopic('CourseManagement')}>
                {expandedTopics['CourseManagement'] ? '縮起課程管理說明' : '展開課程管理說明'}
              </button>
              {expandedTopics['CourseManagement'] && (
                <div className="topic-content">
                  <div className="topic-item">
                    <img src="/CourseManagement1.jpg" alt="課程管理" className="topic-image" />
                    <p>1.進入「課程管理」頁面，可以在這邊查看課程資料。</p>
                    <p>2.點擊的「編輯」按鈕會進入編輯課程視窗。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseManagement2.jpg" alt="編輯課程視窗" className="topic-image" />
                    <p>3.輸入要修改的課程資料。</p>
                    <p>4.點擊的「修改」按鈕會儲存更新課程。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseManagement3.jpg" alt="更新成功通知" className="topic-image" />
                    <p>5.更新完成後跳出課程更新成功通知</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseManagement4.png" alt="新增課程視窗按鈕" className="topic-image" />
                    <p>6.點擊的「新增」按鈕進入新增課程視窗。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseManagement5.png" alt="新增課程視窗" className="topic-image" />
                    <p>7.進入「新增課程視窗」，輸入資料。</p>
                    <p>8.點擊的「新增」按鈕，會儲存新增的課程資料</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseManagement6.png" alt="更新成功通知" className="topic-image" />
                    <p>9.新增完成後跳出課程新增成功通知。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseManagement7.png" alt="刪除成功" className="topic-image" />
                    <p>10.選擇欲刪除的課程，點擊「刪除」按鈕課程便刪除成功。</p>
                  </div>
                </div>
              )}
            </div>

            <div className="expandable-topic">
              <button className="expand-button" onClick={() => toggleTopic('AccountManagement')}>
                {expandedTopics['AccountManagement'] ? '縮起帳號管理說明' : '展開帳號管理說明'}
              </button>
              {expandedTopics['AccountManagement'] && (
                <div className="topic-content">
                  <div className="topic-item">
                    <img src="/accountmanage.png" alt="帳號管理" className="topic-image" />
                    <p>1.點選新增帳號。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/accountmanage1.png" alt="新增帳號視窗" className="topic-image" />
                    <p>2.輸入詳細帳號資訊。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/accountmanage2.png" alt="新增成功" className="topic-image" />
                    <p>3.新增完成後跳出帳號新增成功通知。</p>
                    <p>4.此外也可以編輯跟刪除。</p>
                  </div>

                </div>
              )}
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

            <div className="expandable-topic">
              <button className="expand-button" onClick={() => toggleTopic('searchCourse')}>
                {expandedTopics['searchCourse'] ? '縮起查詢課程說明' : '展開查詢課程說明'}
              </button>
              {expandedTopics['searchCourse'] && (
                <div className="topic-content">
                  <div className="topic-item">
                    <img src="/CourseSearch1.png" alt="進階查詢範例" className="topic-image" />
                    <p>1. 進入課程查詢頁面，點擊「進階查詢」可以看到更多篩選條件。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseSearch2.png" alt="點擊查詢按鈕" className="topic-image" />
                    <p>2. 選擇完條件後，點擊「查詢」按鈕。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseSearch3.png" alt="查詢結果範例" className="topic-image" />
                    <p>3. 查詢結果可以在左上方選擇每頁筆數。</p>
                    <p>4. 點擊「更多資訊」按鈕。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseSearch4.png" alt="課程詳情視窗" className="topic-image" />
                    <p>5. 進入課程詳情視窗，點擊老師姓名可以看到教師資訊。</p>
                    <p>6. 點擊教室後方的地圖圖標。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseSearch5.png" alt="教室地圖預覽" className="topic-image" />
                    <p>7. 進入該教室地理位置預覽地圖，紅框內為該教室的位置。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/CourseSearch6.png" alt="課程摘要與收藏" className="topic-image" />
                    <p>8. 點擊「更多資訊」按鈕，可以看到該課程的摘要、備註等資訊。</p>
                    <p>9. 點擊「收藏」按鈕，可以收藏該課程。</p>
                  </div>
                </div>
              )}
            </div>

            <div className="expandable-topic">
              <button className="expand-button" onClick={() => toggleTopic('favoritesList')}>
                {expandedTopics['favoritesList'] ? '縮起我的追蹤清單說明' : '展開我的追蹤清單說明'}
              </button>
              {expandedTopics['favoritesList'] && (
                <div className="topic-content">
                  <div className="topic-item">
                    <img src="/FavoritesList.png" alt="我的追蹤清單範例" className="topic-image" />
                    <p>進入「我的追蹤清單」頁面，可以在這邊查看追蹤的課程資料。</p>
                    <p>點擊紅框內的「取消追蹤」按鈕會移除該追蹤課程。</p>
                  </div>
                </div>
              )}
            </div>

            <div className="expandable-topic">
              <button className="expand-button" onClick={() => toggleTopic('scheduleSim')}>
                {expandedTopics['scheduleSim'] ? '縮起模擬排課說明' : '展開模擬排課說明'}
              </button>
              {expandedTopics['scheduleSim'] && (
                <div className="topic-content">
                  <div className="topic-item">
                    <img src="/course-simulation1.png" alt="進入模擬排課頁面" className="topic-image" />
                    <p>1. 進入模擬排課頁面，點擊「編輯課表」按鈕。</p>
                    <p>2. 選擇要加課的時間節次，點擊灰色圓形按鈕。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/course-simulation2.png" alt="選擇預排課程" className="topic-image" />
                    <p>3. 進入選課視窗，選擇預排課程（可利用上方進行搜尋）。</p>
                    <p>4. 按「確定」將課程排入課表中。</p>
                  </div>
                  <div className="topic-item">
                    <img src="/course-simulation3.png" alt="課表儲存成功" className="topic-image" />
                    <p>5. 點擊「完成編輯」後，課表內容就儲存成功了。</p>
                  </div>
                </div>
              )}
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
