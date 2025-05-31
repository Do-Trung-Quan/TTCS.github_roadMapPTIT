import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import './TopicItemEditable.css';
import ResourceFormModal from './ResourceFormModal';
import ExerciseFormModal from './ExerciseFormModal';
import QuizManagerModal from './QuizManagerModal';
import { FontAwesomeIcon } from '../../fontawesome';

function TopicItemEditable({ topic, onEditTopic, onDeleteTopicClick, children }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [resources, setResources] = useState([]);
  const [exercises, setExercises] = useState([]);
  const token = Cookies.get('access_token');

  const fetchResources = useCallback(async () => {
    if (!token || !topic?.TopicID) {
      console.warn("Mã thông báo hoặc TopicID không có sẵn, bỏ qua việc thêm tài nguyên.");
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
      if (!response.ok) throw new Error('Không thể thêm tài nguyên');
      const data = await response.json();
      console.log('Đã thêm tất cả tài nguyên:', data);
      console.log('topic.TopicID hiện tại để lọc tài nguyên:', topic.TopicID);
      const filteredResources = (data.data || []).filter(r => r.topic === topic.TopicID);
      console.log(`Tài nguyên đã lọc cho TopicID ${topic.TopicID}:`, filteredResources);
      setResources(filteredResources);
    } catch (err) {
      console.error('Lỗi khi thêm tài nguyên:', err);
    }
  }, [token, topic?.TopicID]);

  const fetchExercises = useCallback(async () => {
    if (!token || !topic?.TopicID) {
      console.warn("Mã thông báo hoặc TopicID không có sẵn, bỏ qua việc thêm bài tập.");
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
      if (!response.ok) throw new Error('Không thể thêm bài tập');
      const data = await response.json();
      console.log('Đã thêm tất cả bài tập:', data);
      console.log('topic.TopicID hiện tại để lọc bài tập:', topic.TopicID);
      const filteredExercises = (data.data || []).filter(e => e.topic === topic.TopicID);
      console.log(`Bài tập đã lọc cho TopicID ${topic.TopicID}:`, filteredExercises);
      setExercises(filteredExercises);
    } catch (err) {
      console.error('Lỗi khi thêm bài tập:', err);
    }
  }, [token, topic?.TopicID]);

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
    setEditingResource(null); // Đảm bảo chúng ta đang thêm tài nguyên mới
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
    console.log("Gửi dữ liệu tài nguyên:", resourceData, "cho chủ đề:", topic?.TopicID);
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Phản hồi lỗi API:', errorData);
        throw new Error(errorData.detail || `Không thể lưu tài nguyên: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Đã lưu dữ liệu tài nguyên:', data);
      fetchResources();
    } catch (err) {
      console.error('Lỗi khi lưu tài nguyên:', err);
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
    console.log("Gửi dữ liệu bài tập:", exerciseData, "cho chủ đề:", topic?.TopicID);
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Phản hồi lỗi API:', errorData);
        throw new Error(errorData.detail || `Không thể lưu bài tập: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Đã lưu dữ liệu bài tập:', data);
      fetchExercises();
    } catch (err) {
      console.error('Lỗi khi lưu bài tập:', err);
    }
    handleCloseExerciseModal();
  };

  const handleDeleteResourceClick = async (resourceId) => {
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Phản hồi lỗi API:', errorData);
        throw new Error(errorData.detail || `Không thể xóa tài nguyên: ${response.statusText}`);
      }
      console.log('Đã xóa tài nguyên:', resourceId);
      fetchResources();
    } catch (err) {
      console.error('Lỗi khi xóa tài nguyên:', err);
    }
  };

  const handleDeleteExerciseClick = async (exerciseId) => {
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Phản hồi lỗi API:', errorData);
        throw new Error(errorData.detail || `Không thể xóa bài tập: ${response.statusText}`);
      }
      console.log('Đã xóa bài tập:', exerciseId);
      fetchExercises();
    } catch (err) {
      console.error('Lỗi khi xóa bài tập:', err);
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
            <FontAwesomeIcon icon="pencil" title="Chỉnh sửa Chủ đề" />
          </button>
          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteTopicClick(topic); }}>
            <FontAwesomeIcon icon="trash" title="Xóa Chủ đề" />
          </button>
        </div>
      </div>

      {isDetailsOpen && (
        <div className="topic-details">
          <div className="topic-resources-section">
            <h4>Tài nguyên</h4>
            <button className="add-item-btn" onClick={handleAddResourceClick}>+ Thêm Tài nguyên</button>
            {resources.length > 0 ? (
              <ul>
                {resources.map(resource => (
                  <li key={resource.id}>
                    <span className="resource-item-content">
                      <FontAwesomeIcon icon={getResourceTypeIcon(resource.resource_type_name)} title={resource.resource_type_name || 'Tài nguyên'} />
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        {resource.title}
                      </a>
                    </span>
                    <span className="item-actions">
                      <button className="action-btn edit-btn" onClick={() => handleEditResourceClick(resource)}>
                        <FontAwesomeIcon icon="pencil" title="Chỉnh sửa Tài nguyên" />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteResourceClick(resource.id)}>
                        <FontAwesomeIcon icon="times" title="Xóa Tài nguyên" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">Chưa có tài nguyên nào được thêm.</p>
            )}
          </div>

          <div className="topic-exercises-section">
            <h4>Bài tập</h4>
            <button className="add-item-btn" onClick={handleAddExerciseClick}>+ Thêm Bài tập</button>
            {exercises.length > 0 ? (
              <ul>
                {exercises.map(exercise => (
                  <li key={exercise.id}>
                    <span className="exercise-item-content">
                      <FontAwesomeIcon icon="laptop-code" title="Bài tập" />
                      {exercise.title}
                      <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>({exercise.difficulty})</span>
                    </span>
                    <span className="item-actions">
                      <button className="action-btn manage-quiz-btn" onClick={() => handleManageQuizClick(exercise)}>
                        <FontAwesomeIcon icon="question-circle" title="Quản lý Bài kiểm tra" /> Quản lý Bài kiểm tra
                      </button>
                      <button className="action-btn edit-btn" onClick={() => handleEditExerciseClick(exercise)}>
                        <FontAwesomeIcon icon="pencil" title="Chỉnh sửa Bài tập" />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteExerciseClick(exercise.id)}>
                        <FontAwesomeIcon icon="times" title="Xóa Bài tập" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">Chưa có bài tập nào được thêm.</p>
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
      />
      <ExerciseFormModal
        isVisible={isExerciseModalOpen}
        onClose={handleCloseExerciseModal}
        onSubmit={handleSaveExercise}
        topicId={topic?.TopicID}
        initialData={editingExercise}
      />
      <QuizManagerModal
        isVisible={isQuizModalOpen}
        onClose={handleCloseQuizModal}
        exercise={selectedExercise}
      />
    </div>
  );
}

export default TopicItemEditable;