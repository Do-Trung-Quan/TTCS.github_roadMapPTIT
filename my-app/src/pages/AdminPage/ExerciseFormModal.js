import React, { useState, useEffect } from 'react';
import './ExerciseFormModal.css'; // Import file CSS tương ứng

// Component Modal thêm/chỉnh sửa Exercise
// Props:
// - isVisible: boolean - Trạng thái hiển thị của modal
// - onClose: function - Hàm callback để đóng modal
// - onSubmit: function - Hàm callback khi form submit thành công, truyền data exercise + topicId
// - topicId: string - ID của topic mà exercise này thuộc về
// - initialData: object (optional) - Dữ liệu exercise hiện có nếu đang ở chế độ chỉnh sửa
function ExerciseFormModal({ isVisible, onClose, onSubmit, topicId, initialData }) {
  // State cho form input
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium', // Giá trị mặc định
  });

  // Effect để điền dữ liệu vào form khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isVisible && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
      });
    } else if (isVisible && !initialData) {
        // Reset form khi modal mở ở chế độ thêm mới
        setFormData({ title: '', description: '', difficulty: 'medium' });
    }
  }, [isVisible, initialData]); // Effect chạy lại khi isVisible hoặc initialData thay đổi

  // Nếu modal không hiển thị, không render gì cả
  if (!isVisible) {
    return null;
  }

  // Hàm xử lý thay đổi form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Hàm xử lý submit form
  const handleSubmit = (event) => {
    event.preventDefault(); // Ngăn chặn reload trang

    // Kiểm tra validation cơ bản
    if (!formData.title.trim()) {
      alert("Exercise Title is required.");
      return;
    }

    // Gửi data lên component cha (bao gồm topicId và initialData.id nếu đang edit)
    const exerciseDataToSubmit = {
        ...formData, // title, description, difficulty
        topicId: topicId, // Liên kết với topic hiện tại
         id: initialData ? initialData.id : undefined, // Thêm ID nếu đang edit
    };


    if (onSubmit) {
      onSubmit(exerciseDataToSubmit);
    }

    // Reset form sau khi submit (hoặc sau khi onSubmit báo thành công)
    // setFormData({ title: '', description: '', difficulty: 'medium' }); // Reset ở đây hoặc trong handleClose
    // handleCloseModal(); // Đóng modal sau khi xử lý
  };

  // Hàm xử lý click nút Cancel hoặc nút đóng (x)
  const handleCancelOrClose = () => {
    // TODO: Hỏi người dùng nếu có thay đổi chưa lưu (tùy chọn)
    setFormData({ title: '', description: '', difficulty: 'medium' }); // Reset form khi đóng
     // setEditingExercise(null); // Reset editing state trong TopicItemEditable
    onClose(); // Gọi hàm onClose được truyền từ cha
  };

  return (
    // Overlay làm mờ nền
    <div className="modal-overlay visible">
      <div className="modal-content"> {/* Nội dung modal */}
        <div className="modal-header"> {/* Header modal */}
          <h3>{initialData ? 'Edit Exercise' : 'Add Exercise'}</h3> {/* Tiêu đề động */}
          <button className="modal-close-btn" onClick={handleCancelOrClose}>&times;</button> {/* Nút đóng */}
        </div>
        <div className="modal-body"> {/* Body modal */}

          <form onSubmit={handleSubmit}> {/* Form */}
            <div className="form-group"> {/* Group input Title */}
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

            <div className="form-group"> {/* Group input Description */}
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

            <div className="form-group"> {/* Group chọn Difficulty */}
               <label htmlFor="exercise-difficulty">Difficulty:</label>
               <select
                   className="form-control-us" // Sử dụng style input cho select
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


            {/* TODO: Phần quản lý Quiz Questions/Answers nếu cần */}
            {/* Đây là phần phức tạp và có thể cần modal hoặc component riêng */}
            {/* <h4>Quiz Questions</h4> */}
            {/* <button>Add Question</button> */}
            {/* ... list of questions ... */}


            <div className="modal-actions"> {/* Nút hành động */}
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button>
              <button type="submit" className="create-btn">
                 {initialData ? 'Save Changes' : 'Add Exercise'} {/* Văn bản nút động */}
              </button>
            </div>
          </form>

        </div> {/* Hết modal-body */}
      </div> {/* Hết modal-content */}
    </div> // Hết modal-overlay
  );
}

export default ExerciseFormModal;