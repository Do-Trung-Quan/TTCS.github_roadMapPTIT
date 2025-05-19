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
      // Reset form data when the modal is closed
      setFormData({
        title: '',
        url: '',
        resource_type: 'RT001',
      });
      return;
    }

    if (initialData) {
      // Populate form with initial data for editing
      setFormData({
        title: initialData.title || '',
        url: initialData.url || '',
        resource_type: initialData.resource_type || 'RT001',
      });
    } else {
      // Ensure form is reset when opening for a new resource
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
    // Reset form data after submission
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
          <h2>{initialData ? 'Edit Resource' : 'Add Resource'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Resource Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Resource URL:</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Resource Type:</label>
              <select
                name="resource_type"
                value={formData.resource_type}
                onChange={handleChange}
              >
                <option value="RT001">Video</option>
                <option value="RT002">Article</option>
                <option value="RT003">Tutorial</option>
                <option value="RT004">Book</option>
              </select>
            </div>
            <button type="submit" className="modal-save-btn">
              {initialData ? 'Update' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResourceFormModal;