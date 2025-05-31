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
      alert("Vui lòng điền vào trường bắt buộc (Tiêu đề).");
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
          <h3>{initialData ? 'Chỉnh sửa bài tập' : 'Thêm bài tập'}</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="exercise-title">Tiêu đề:</label>
              <input
                type="text"
                className="form-control-us"
                id="exercise-title"
                name="title"
                placeholder="Nhập tiêu đề bài tập"
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="exercise-description">Mô tả:</label>
              <textarea
                className="form-control-us"
                id="exercise-description"
                name="description"
                placeholder="Nhập mô tả bài tập"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="exercise-difficulty">Độ khó:</label>
              <select
                className="form-control-us"
                id="exercise-difficulty"
                name="difficulty"
                required
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Hủy</button>
              <button type="submit" className="create-btn">
                {initialData ? 'Lưu thay đổi' : 'Thêm bài tập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ExerciseFormModal;