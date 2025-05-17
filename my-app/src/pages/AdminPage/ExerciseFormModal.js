import React, { useState, useEffect } from 'react';
import './ExerciseFormModal.css';

function ExerciseFormModal({ isVisible, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    topic: '',
  });

  useEffect(() => {
    if (isVisible && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
        topic: initialData.topic || initialData.topicId || 'TP005', // Lấy từ initialData hoặc mặc định
      });
    } else if (isVisible && !initialData) {
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        topic: 'TP005', // Giá trị mặc định, thay bằng logic thực tế nếu cần
      });
    }
  }, [isVisible, initialData]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please fill in the required field (Title).");
      return;
    }

    // Truyền formData lên component cha qua onSubmit
    onSubmit(formData);

    // Reset form và đóng modal
    setFormData({ title: '', description: '', difficulty: 'medium', topic: 'TP005' });
    onClose();
  };

  const handleCancelOrClose = () => {
    setFormData({ title: '', description: '', difficulty: 'medium', topic: 'TP005' });
    onClose();
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Exercise' : 'Add Exercise'}</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="exercise-title">Title:</label>
              <input
                type="text"
                className="form-control-us"
                id="exercise-title"
                name="title"
                placeholder="Enter exercise title"
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="exercise-description">Description:</label>
              <textarea
                className="form-control-us"
                id="exercise-description"
                name="description"
                placeholder="Enter exercise description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="exercise-difficulty">Difficulty:</label>
              <select
                className="form-control-us"
                id="exercise-difficulty"
                name="difficulty"
                required
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button>
              <button type="submit" className="create-btn">
                {initialData ? 'Save Changes' : 'Add Exercise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ExerciseFormModal;