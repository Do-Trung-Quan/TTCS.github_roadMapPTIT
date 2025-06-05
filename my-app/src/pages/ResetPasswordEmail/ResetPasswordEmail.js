import React, { useState, useEffect, useMemo } from 'react';
import './ResetPasswordEmail.css';
import { Link } from "react-router-dom";

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const ResetPasswordEmail = ({ currentLang }) => {
  const [email, setEmail] = useState('');

  const initialTranslations = useMemo(() => ({
    emailTitle: "Đặt lại mật khẩu",
    emailSubtitle: "Nhập email của bạn để nhận liên kết đặt lại mật khẩu.",
    emailPlaceholder: "Nhập địa chỉ email",
    emailButton: "Gửi Email",
    noAccount: "Chưa có tài khoản?",
    signupLink: "Đăng ký",
    successMessage: "Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.",
    errorMessage: "Có lỗi xảy ra khi gửi email.",
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
      const response = await fetch('http://localhost:8000/api/password/reset-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(translations.successMessage);
      } else {
        console.error(data.detail || translations.errorMessage);
        alert(data.detail || translations.errorMessage);
      }
    } catch (error) {
      console.error('Lỗi kết nối với server.');
      alert(translations.connectionError);
    }
  };

  return (
    <>
      <div className="email-container">
        <div className="email-box">
          <h2 className="email-title">{translations.emailTitle}</h2>
          <p className="email-subtitle">{translations.emailSubtitle}</p>

          <form className="emailForm" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={translations.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="email-input"
            />
            <button type="submit" className="email-button">{translations.emailButton}</button>
          </form>
          <p className="signup-link">
            {decodeHtmlEntities(translations.noAccount)} <Link to="/signup">{decodeHtmlEntities(translations.signupLink)}</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordEmail;