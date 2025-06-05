import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { useAuth } from '../../context/AuthContext'; // Thay Cookies bằng useAuth
import './RoadmapModal.css';

function RoadmapModal({ isVisible, onClose, onRoadmapCreated, currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const descriptionCharLimit = 80;

  const initialTranslations = useMemo(() => ({
    modalTitle: 'Tạo Lộ trình',
    titleLabel: 'Tiêu đề lộ trình',
    titlePlaceholder: 'Nhập Tiêu đề',
    descriptionLabel: 'Mô tả',
    descriptionPlaceholder: 'Nhập Mô tả',
    characterCount: '{count}/{limit}',
    cancelButton: 'Hủy',
    createButton: 'Tạo',
    titleRequiredError: 'Tiêu đề lộ trình là bắt buộc.',
    descriptionLimitError: 'Mô tả không được vượt quá {limit} ký tự.',
    authError: 'Không tìm thấy mã thông báo xác thực. Vui lòng đăng nhập.',
    titleExistsError: 'Một lộ trình với tiêu đề này đã tồn tại. Vui lòng sử dụng tiêu đề khác.',
    successMessage: 'Lộ trình đã được tạo thành công.',
    tokenExpired: 'Phiên đăng nhập đã hết hạn. Đang chuyển hướng về trang đăng nhập...',
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const decodeHtmlEntities = (str) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

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

  const checkTokenExpiration = (token) => {
    if (!token) return false;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const exp = decoded.exp;
      const now = Date.now() / 1000;
      if (exp && exp < now) {
        setError(translations.tokenExpired);
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Lỗi khi kiểm tra token:', error);
      setError(translations.authError);
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      return false;
    }
  };

  const checkTitleExists = async (title) => {
    const token = getToken();
    if (!token || !checkTokenExpiration(token)) return false;

    try {
      const response = await fetch(`http://localhost:8000/api/roadmaps/?title=${encodeURIComponent(title)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return false;
      const data = await response.json();
      const roadmaps = data.data || [];
      return roadmaps.some(roadmap => roadmap.title === title);
    } catch (err) {
      console.error('Lỗi khi kiểm tra tiêu đề:', err);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError(translations.titleRequiredError);
      return;
    }

    if (description.length > descriptionCharLimit) {
      setError(translations.descriptionLimitError.replace('{limit}', descriptionCharLimit));
      return;
    }

    const token = getToken();
    if (!token) {
      setError(translations.authError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    const titleExists = await checkTitleExists(title.trim());
    if (titleExists) {
      setError(translations.titleExistsError);
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
    };
    console.log('Đang gửi dữ liệu để tạo lộ trình:', payload);

    try {
      const response = await fetch('http://localhost:8000/api/roadmaps/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Phản hồi lỗi API:', errorData);
        const errorDetails = errorData.errors
          ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
          : errorData.message || errorData.detail || `Không thể tạo lộ trình: ${response.statusText}`;
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('Dữ liệu lộ trình đã tạo:', data);
      const newRoadmap = data.data;
      setSuccessMessage(data.message || translations.successMessage);

      if (onRoadmapCreated) {
        onRoadmapCreated(newRoadmap);
      }

      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSuccessMessage(null);
        setError(null);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Lỗi khi tạo lộ trình:', err);
      setError(err.message);
    }
  };

  const handleCancelOrClose = () => {
    setTitle('');
    setDescription('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{translations.modalTitle}</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
          {successMessage && <p style={{color: 'green', textAlign: 'center'}}>{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="roadmap-name">{translations.titleLabel}</label>
              <input
                type="text"
                className="form-control-us"
                id="roadmap-name"
                placeholder={translations.titlePlaceholder}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roadmap-desc">{translations.descriptionLabel}</label>
              <textarea
                className="form-control-us"
                id="roadmap-desc"
                placeholder={translations.descriptionPlaceholder}
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={descriptionCharLimit}
              ></textarea>
              <div className="character-count text-end mt-1 text-muted">
                {translations.characterCount
                  .replace('{count}', description.length)
                  .replace('{limit}', descriptionCharLimit)}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>
                {translations.cancelButton}
              </button>
              <button type="submit" className="create-btn">{translations.createButton}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoadmapModal;