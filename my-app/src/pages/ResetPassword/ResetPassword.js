import React, { useState, useEffect, useMemo } from 'react';
import './ResetPassword.css';
import { useNavigate } from 'react-router-dom';

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const ResetPassword = ({ currentLang }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const initialTranslations = useMemo(() => ({
    resetTitle: "Đặt lại mật khẩu",
    resetSubtitle: "Nhập và xác nhận mật khẩu mới của bạn bên dưới.",
    usernamePlaceholder: "Tên đăng nhập",
    newPasswordPlaceholder: "Mật khẩu mới",
    confirmPasswordPlaceholder: "Xác nhận mật khẩu",
    resetButton: "Đặt lại mật khẩu",
    successMessage: "Mật khẩu đã được thay đổi thành công!",
    errorMessage: "Đã xảy ra lỗi. Vui lòng thử lại!",
    connectionError: "Lỗi kết nối với server.",
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const translateText = async (texts, targetLang) => {
    try {
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error('Lỗi dịch:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/password/reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(translations.successMessage);
        navigate('/login');
      } else {
        alert(data.detail || translations.errorMessage);
      }
    } catch (error) {
      alert(translations.connectionError);
    }
  };

  return (
    <>
      <div className="reset-container">
        <div className="reset-box">
          <h2 className="reset-title">{translations.resetTitle}</h2>
          <p className="reset-subtitle">{translations.resetSubtitle}</p>
          <form className='resetForm' onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={translations.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='reset-input'
            />
            <input
              type="password"
              placeholder={translations.newPasswordPlaceholder}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className='reset-input'
            />
            <input
              type="password"
              placeholder={translations.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className='reset-input'
            />
            <button type="submit" className='reset-button'>{translations.resetButton}</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;