import React, { useState, useEffect } from 'react';
import './EditRoadmapPage.css';
// Import Font Awesome icons nếu dùng component React (hoặc đảm bảo CSS global)
// import { FaFolderOpen } from 'react-icons/fa';
import TopicModal from './TopicModal'; // Import TopicModal

// Import component TopicItemEditable (MỚI)
import TopicItemEditable from './TopicItemEditable';


// Component chỉnh sửa Roadmap
// Props:
// - roadmapId: ID của roadmap cần chỉnh sửa (truyền từ AdminPage)
// - onSave: Hàm callback khi nhấn Save changes
// - onCancelEdit: Hàm callback để thoát khỏi chế độ chỉnh sửa (quay lại danh sách)
// - onTopicAdded: Hàm callback khi topic được thêm/tạo thành công (để cha cập nhật UI)
function EditRoadmapPage({ roadmapId, onSave, onCancelEdit, onTopicAdded }) { // Thêm onTopicAdded
  // State cho dữ liệu roadmap đang chỉnh sửa
  const [roadmapData, setRoadmapData] = useState({
    name: '',
    description: '',
    // Các trường khác của roadmap
  });
  // State cho danh sách topics của roadmap này
  const [topics, setTopics] = useState([]);
  // State cho trạng thái loading khi fetch data roadmap
  const [isLoading, setIsLoading] = useState(true);
  // State cho lỗi khi fetch data
  const [error, setError] = useState(null);

  // State quản lý modal Topic
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // TODO: Effect để fetch data roadmap và topics
  useEffect(() => {
    const fetchRoadmapData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Mã tạm thời để test giao diện ---
        if (roadmapId) {
            setRoadmapData({
                name: `Roadmap ${roadmapId}`,
                description: `Description for roadmap ${roadmapId}`,
            });
             // Topics mẫu (có resources và exercises mẫu để test TopicItemEditable)
            const sampleTopics = [
                 {
                     id: 101,
                     name: 'HTML Basics',
                     description: 'Learn the fundamentals of HTML.',
                     resources: [
                         { id: 201, title: 'MDN HTML Intro', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', resource_type_name: 'Article' },
                         { id: 202, title: 'HTML Crash Course', url: 'https://www.youtube.com/watch?v=k Vqr-l8W0U', resource_type_name: 'Video' },
                     ],
                     exercises: [
                         { id: 301, title: 'HTML Forms Exercise', difficulty: 'easy' },
                     ]
                 },
                 {
                      id: 102,
                      name: 'CSS Styling',
                      description: 'Master CSS for styling web pages.',
                      resources: [
                          { id: 203, title: 'CSS-Tricks Flexbox Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', resource_type_name: 'Article' },
                      ],
                      exercises: [] // Topic này không có exercise nào mẫu
                 },
                 // Thêm topic mẫu không có resource/exercise
                 {
                     id: 103,
                     name: 'New Topic Idea',
                     description: 'Ideas for future development.',
                     resources: [],
                     exercises: []
                 }
            ];
             setTopics(sampleTopics);
            // setTopics([]); // Uncomment để test trạng thái "No topics"
        } else {
             setError("No roadmap ID provided.");
             setRoadmapData({ name: '', description: '' });
             setTopics([]);
        }

        // --- Hết mã tạm thời ---

      } catch (err) {
        setError("Failed to fetch roadmap data.");
        console.error("Error fetching roadmap:", err);
        setRoadmapData({ name: '', description: '' });
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (roadmapId) {
      fetchRoadmapData();
    } else {
       setIsLoading(false);
       setError("No roadmap ID provided for editing.");
    }

  }, [roadmapId]);


  // Hàm xử lý thay đổi input form roadmap (giữ nguyên)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoadmapData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Hàm xử lý click nút "Save changes" (giữ nguyên logic cơ bản)
  const handleSaveChanges = () => {
    console.log("Saving changes for roadmap:", roadmapId, roadmapData, topics);
    // TODO: Gửi request cập nhật roadmap và topics/resources/exercises liên quan
    if (onSave) {
      // onSave(roadmapId, roadmapData, topics); // Cách truyền data tùy vào API endpoint
       // Có thể cần gửi riêng data roadmap và data topics/resources/exercises đã chỉnh sửa
       alert("Save changes logic goes here."); // Placeholder thông báo
    }
     // TODO: Sau khi lưu thành công, có thể chuyển hướng về trang danh sách
    // if (onCancelEdit) onCancelEdit(); // Quay lại trang danh sách sau khi lưu
  };

  // Hàm xử lý click nút "Add topic" (mở modal) (giữ nguyên)
  const handleAddTopicClick = () => {
    setIsTopicModalOpen(true);
  };

  // Hàm đóng modal Topic (giữ nguyên)
  const handleCloseTopicModal = () => {
    setIsTopicModalOpen(false);
    // Sau khi đóng modal tạo/thêm topic, có thể cần fetch lại danh sách topics của roadmap
    // hoặc cập nhật state 'topics' local nếu API trả về data topic mới/đã thêm
    // Ví dụ: fetchRoadmapData(); // Fetch lại toàn bộ data roadmap
     // Hoặc nếu modal trả về topic mới: setTopics([...topics, newTopicFromModal]);
  };

  // Hàm xử lý khi tạo topic mới trong modal
  const handleCreateNewTopic = (newTopicData) => {
      console.log("Creating new topic:", newTopicData);
      // TODO: Gửi request tạo topic mới (POST) liên kết với roadmapId này
      // API có thể trả về topic đầy đủ (bao gồm ID, resources [], exercises [])
      // Sau khi tạo thành công:
      // alert("Create new topic logic goes here."); // Placeholder
      // Ví dụ: setTopics([...topics, response.data]); // Thêm topic mới vào state local
      // TODO: Thông báo cho component cha (AdminPage) biết có topic mới được thêm
      // if (onTopicAdded) onTopicAdded(); // Trigger re-fetch ở AdminPage hoặc cập nhật state ở AdminPage

      // Đóng modal sau khi xử lý (tạm thời)
      handleCloseTopicModal();
  };

  // Hàm xử lý khi thêm topic đã tồn tại trong modal
   const handleAddExistingTopic = (selectedTopics) => {
      console.log("Adding existing topics:", selectedTopics, "to roadmap:", roadmapId);
      // TODO: Gửi request liên kết các topic đã tồn tại (selectedTopics) với roadmapId này (API)
      // API có thể trả về danh sách topics đã cập nhật cho roadmap này
      // Sau khi thêm thành công:
      // alert("Add existing topics logic goes here."); // Placeholder
      // Ví dụ: setTopics(response.data); // Cập nhật state local với danh sách mới từ API
      // TODO: Thông báo cho component cha (AdminPage) biết có topic mới được thêm
      // if (onTopicAdded) onTopicAdded();

      // Đóng modal sau khi xử lý (tạm thời)
      handleCloseTopicModal();
   };

   // TODO: Hàm xử lý xóa Topic (truyền xuống TopicItemEditable)
   const handleDeleteTopic = (topicId) => {
        console.log("Deleting topic with ID:", topicId, "from roadmap:", roadmapId);
        // TODO: Thêm xác nhận
        // TODO: Gửi request xóa topic (DELETE) từ roadmap này (hoặc xóa hẳn topic?)
        // Sau khi xóa thành công: fetch lại topics hoặc cập nhật state local
        alert(`Delete topic ${topicId} logic goes here.`); // Placeholder
        // Ví dụ: setTopics(topics.filter(topic => topic.id !== topicId)); // Cập nhật state local
   };


  // TODO: Render danh sách các TopicItemEditable
  const renderTopicList = () => {
      if (topics.length === 0) {
          // Trạng thái "No topics yet" (giữ nguyên)
           return (
               <div className="no-topics">
                  <div className="topic-icon">
                     <i className="fa-solid fa-folder-open"></i>
                  </div>
                  <h3>No topics yet</h3>
                  <p>Create topics to organize your resources</p>
                </div>
          );
      }

      // Lặp qua mảng topics và render component TopicItemEditable cho mỗi topic
      return (
          <div className="topic-list"> {/* Sử dụng className */}
              {topics.map(topic => (
                  <TopicItemEditable
                      key={topic.id} // Key duy nhất
                      topic={topic} // Truyền dữ liệu topic xuống component con
                      // TODO: Truyền các handler cho Edit/Delete topic/resource/exercise xuống đây
                      onDeleteTopic={handleDeleteTopic} // Truyền handler xóa topic
                      // onAddResource={() => handleAddResourceForTopic(topic.id)} // Ví dụ handler thêm resource cho topic cụ thể
                      // onEditResource={handleEditResource}
                      // ... các handler khác
                  />
              ))}
          </div>
      );
  };


  if (isLoading) {
      return <div>Loading roadmap data...</div>;
  }

  if (error) {
      return <div className="error-message">{error}</div>;
  }

  // Render nội dung form chỉnh sửa roadmap
  return (
    <div className="page-content" id="edit-roadmap">
      <div className="edit-roadmap-container">

        <div className="edit-roadmap-header">
          <h1>Edit roadmap</h1>
          <button
            className="save-changes-btn"
            onClick={handleSaveChanges}
          >
            Save changes
          </button>
        </div>

        {/* Form chỉnh sửa Roadmap (giữ nguyên) */}
        <div className="form-group">
          <label htmlFor="roadmap-name-edit">Roadmap name:</label>
          <input
            type="text"
            id="roadmap-name-edit"
            name="name"
            className="form-control-us"
            value={roadmapData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="roadmap-description-edit">Description:</label>
          <textarea
            id="roadmap-description-edit"
            name="description"
            className="form-control-us"
            rows="4"
            value={roadmapData.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        {/* Phần quản lý Topics */}
        <div className="topics-section">
          <div className="topics-header">
            <h2>Topics</h2>
            <button
              className="add-topic-btn"
              onClick={handleAddTopicClick}
            >
              Add topic
            </button>
          </div>

          {/* Render danh sách các TopicItemEditable hoặc trạng thái rỗng */}
          {renderTopicList()}

        </div> {/* Hết topics-section */}

      </div> {/* Hết edit-roadmap-container */}

      {/* Component TopicModal - chỉ render khi isTopicModalOpen là true */}
      <TopicModal
        isVisible={isTopicModalOpen}
        onClose={handleCloseTopicModal}
        onCreateNew={handleCreateNewTopic} // Truyền handler tạo mới
        onAddExisting={handleAddExistingTopic} // Truyền handler thêm đã tồn tại
        // TODO: Truyền danh sách các topic đã tồn tại (existingTopics) cho modal
      />

    </div> // Hết page-content
  );
}

export default EditRoadmapPage;