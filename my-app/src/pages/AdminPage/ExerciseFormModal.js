import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ExerciseFormModal.css';

function ExerciseFormModal({ isVisible, onClose, onSubmit, initialData, topicId, currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    topic: topicId || '',
  });

  const initialTranslations = useMemo(() => ({
    editExerciseHeader: 'Chỉnh sửa bài tập',
    addExerciseHeader: 'Thêm bài tập',
    titleLabel: 'Tiêu đề:',
    titlePlaceholder: 'Nhập tiêu đề bài tập',
    descriptionLabel: 'Mô tả:',
    descriptionPlaceholder: 'Nhập mô tả bài tập',
    difficultyLabel: 'Độ khó:',
    easyOption: 'Dễ',
    mediumOption: 'Trung bình',
    hardOption: 'Khó',
    cancelButton: 'Hủy',
    saveButton: 'Lưu thay đổi',
    addButton: 'Thêm bài tập',
    requiredFieldError: 'Vui lòng điền vào trường bắt buộc (Tiêu đề).',
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
      console.error('Translation error in ExerciseFormModal:', error);
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
        console.error('Token validation error in ExerciseFormModal:', error);
        logout();
        navigate('/');
      }
    }
  }, [getToken, logout, navigate]);

  useEffect(() => {
    if (isVisible && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
        topic: initialData.topic || topicId || 'TP005',
      });
    } else if (isVisible && !initialData) {
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        topic: topicId || 'TP005',
      });
    }
  }, [isVisible, initialData, topicId]);

  if (!isVisible) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert(translations.requiredFieldError);
      return;
    }

    const token = getToken();
    if (!token || !topicId) return;
    try {
      const response = await fetch(
        initialData ? `http://localhost:8000/api/exercises/${initialData.id}/` : 'http://localhost:8000/api/exercises/',
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
          navigate('/');
        }
        throw new Error(`Không thể ${initialData ? 'cập nhật' : 'thêm'} bài tập`);
      }
      await response.json();
      onSubmit(formData);
      setFormData({ title: '', description: '', difficulty: 'medium', topic: topicId || 'TP005' });
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu bài tập:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
  };

  const handleCancelOrClose = () => {
    setFormData({ title: '', description: '', difficulty: 'medium', topic: topicId || 'TP005' });
    onClose();
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialData ? translations.editExerciseHeader : translations.addExerciseHeader}</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="exercise-title">{translations.titleLabel}</label>
              <input
                type="text"
                className="form-control-us"
                id="exercise-title"
                name="title"
                placeholder={translations.titlePlaceholder}
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="exercise-description">{translations.descriptionLabel}</label>
              <textarea
                className="form-control-us"
                id="exercise-description"
                name="description"
                placeholder={translations.descriptionPlaceholder}
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="exercise-difficulty">{translations.difficultyLabel}</label>
              <select
                className="form-control-us"
                id="exercise-difficulty"
                name="difficulty"
                required
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="easy">{translations.easyOption}</option>
                <option value="medium">{translations.mediumOption}</option>
                <option value="hard">{translations.hardOption}</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>{translations.cancelButton}</button>
              <button type="submit" className="create-btn">
                {initialData ? translations.saveButton : translations.addButton}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ExerciseFormModal;