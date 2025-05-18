import React, { useState } from 'react';
import Cookies from 'js-cookie';
import './RoadmapModal.css';

function RoadmapModal({ isVisible, onClose, onRoadmapCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const descriptionCharLimit = 80;

  if (!isVisible) {
    return null;
  }

  const checkTitleExists = async (title) => {
    const token = Cookies.get('access_token');
    if (!token) return false;

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
      console.error('Error checking title:', err);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Roadmap Title is required.");
      return;
    }

    if (description.length > descriptionCharLimit) {
      setError(`Description must not exceed ${descriptionCharLimit} characters.`);
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      setError("Authentication token not found. Please login.");
      return;
    }

    // Kiểm tra xem title đã tồn tại chưa
    const titleExists = await checkTitleExists(title.trim());
    if (titleExists) {
      setError("A roadmap with this title already exists. Please use a different title.");
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
    };
    console.log('Sending payload to create roadmap:', payload);

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
        console.log('API error response:', errorData);
        const errorDetails = errorData.errors
          ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
          : errorData.message || errorData.detail || `Failed to create roadmap: ${response.statusText}`;
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('Created roadmap data:', data);
      const newRoadmap = data.data;
      setSuccessMessage(data.message || "Roadmap created successfully.");

      // Gọi callback để làm mới danh sách roadmaps ở RoadmapsPage
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
      console.error('Create roadmap error:', err);
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

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create Roadmap</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
          {successMessage && <p style={{color: 'green', textAlign: 'center'}}>{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="roadmap-name">ROADMAP TITLE</label>
              <input
                type="text"
                className="form-control-us"
                id="roadmap-name"
                placeholder="Enter Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roadmap-desc">DESCRIPTION</label>
              <textarea
                className="form-control-us"
                id="roadmap-desc"
                placeholder="Enter Description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={descriptionCharLimit}
              ></textarea>
              <div className="character-count text-end mt-1 text-muted">{description.length}/{descriptionCharLimit}</div>
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button>
              <button type="submit" className="create-btn">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoadmapModal;