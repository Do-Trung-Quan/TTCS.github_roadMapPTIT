import React, { useState, useEffect } from 'react';
import './RoadmapsPage.css'; // Import file CSS tương ứng
// Import Font Awesome icons nếu bạn sử dụng component React cho icons
// import { FaSignsPost } from 'react-icons/fa';
// Đảm bảo Font Awesome CSS được link global trong index.html

// Import component RoadmapModal
import RoadmapModal from './RoadmapModal';

// Import component RoadmapListItem
import RoadmapListItem from './RoadmapListItem';

// Component hiển thị nội dung trang Roadmaps (danh sách)
// Props:
// - onEditRoadmap: Hàm callback khi click nút Edit roadmap item (truyền từ AdminPage)
// - onRoadmapDeleted: Hàm callback khi roadmap bị xóa (để AdminPage cập nhật UI)
function RoadmapsPage({ onEditRoadmap, onRoadmapDeleted }) { // Nhận prop onEditRoadmap và onRoadmapDeleted
  // State cho danh sách roadmaps
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State để quản lý trạng thái đóng/mở của modal tạo Roadmap
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hàm fetch data từ API (Giờ chỉ dùng data mẫu cho chế độ tĩnh)
  const fetchRoadmaps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // --- Dữ liệu mẫu cho chế độ tĩnh ---
       const sampleRoadmaps = [
         { id: 'roadmap-static-1', title: 'Frontend Developer Roadmap (Sample)', description: 'Learn to become a frontend developer.', topics_count: 15 },
         { id: 'roadmap-static-2', title: 'Backend Developer Roadmap (Sample)', description: 'Learn to become a backend developer.', topics_count: 10 },
         { id: 'roadmap-static-3', title: 'DevOps Roadmap (Sample)', description: 'Learn to become a DevOps engineer.', topics_count: 8 },
       ];
       setRoadmaps(sampleRoadmaps);
      // setRoadmaps([]); // Uncomment để test trạng thái rỗng ban đầu

      // --- Hết dữ liệu mẫu ---

    } catch (err) {
      setError("Failed to load sample roadmaps.");
      console.error("Error loading sample roadmaps:", err);
      setRoadmaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect để load dữ liệu mẫu ban đầu
  useEffect(() => {
    fetchRoadmaps();
  }, []);


  // Hàm mở modal tạo Roadmap
  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  // Hàm đóng modal tạo Roadmap
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // Hàm xử lý khi form trong modal tạo Roadmap được submit
  // THAY ĐỔI LỚN: CẬP NHẬT STATE TRỰC TIẾP THAY VÌ GỌI fetchRoadmaps()
  const handleCreateRoadmap = (newRoadmapData) => {
    console.log("Creating roadmap (Static):", newRoadmapData);

    // --- Xử lý Tạo Roadmap trong chế độ Tĩnh ---
    // 1. Tạo một ID giả cho roadmap mới (UUID hoặc timestamp + random)
    const newRoadmapId = 'roadmap-static-' + Date.now() + Math.random().toString(16).slice(2);

    // 2. Tạo object roadmap mới với dữ liệu từ modal
    const newRoadmap = {
        id: newRoadmapId,
        title: newRoadmapData.title,
        description: newRoadmapData.description,
        topics_count: 0, // Ban đầu roadmap mới chưa có topic nào
        // Thêm các trường khác nếu cần
    };

    // 3. Cập nhật state 'roadmaps' bằng cách thêm roadmap mới vào mảng hiện tại
    // Sử dụng functional update để đảm bảo lấy state mới nhất
    setRoadmaps(prevRoadmaps => [...prevRoadmaps, newRoadmap]);

    // 4. Đóng modal
    handleCloseCreateModal();

    // Bỏ qua API call tạo mới và fetchRoadmaps() ở đây trong chế độ tĩnh

    console.log("Roadmap added to static list:", newRoadmap);
     // Có thể thêm alert thành công tạm thời nếu muốn
     // alert("Roadmap created successfully in static list!");
    // --- Hết xử lý Tạo Roadmap trong chế độ Tĩnh ---
  };

  // Hàm xử lý xóa Roadmap (chế độ tĩnh)
  const handleDeleteRoadmap = (roadmapId) => {
      // Sử dụng window.confirm để có pop-up xác nhận mặc định của trình duyệt
      if (window.confirm(`Are you sure you want to delete roadmap ${roadmapId}? (Static mode)`)) {
           console.log("Deleting roadmap (Static) with ID:", roadmapId);
           // Cập nhật state 'roadmaps' bằng cách lọc bỏ roadmap có ID cần xóa
           setRoadmaps(prevRoadmaps => prevRoadmaps.filter(roadmap => roadmap.id !== roadmapId));

           // Thông báo cho cha nếu cần (ví dụ: AdminPage cần biết để cập nhật state global)
           // if (onRoadmapDeleted) {
           //     onRoadmapDeleted(roadmapId);
           // }
           console.log("Roadmap deleted from static list:", roadmapId);
      }
  };


  // Render nội dung tùy thuộc vào trạng thái (loading, lỗi, rỗng, có data)
  const renderContent = () => {
    if (isLoading) {
      return <div style={{textAlign: 'center'}}>Loading roadmaps...</div>; // Hiển thị loading
    }

    if (error) {
      return <div className="error-message">{error}</div>; // Hiển thị lỗi
    }

    if (roadmaps.length === 0) {
      // Hiển thị trạng thái rỗng nếu không có roadmaps
      return (
        <div className="no-roadmaps">
          <div className="roadmap-icon">
             {/* Sử dụng icon Font Awesome */}
             <i className="fa-solid fa-signs-post"></i>
          </div>
          <h2>No roadmaps</h2>
          <p>Create a roadmap to get started</p>
        </div>
      );
    }

    // Hiển thị danh sách roadmaps
    return (
      <div className="roadmap-list">
         {/* Có thể thêm thông báo số lượng roadmap như hình mẫu */}
         {/* <p>{roadmaps.length} custom roadmap(s)</p> */} {/* Thêm class CSS nếu cần */}
        {roadmaps.map(roadmap => (
          <RoadmapListItem
            key={roadmap.id}
            roadmap={roadmap}
            onEditClick={onEditRoadmap} // <-- Truyền prop onEditRoadmap (từ AdminPage) cho onEditClick (của RoadmapListItem)
            onDeleteClick={handleDeleteRoadmap} // <-- Truyền handler xóa từ RoadmapsPage xuống
          />
        ))}
      </div>
    );
  };


  return (
    <div className="page-content" id="roadmaps">
      <div className="roadmap-container">

        <div className="roadmap-tabs">
          <h2>Roadmaps management</h2>
          <button
            className="create-roadmap-btn"
            onClick={handleCreateButtonClick}
          >
            + Create Roadmap
          </button>
        </div>

        {/* Render nội dung (loading, rỗng, hoặc danh sách items) */}
        {renderContent()}

        {/* RoadmapModal - chỉ render khi isCreateModalOpen là true */}
        <RoadmapModal
          isVisible={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onCreate={handleCreateRoadmap} // Truyền handler tạo mới
        />

      </div>
    </div>
  );
}

export default RoadmapsPage;