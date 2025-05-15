import React, { useState } from 'react';
import './RoadmapModal.css'; // Import file CSS tương ứng

// Component Modal tạo Roadmap
// Props:
// - isVisible: boolean - Trạng thái hiển thị của modal
// - onClose: function - Hàm callback để đóng modal
// - onCreate: function - Hàm callback được gọi khi form submit thành công, truyền data roadmap mới
function RoadmapModal({ isVisible, onClose, onCreate }) {
  // State cho các input của form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // State cho đếm ký tự (nếu cần validation hoặc hiển thị)
  const descriptionCharLimit = 80; // Giới hạn ký tự theo HTML gốc

  // Nếu modal không hiển thị, không render gì cả
  if (!isVisible) {
    return null;
  }

  // Hàm xử lý submit form
  const handleSubmit = (event) => {
    event.preventDefault(); // Ngăn chặn reload trang mặc định của form

    // Kiểm tra validation cơ bản (title required)
    if (!title.trim()) {
      alert("Roadmap Title is required.");
      return;
    }

    // Tạo object data roadmap mới
    const newRoadmapData = {
      title: title.trim(),
      description: description.trim(),
      // TODO: Thêm các trường khác nếu cần (ví dụ: user ID, status mặc định)
    };

    // Gọi hàm onCreate được truyền từ component cha, truyền data mới
    onCreate(newRoadmapData);

    // Reset form sau khi submit (hoặc sau khi onCreate báo thành công)
    setTitle('');
    setDescription('');
  };

  // Hàm xử lý click nút Cancel hoặc nút đóng (x)
  const handleCancelOrClose = () => {
    // TODO: Hỏi người dùng nếu có thay đổi chưa lưu (tùy chọn)
    setTitle(''); // Reset form khi đóng
    setDescription('');
    onClose(); // Gọi hàm onClose được truyền từ component cha
  };

  return (
    // Overlay làm mờ nền - chỉ hiển thị khi isVisible là true
    // Style display: flex/none sẽ được áp dụng bởi CSS class .modal-overlay.visible
    // Hoặc bạn có thể dùng style inline: style={{ display: isVisible ? 'flex' : 'none' }}
    <div className="modal-overlay visible"> {/* Thêm class 'visible' để CSS kiểm soát display */}
      <div className="modal-content"> {/* Nội dung modal */}
        <div className="modal-header"> {/* Header modal */}
          <h3>Create Roadmap</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>&times;</button> {/* Nút đóng */}
        </div>
        <div className="modal-body"> {/* Body modal */}
          <form onSubmit={handleSubmit}> {/* Form */}
            <div className="form-group"> {/* Group input Title */}
              <label htmlFor="roadmap-name">ROADMAP TITLE</label> {/* htmlFor */}
              <input
                type="text"
                className="form-control-us" // Sử dụng className
                id="roadmap-name"
                placeholder="Enter Title"
                required // Thuộc tính HTML5 required
                value={title} // Value được điều khiển bởi state
                onChange={(e) => setTitle(e.target.value)} // Cập nhật state khi input thay đổi
              />
            </div>
            <div className="form-group"> {/* Group input Description */}
              <label htmlFor="roadmap-desc">DESCRIPTION</label> {/* htmlFor */}
              <textarea
                className="form-control-us" // Sử dụng className
                id="roadmap-desc"
                placeholder="Enter Description"
                rows="4"
                value={description} // Value được điều khiển bởi state
                onChange={(e) => setDescription(e.target.value)} // Cập nhật state khi textarea thay đổi
                maxLength={descriptionCharLimit} // Giới hạn ký tự (cho HTML5)
              ></textarea>
              {/* Hiển thị số ký tự */}
              {/* Bạn có thể thêm logic kiểm tra giới hạn JS ở đây */}
              <div className="character-count text-end mt-1 text-muted">{description.length}/{descriptionCharLimit}</div> {/* Sử dụng className */}
            </div>
            <div className="modal-actions"> {/* Nút hành động */}
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button> {/* type="button" để không submit form */}
              <button type="submit" className="create-btn">Create</button> {/* type="submit" */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoadmapModal;