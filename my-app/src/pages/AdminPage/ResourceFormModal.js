import React, { useState, useEffect } from 'react';
import './ResourceFormModal.css';

function ResourceFormModal({ isVisible, onClose, onSubmit, topicId, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    resource_type: 'RT001',
  });

  useEffect(() => {
    if (!isVisible) {
      // Đặt lại dữ liệu biểu mẫu khi modal đóng
      setFormData({
        title: '',
        url: '',
        resource_type: 'RT001',
      });
      return;
    }

    if (initialData) {
      // Điền dữ liệu ban đầu vào biểu mẫu để chỉnh sửa
      setFormData({
        title: initialData.title || '',
        url: initialData.url || '',
        resource_type: initialData.resource_type || 'RT001',
      });
    } else {
      // Đảm bảo biểu mẫu được đặt lại khi mở cho một tài nguyên mới
      setFormData({
        title: '',
        url: '',
        resource_type: 'RT001',
      });
    }
  }, [isVisible, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Đặt lại dữ liệu biểu mẫu sau khi gửi
    setFormData({
      title: '',
      url: '',
      resource_type: 'RT001',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Chỉnh sửa Tài nguyên' : 'Thêm Tài nguyên'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tiêu đề Tài nguyên:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>URL Tài nguyên:</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Loại Tài nguyên:</label>
              <select
                name="resource_type"
                value={formData.resource_type}
                onChange={handleChange}
              >
                <option value="RT001">Video</option>
                <option value="RT002">Bài viết</option>
                <option value="RT003">Hướng dẫn</option>
                <option value="RT004">Sách</option>
              </select>
            </div>
            <button type="submit" className="modal-save-btn">
              {initialData ? 'Cập nhật' : 'Lưu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResourceFormModal;