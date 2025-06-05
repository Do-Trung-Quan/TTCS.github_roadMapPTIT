import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TopicItemEditable.css';
import ResourceFormModal from './ResourceFormModal';
import ExerciseFormModal from './ExerciseFormModal';
import QuizManagerModal from './QuizManagerModal';
import { FontAwesomeIcon } from '../../fontawesome';

function TopicItemEditable({ topic, onEditTopic, onDeleteTopicClick, children, currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [resources, setResources] = useState([]);
  const [exercises, setExercises] = useState([]);

  const initialTranslations = useMemo(() => ({
    resourcesTitle: "Tài nguyên",
    exercisesTitle: "Bài tập",
    noResourcesMessage: "Chưa có tài nguyên nào được thêm.",
    noExercisesMessage: "Chưa có bài tập nào được thêm.",
    addResource: "+ Thêm Tài nguyên",
    addExercise: "+ Thêm Bài tập",
    manageQuiz: "Quản lý Bài kiểm tra",
    editTopic: "Chỉnh sửa Chủ đề",
    deleteTopic: "Xóa Chủ đề",
    editResource: "Chỉnh sửa Tài nguyên",
    deleteResource: "Xóa Tài nguyên",
    editExercise: "Chỉnh sửa Bài tập",
    deleteExercise: "Xóa Bài tập",
    title: "title",
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
      console.error('Translation error in TopicItemEditable:', error);
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
        console.error('Token validation error in TopicItemEditable:', error);
        logout();
        navigate('/');
      }
    }
  }, [getToken, logout, navigate]);

  const fetchResources = useCallback(async () => {
    const token = getToken();
    if (!token || !topic?.TopicID) {
      console.warn("Token hoặc TopicID không có sẵn, bỏ qua việc thêm tài nguyên.");
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/resources/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error('Không thể thêm tài nguyên');
      }
      const data = await response.json();
      const filteredResources = (data.data || []).filter(r => r.topic === topic.TopicID);
      setResources(filteredResources);
    } catch (err) {
      console.error('Lỗi khi thêm tài nguyên:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
  }, [topic?.TopicID, getToken, logout, navigate]);

  const fetchExercises = useCallback(async () => {
    const token = getToken();
    if (!token || !topic?.TopicID) {
      console.warn("Token hoặc TopicID không có sẵn, bỏ qua việc thêm bài tập.");
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/exercises/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error('Không thể thêm bài tập');
      }
      const data = await response.json();
      const filteredExercises = (data.data || []).filter(e => e.topic === topic.TopicID);
      setExercises(filteredExercises);
    } catch (err) {
      console.error('Lỗi khi thêm bài tập:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
  }, [topic?.TopicID, getToken, logout, navigate]);

  useEffect(() => {
    if (isDetailsOpen && topic?.TopicID) {
      fetchResources();
      fetchExercises();
    }
  }, [isDetailsOpen, topic?.TopicID, fetchResources, fetchExercises]);

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const handleAddResourceClick = () => {
    setEditingResource(null);
    setIsResourceModalOpen(true);
  };

  const handleEditResourceClick = (resource) => {
    setEditingResource(resource);
    setIsResourceModalOpen(true);
  };

  const handleCloseResourceModal = () => {
    setIsResourceModalOpen(false);
    setEditingResource(null);
  };

  const handleSaveResource = async (resourceData) => {
    const token = getToken();
    if (!token || !topic?.TopicID) return;
    const method = editingResource ? 'PUT' : 'POST';
    const url = editingResource
      ? `http://localhost:8000/api/resources/${editingResource.id}/`
      : 'http://localhost:8000/api/resources/';
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...resourceData, topic: topic.TopicID, resource_type: resourceData.resource_type }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`Không thể ${editingResource ? 'cập nhật' : 'thêm'} tài nguyên`);
      }
      await response.json();
      fetchResources();
    } catch (err) {
      console.error('Lỗi khi lưu tài nguyên:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
    handleCloseResourceModal();
  };

  const handleAddExerciseClick = () => {
    setEditingExercise(null);
    setIsExerciseModalOpen(true);
  };

  const handleEditExerciseClick = (exercise) => {
    setEditingExercise(exercise);
    setIsExerciseModalOpen(true);
  };

  const handleCloseExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setEditingExercise(null);
  };

  const handleSaveExercise = async (exerciseData) => {
    const token = getToken();
    if (!token || !topic?.TopicID) return;
    const method = editingExercise ? 'PUT' : 'POST';
    const url = editingExercise
      ? `http://localhost:8000/api/exercises/${editingExercise.id}/`
      : 'http://localhost:8000/api/exercises/';
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...exerciseData, topic: topic.TopicID }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`Không thể ${editingExercise ? 'cập nhật' : 'thêm'} bài tập`);
      }
      await response.json();
      fetchExercises();
    } catch (err) {
      console.error('Lỗi khi lưu bài tập:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
    handleCloseExerciseModal();
  };

  const handleDeleteResourceClick = async (resourceId) => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error('Không thể xóa tài nguyên');
      }
      fetchResources();
    } catch (err) {
      console.error('Lỗi khi xóa tài nguyên:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
  };

  const handleDeleteExerciseClick = async (exerciseId) => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/exercises/${exerciseId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error('Không thể xóa bài tập');
      }
      fetchExercises();
    } catch (err) {
      console.error('Lỗi khi xóa bài tập:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
    }
  };

  const handleManageQuizClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsQuizModalOpen(true);
  };

  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
    setSelectedExercise(null);
  };

  const getResourceTypeIcon = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'article': return 'file-alt';
      case 'video': return 'video';
      case 'tutorial': return 'graduation-cap';
      case 'book': return 'book';
      default: return 'link';
    }
  };

  return (
    <div className="topic-item-editable">
      <div className="topic-header-summary" onClick={toggleDetails}>
        <span className="topic-name">{children}</span>
        <span className={`details-toggle-icon ${isDetailsOpen ? 'open' : ''}`}>
          <FontAwesomeIcon icon={isDetailsOpen ? 'chevron-up' : 'chevron-down'} />
        </span>
        <div className="topic-actions-within-item">
          <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEditTopic(topic); }}>
            <FontAwesomeIcon icon="pencil" title={translations.editTopic} />
          </button>
          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteTopicClick(topic); }}>
            <FontAwesomeIcon icon="trash" title={translations.deleteTopic} />
          </button>
        </div>
      </div>

      {isDetailsOpen && (
        <div className="topic-details">
          <div className="topic-resources-section">
            <h4>{translations.resourcesTitle}</h4>
            <button className="add-item-btn" onClick={handleAddResourceClick}>{translations.addResource}</button>
            {resources.length > 0 ? (
              <ul>
                {resources.map(resource => (
                  <li key={resource.id}>
                    <span className="resource-item-content">
                      <FontAwesomeIcon icon={getResourceTypeIcon(resource.resource_type_name)} title={resource.resource_type_name || translations.title} />
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        {resource.title}
                      </a>
                    </span>
                    <span className="item-actions">
                      <button className="action-btn edit-btn" onClick={() => handleEditResourceClick(resource)}>
                        <FontAwesomeIcon icon="pencil" title={translations.editResource} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteResourceClick(resource.id)}>
                        <FontAwesomeIcon icon="times" title={translations.deleteResource} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">{translations.noResourcesMessage}</p>
            )}
          </div>

          <div className="topic-exercises-section">
            <h4>{translations.exercisesTitle}</h4>
            <button className="add-item-btn" onClick={handleAddExerciseClick}>{translations.addExercise}</button>
            {exercises.length > 0 ? (
              <ul>
                {exercises.map(exercise => (
                  <li key={exercise.id}>
                    <span className="exercise-item-content">
                      <FontAwesomeIcon icon="laptop-code" title={translations.title} />
                      {exercise.title}
                      <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>({exercise.difficulty})</span>
                    </span>
                    <span className="item-actions">
                      <button className="action-btn manage-quiz-btn" onClick={() => handleManageQuizClick(exercise)}>
                        <FontAwesomeIcon icon="question-circle" title={translations.manageQuiz} /> {translations.manageQuiz}
                      </button>
                      <button className="action-btn edit-btn" onClick={() => handleEditExerciseClick(exercise)}>
                        <FontAwesomeIcon icon="pencil" title={translations.editExercise} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteExerciseClick(exercise.id)}>
                        <FontAwesomeIcon icon="times" title={translations.deleteExercise} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">{translations.noExercisesMessage}</p>
            )}
          </div>
        </div>
      )}

      <ResourceFormModal
        isVisible={isResourceModalOpen}
        onClose={handleCloseResourceModal}
        onSubmit={handleSaveResource}
        topicId={topic?.TopicID}
        initialData={editingResource}
        currentLang={currentLang}
      />
      <ExerciseFormModal
        isVisible={isExerciseModalOpen}
        onClose={handleCloseExerciseModal}
        onSubmit={handleSaveExercise}
        topicId={topic?.TopicID}
        initialData={editingExercise}
        currentLang={currentLang}
      />
      <QuizManagerModal
        isVisible={isQuizModalOpen}
        onClose={handleCloseQuizModal}
        exercise={selectedExercise}
        currentLang={currentLang}
      />
    </div>
  );
}

export default TopicItemEditable;