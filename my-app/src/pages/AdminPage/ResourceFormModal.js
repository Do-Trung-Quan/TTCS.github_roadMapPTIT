import React, { useState, useEffect } from 'react';
import './ResourceFormModal.css'; // Import file CSS tương ứng

// Component Modal thêm/chỉnh sửa Resource
// Props:
// - isVisible: boolean - Trạng thái hiển thị của modal
// - onClose: function - Hàm callback để đóng modal
// - onSubmit: function - Hàm callback khi form submit thành công, truyền data resource + topicId
// - topicId: string - ID của topic mà resource này thuộc về
// - initialData: object (optional) - Dữ liệu resource hiện có nếu đang ở chế độ chỉnh sửa
function ResourceFormModal({ isVisible, onClose, onSubmit, topicId, initialData }) {
  // State cho form input
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    resourceTypeId: '', // Lưu ID của loại resource đã chọn
  });
  // State cho danh sách các loại resource (ví dụ: Article, Video, Tutorial)
  const [resourceTypes, setResourceTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true); // Loading state cho resource types

  // Effect để fetch danh sách Resource Types khi modal mở ra
  useEffect(() => {
    if (isVisible) { // Chỉ fetch khi modal hiển thị
      const fetchResourceTypes = async () => {
        setIsLoadingTypes(true);
        try {
          // TODO: Thay thế bằng API call thực tế để fetch Resource Types
          // const response = await fetch('/api/resource-types');
          // if (!response.ok) { ... }
          // const data = await response.json();
          // setResourceTypes(data);

          // --- Mã tạm thời ---
          const sampleTypes = [
            { id: 'type-article', name: 'Article' },
            { id: 'type-video', name: 'Video' },
            { id: 'type-tutorial', name: 'Tutorial' },
            { id: 'type-book', name: 'Book' },
          ];
          setResourceTypes(sampleTypes);
          // --- Hết mã tạm thời ---

        } catch (err) {
          console.error("Error fetching resource types:", err);
          setResourceTypes([]);
        } finally {
          setIsLoadingTypes(false);
        }
      };
      fetchResourceTypes();
    }
  }, [isVisible]); // Effect chạy lại khi isVisible thay đổi (modal mở/đóng)

  // Effect để điền dữ liệu vào form khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isVisible && initialData) {
      setFormData({
        title: initialData.title || '',
        url: initialData.url || '',
        resourceTypeId: initialData.resourceTypeId || '', // Cần đảm bảo initialData có trường này
      });
    } else if (isVisible && !initialData) {
        // Reset form khi modal mở ở chế độ thêm mới
         setFormData({ title: '', url: '', resourceTypeId: '' });
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
    if (!formData.title.trim() || !formData.url.trim() || !formData.resourceTypeId) {
      alert("Please fill in all required fields (Title, URL, Type).");
      return;
    }
    // TODO: Thêm validation định dạng URL

    // Gửi data lên component cha (bao gồm topicId và initialData.id nếu đang edit)
    const resourceDataToSubmit = {
        ...formData, // title, url, resourceTypeId
        topicId: topicId, // Liên kết với topic hiện tại
        id: initialData ? initialData.id : undefined, // Thêm ID nếu đang edit
    };

    if (onSubmit) {
      onSubmit(resourceDataToSubmit);
    }

    // Reset form sau khi submit (hoặc sau khi onSubmit báo thành công)
    // setFormData({ title: '', url: '', resourceTypeId: '' }); // Reset ở đây hoặc trong handleClose
    // handleCloseModal(); // Đóng modal sau khi xử lý
  };

  // Hàm xử lý click nút Cancel hoặc nút đóng (x)
  const handleCancelOrClose = () => {
    // TODO: Hỏi người dùng nếu có thay đổi chưa lưu (tùy chọn)
    setFormData({ title: '', url: '', resourceTypeId: '' }); // Reset form khi đóng
    // setEditingResource(null); // Reset editing state trong TopicItemEditable
    onClose(); // Gọi hàm onClose được truyền từ cha
  };

  return (
    // Overlay làm mờ nền
    <div className="modal-overlay visible">
      <div className="modal-content"> {/* Nội dung modal */}
        <div className="modal-header"> {/* Header modal */}
          <h3>{initialData ? 'Edit Resource' : 'Add Resource'}</h3> {/* Tiêu đề động */}
          <button className="modal-close-btn" onClick={handleCancelOrClose}>&times;</button> {/* Nút đóng */}
        </div>
        <div className="modal-body"> {/* Body modal */}

          <form onSubmit={handleSubmit}> {/* Form */}
            <div className="form-group"> {/* Group input Title */}
              <label htmlFor="resource-title">Title:</label>
              <input
                type="text"
                className="form-control-us"
                id="resource-title"
                name="title"
                placeholder="Enter resource title"
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group"> {/* Group input URL */}
              <label htmlFor="resource-url">URL:</label>
              <input
                type="url" // Sử dụng type="url" cho validation cơ bản của trình duyệt
                className="form-control-us"
                id="resource-url"
                name="url"
                placeholder="Enter resource URL"
                required
                value={formData.url}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group"> {/* Group chọn Resource Type */}
              <label htmlFor="resource-type">Resource Type:</label>
              {isLoadingTypes ? (
                 <p>Loading types...</p>
              ) : (
                 <select
                   className="form-control-us" // Sử dụng style input cho select
                   id="resource-type"
                   name="resourceTypeId"
                   required
                   value={formData.resourceTypeId}
                   onChange={handleInputChange}
                 >
                   <option value="">-- Select Type --</option> {/* Option mặc định */}
                   {resourceTypes.map(type => (
                     <option key={type.id} value={type.id}>{type.name}</option>
                   ))}
                 </select>
              )}
            </div>

            <div className="modal-actions"> {/* Nút hành động */}
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button>
              <button type="submit" className="create-btn">
                {initialData ? 'Save Changes' : 'Add Resource'} {/* Văn bản nút động */}
              </button>
            </div>
          </form>

        </div> {/* Hết modal-body */}
      </div> {/* Hết modal-content */}
    </div> // Hết modal-overlay
  );
}

export default ResourceFormModal;