import React, { useState, useEffect, useMemo } from 'react';
import './sidebar.css';

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

function Sidebar({ userName: propUserName, role: propRole, activePageId, onMenuItemClick, onLogout, currentLang = 'vi', avatarUrl }) {
  const [username, setUsername] = useState(propUserName || 'Đang tải...');
  const [role, setRole] = useState(propRole || 'user');
  const [avatar, setAvatar] = useState(avatarUrl || null);

  const initialTranslations = useMemo(() => ({
    loading: "Đang tải...",
    anonymousUser: "Người dùng ẩn danh",
    activity: "Hoạt động",
    profile: "Thông tin cá nhân",
    settings: "Cài đặt",
    roadmaps: "Quản lý lộ trình",
    users: "Quản lý người dùng",
    logout: "Đăng xuất",
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const translateText = async (texts, targetLang) => {
    try {
      console.log('Gửi payload đến API translate trong Sidebar:', { text: texts, target_lang: targetLang });
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API translate lỗi trong Sidebar:', errorText);
        throw new Error(errorText);
      }
      const data = await response.json();
      console.log('Phản hồi từ API translate trong Sidebar:', data);
      return data.translated || texts;
    } catch (error) {
      console.error('Lỗi dịch trong Sidebar:', error);
      return texts;
    }
  };

  useEffect(() => {
    const translateContent = async () => {
      if (currentLang === 'vi') {
        setTranslations(initialTranslations);
        return;
      }
      const textsToTranslate = Object.values(initialTranslations);
      const translatedTexts = await translateText(textsToTranslate, currentLang);
      const updatedTranslations = {};
      Object.keys(initialTranslations).forEach((key, index) => {
        updatedTranslations[key] = decodeHtmlEntities(translatedTexts[index] || initialTranslations[key]);
      });
      setTranslations(updatedTranslations);
    };
    translateContent();
  }, [currentLang, initialTranslations]);

  useEffect(() => {
    // Ưu tiên props truyền từ AdminPage.js
    setUsername(propUserName || translations.anonymousUser);
    setRole(propRole || 'user');
    setAvatar(avatarUrl || null);
  }, [propUserName, propRole, avatarUrl, translations.anonymousUser]);

  const handleItemClick = (pageId) => {
    if (onMenuItemClick) {
      onMenuItemClick(pageId);
    }
  };

  const handleLogoutClick = () => {
    console.log('Đang đăng xuất...');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="sidebar">
      <div className="user-display">
        {avatar && <img src={avatar} alt="Avatar" className="user-avatar" />}
        {!avatar && <i className="fas fa-user"></i>}
        <span className="user-name">{username}</span>
        <i className="fas fa-chevron-down dropdown-arrow"></i>
      </div>

      {role === 'user' && (
        <>
          <div
            className={`menu-item ${activePageId === 'activity' ? 'active' : ''}`}
            onClick={() => handleItemClick('activity')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
            </svg>
            {translations.activity}
          </div>

          <div
            className={`menu-item ${activePageId === 'profile' ? 'active' : ''}`}
            onClick={() => handleItemClick('profile')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
            {translations.profile}
          </div>

          <div
            className={`menu-item ${activePageId === 'settings' ? 'active' : ''}`}
            onClick={() => handleItemClick('settings')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.91 7.63 6.29L5.24 5.33C5.02 5.26 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.74 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
            </svg>
            {translations.settings}
          </div>
        </>
      )}

      {role === 'admin' && (
        <>
          <div
            className={`menu-item ${activePageId === 'profile' ? 'active' : ''}`}
            onClick={() => handleItemClick('profile')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
            {translations.profile}
          </div>

          <div
            className={`menu-item ${activePageId === 'roadmaps-list' || activePageId === 'edit-roadmap' ? 'active' : ''}`}
            onClick={() => handleItemClick('roadmaps-list')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z" fill="currentColor"/>
            </svg>
            {translations.roadmaps}
          </div>

          <div
            className={`menu-item ${activePageId === 'users' ? 'active' : ''}`}
            onClick={() => handleItemClick('users')}
          >
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
              <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/>
            </svg>
            {translations.users}
          </div>

          <div
            className={`menu-item ${activePageId === 'settings' ? 'active' : ''}`}
            onClick={() => handleItemClick('settings')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.91 7.63 6.29L5.24 5.33C5.02 5.26 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.74 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
            </svg>
            {translations.settings}
          </div>
        </>
      )}

      <div
        className="menu-item logout-item"
        onClick={handleLogoutClick}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L21 13L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
        </svg>
        {translations.logout}
      </div>
    </div>
  );
}

export default Sidebar;