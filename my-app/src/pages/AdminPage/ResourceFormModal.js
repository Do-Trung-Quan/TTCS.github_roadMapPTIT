import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ResourceFormModal.css';

function ResourceFormModal({ isVisible, onClose, onSubmit, topicId, initialData, currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    resource_type: 'RT001',
    topic: topicId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const initialTranslations = useMemo(() => ({
    editResourceHeader: 'Chỉnh sửa Tài nguyên',
    addResourceHeader: 'Thêm Tài nguyên',
    resourceTitleLabel: 'Tiêu đề Tài nguyên:',
    resourceUrlLabel: 'URL Tài nguyên:',
    resourceTypeLabel: 'Loại Tài nguyên:',
    videoOption: 'Video',
    articleOption: 'Bài viết',
    tutorialOption: 'Hướng dẫn',
    bookOption: 'Sách',
    updateButton: 'Cập nhật',
    saveButton: 'Lưu',
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const translateText = useCallback(async (texts, targetLang) => {
    try {
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) throw new Error(await response.text());
      if (response.status === 401) {
        logout();
        navigate('/');
      }
      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error('Translation error in ResourceFormModal:', error);
      if (error.message.includes('401')) {
        logout();
        navigate('/');
      }
      return texts;
    }
  }, [logout, navigate]);

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
        updatedTranslations[key] = translatedTexts[index] || initialTranslations[key];
      });
      setTranslations(updatedTranslations);
    };
    translateContent();
  }, [currentLang, initialTranslations, translateText]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const exp = decoded.exp;
        const now = Date.now() / 1000;
        if (exp && exp < now) {
          logout();
          navigate('/');
        }
      } catch (error) {
        console.error('Token validation error in ResourceFormModal:', error);
        logout();
        navigate('/');
      }
    }
  }, [getToken, logout, navigate]);

  useEffect(() => {
    if (!isVisible) {
      setFormData({
        title: '',
        url: '',
        resource_type: 'RT001',
        topic: topicId || '',
      });
      setIsSubmitting(false); // Reset submitting state
      return;
    }
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        url: initialData.url || '',
        resource_type: initialData.resource_type || 'RT001',
        topic: topicId || initialData.topic || '',
      });
    } else {
      setFormData({
        title: '',
        url: '',
        resource_type: 'RT001',
        topic: topicId || '',
      });
    }
  }, [isVisible, initialData, topicId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    const token = getToken();
    if (!token || !topicId) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting resource:', formData); // Debug log
      const response = await fetch(
        initialData ? `http://localhost:8000/api/resources/${initialData.id}/` : 'http://localhost:8000/api/resources/',
        {
          method: initialData ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...formData, topic: topicId }),
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login');
        }
        throw new Error(`Không thể ${initialData ? 'cập nhật' : 'thêm'} tài nguyên`);
      }
      const responseData = await response.json();
      console.log('Resource response:', responseData); // Debug log
      onSubmit(responseData); // Pass backend response
      setFormData({
        title: '',
        url: '',
        resource_type: 'RT001',
        topic: topicId || '',
      });
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu tài nguyên:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? translations.editResourceHeader : translations.addResourceHeader}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{translations.resourceTitleLabel}</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label>{translations.resourceUrlLabel}</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label>{translations.resourceTypeLabel}</label>
              <select
                name="resource_type"
                value={formData.resource_type}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="RT001">{translations.videoOption}</option>
                <option value="RT002">{translations.articleOption}</option>
                <option value="RT003">{translations.tutorialOption}</option>
                <option value="RT004">{translations.bookOption}</option>
              </select>
            </div>
            <button type="submit" className="modal-save-btn" disabled={isSubmitting}>
              {isSubmitting
                ? 'Đang xử lý...'
                : initialData
                ? translations.updateButton
                : translations.saveButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResourceFormModal;