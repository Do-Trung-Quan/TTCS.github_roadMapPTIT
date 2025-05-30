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
      console.error('Lỗi khi kiểm tra tiêu đề:', err);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Tiêu đề lộ trình là bắt buộc.");
      return;
    }

    if (description.length > descriptionCharLimit) {
      setError(`Mô tả không được vượt quá ${descriptionCharLimit} ký tự.`);
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      setError("Không tìm thấy mã thông báo xác thực. Vui lòng đăng nhập.");
      return;
    }

    // Kiểm tra xem title đã tồn tại chưa
    const titleExists = await checkTitleExists(title.trim());
    if (titleExists) {
      setError("Một lộ trình với tiêu đề này đã tồn tại. Vui lòng sử dụng tiêu đề khác.");
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
      setSuccessMessage(data.message || "Lộ trình đã được tạo thành công.");

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

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Tạo Lộ trình</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
          {successMessage && <p style={{color: 'green', textAlign: 'center'}}>{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="roadmap-name">TIÊU ĐỀ LỘ TRÌNH</label>
              <input
                type="text"
                className="form-control-us"
                id="roadmap-name"
                placeholder="Nhập Tiêu đề"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="roadmap-desc">MÔ TẢ</label>
              <textarea
                className="form-control-us"
                id="roadmap-desc"
                placeholder="Nhập Mô tả"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={descriptionCharLimit}
              ></textarea>
              <div className="character-count text-end mt-1 text-muted">{description.length}/{descriptionCharLimit}</div>
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Hủy</button>
              <button type="submit" className="create-btn">Tạo</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoadmapModal;