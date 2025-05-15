import React, { useState, useEffect } from 'react'; // Cần state cho form, list topics tồn tại
import './TopicModal.css'; // Import file CSS tương ứng

// Component Modal tạo/thêm Topic
// Props:
// - isVisible: boolean - Trạng thái hiển thị của modal
// - onClose: function - Hàm callback để đóng modal
// - onCreateNew: function - Hàm callback được gọi khi tạo topic mới
// - onAddExisting: function - Hàm callback được gọi khi thêm topic đã tồn tại
// - existingTopics: Array - Danh sách các topic đã tồn tại để hiển thị trong bảng (tùy chọn)
function TopicModal({ isVisible, onClose, onCreateNew, onAddExisting, existingTopics = [] }) {
  // State cho form tạo topic mới
  const [newTopicData, setNewTopicData] = useState({
    name: '',
    description: '',
  });
  // State cho danh sách các topic đã tồn tại để hiển thị trong bảng (nếu không dùng prop)
  // const [existingTopicsList, setExistingTopicsList] = useState([]);
  // State cho các topic đã chọn từ bảng (nếu cho phép chọn nhiều)
  // const [selectedExistingTopics, setSelectedExistingTopics] = useState([]);
   // State cho trạng thái loading khi fetch topic tồn tại
   const [isLoadingExisting, setIsLoadingExisting] = useState(false);
   // State cho lỗi khi fetch topic tồn tại
   const [existingError, setExistingError] = useState(null);


   // TODO: Effect để fetch danh sách topic đã tồn tại khi modal mở ra
   useEffect(() => {
       if (isVisible) { // Chỉ fetch khi modal hiển thị
           const fetchExistingTopics = async () => {
               setIsLoadingExisting(true);
               setExistingError(null);
               try {
                  // Giả định API endpoint: /api/topics/existing (lấy danh sách topic có sẵn)
                  // const response = await fetch('/api/topics/existing');
                  // if (!response.ok) { ... }
                  // const data = await response.json();
                  // setExistingTopicsList(data);

                   // --- Mã tạm thời ---
                   const sampleExisting = [
                       { id: 1, name: 'HTML' },
                       { id: 2, name: 'CSS' },
                       { id: 3, name: 'JavaScript' },
                       { id: 4, name: 'React' },
                       { id: 5, name: 'Node.js' },
                   ];
                   // setExistingTopicsList(sampleExisting); // Sử dụng state nếu không dùng prop
                   // --- Hết mã tạm thời ---

               } catch (err) {
                   setExistingError("Failed to fetch existing topics.");
                   console.error("Error fetching existing topics:", err);
                  // setExistingTopicsList([]);
               } finally {
                   setIsLoadingExisting(false);
               }
           };
           // Nếu existingTopics không được truyền từ cha, thì fetch ở đây
           // if (existingTopics.length === 0) { // Tùy logic của bạn
                fetchExistingTopics();
           // }
       }
   }, [isVisible]); // Effect chạy khi modal hiển thị/ẩn


  // Nếu modal không hiển thị, không render gì cả
  if (!isVisible) {
    return null;
  }

  // Hàm xử lý thay đổi input form tạo topic mới
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopicData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Hàm xử lý submit form tạo topic mới
  const handleCreateFormSubmit = (event) => {
    event.preventDefault(); // Ngăn chặn reload trang

    // Kiểm tra validation cơ bản
    if (!newTopicData.name.trim()) {
      alert("Topic name is required.");
      return;
    }

    // Gọi hàm onCreateNew được truyền từ cha
    if (onCreateNew) {
      onCreateNew(newTopicData);
    }

    // Reset form sau khi submit (hoặc sau khi onCreateNew báo thành công)
    setNewTopicData({ name: '', description: '' });
  };

  // Hàm xử lý click "Add topic" từ bảng topic đã tồn tại
   const handleAddExistingSubmit = () => {
       console.log("Adding selected existing topics");
       // TODO: Xử lý logic lấy các topic đã chọn từ bảng (dựa vào state selectedExistingTopics)
       const topicsToAdd = existingTopics.filter(/* lọc các topic đã chọn */); // Sử dụng prop existingTopics

       if (topicsToAdd.length === 0) {
           alert("Please select at least one topic to add.");
           return;
       }

       // Gọi hàm onAddExisting được truyền từ cha
       if (onAddExisting) {
           onAddExisting(topicsToAdd);
       }

       // TODO: Reset selection sau khi thêm
       // setSelectedExistingTopics([]);
   };


  // Hàm xử lý click nút Cancel hoặc nút đóng (x)
  const handleCancelOrClose = () => {
    // TODO: Hỏi người dùng nếu có thay đổi chưa lưu trong form tạo mới (tùy chọn)
    setNewTopicData({ name: '', description: '' }); // Reset form tạo mới
    // TODO: Reset selection trong bảng topic đã tồn tại (tùy chọn)
    // setSelectedExistingTopics([]);
    onClose(); // Gọi hàm onClose được truyền từ cha
  };

  // TODO: Logic render bảng topic đã tồn tại
  const renderExistingTopicsTable = () => {
       // Sử dụng prop existingTopics hoặc state existingTopicsList
       const topicsToDisplay = existingTopics.length > 0 ? existingTopics : []; // existingTopicsList;

       if (isLoadingExisting) {
           return <p style={{textAlign: 'center'}}>Loading existing topics...</p>;
       }
       if (existingError) {
           return <p style={{textAlign: 'center', color: 'red'}}>{existingError}</p>;
       }
       if (topicsToDisplay.length === 0) {
            return <p style={{textAlign: 'center'}}>No existing topics found.</p>; // Hoặc dùng div .no-topics
       }

       // TODO: Render bảng với data topicsToDisplay
       return (
           <div className="topic-table-container"> {/* Sử dụng className */}
                <table className="topic-table"> {/* Sử dụng className */}
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            {/* Có thể thêm cột checkbox để chọn */}
                            {/* <th>Select</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {topicsToDisplay.map((topic, index) => (
                            <tr key={topic.id}> {/* Key duy nhất */}
                                <td>{index + 1}</td>
                                <td>{topic.name}</td>
                                {/* Thêm ô checkbox */}
                                {/* <td><input type="checkbox" onChange={() => handleTopicSelect(topic.id)} checked={selectedExistingTopics.includes(topic.id)}/></td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
           </div>
       );
  };


  return (
    // Overlay làm mờ nền - chỉ hiển thị khi isVisible là true
    // Style display: flex/none sẽ được áp dụng bởi CSS class .modal-overlay.visible
    <div className="modal-overlay visible"> {/* Thêm class 'visible' để CSS kiểm soát display */}
      <div className="modal-content"> {/* Nội dung modal */}
        <div className="modal-header"> {/* Header modal */}
          <h3>Create Topic</h3> {/* Tiêu đề */}
          <button className="modal-close-btn" onClick={handleCancelOrClose}>&times;</button> {/* Nút đóng */}
        </div>
        <div className="modal-body"> {/* Body modal */}

          {/* Phần tạo topic mới */}
          <div className="topic-creation-section"> {/* Sử dụng className */}
            <h4>Create new topic</h4>
            <form onSubmit={handleCreateFormSubmit}> {/* Form */}
              <div className="form-group"> {/* Group input Name */}
                <label htmlFor="new-topic-name">Topic name:</label> {/* Sử dụng htmlFor */}
                <input
                  type="text"
                  className="form-control-us" // Sử dụng className
                  id="new-topic-name"
                  name="name" // Thêm name
                  placeholder="Enter topic name"
                  required // Thuộc tính HTML5 required
                  value={newTopicData.name} // Controlled component
                  onChange={handleNewInputChange} // Xử lý thay đổi
                />
              </div>
              <div className="form-group"> {/* Group input Description */}
                <label htmlFor="new-topic-desc">Description:</label> {/* Sử dụng htmlFor */}
                <textarea
                  className="form-control-us" // Sử dụng className
                  id="new-topic-desc"
                  name="description" // Thêm name
                  placeholder="Enter description"
                  rows="4"
                  value={newTopicData.description} // Controlled component
                  onChange={handleNewInputChange} // Xử lý thay đổi
                ></textarea>
              </div>
              {/* Nút hành động cho form tạo mới - Đặt bên trong form để submit được */}
               <div className="modal-actions">
                 <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button> {/* type="button" để không submit form */}
                 <button type="submit" className="create-btn">Add topic</button> {/* type="submit" */}
               </div>
            </form>
          </div> {/* Hết topic-creation-section */}

          <div className="topic-divider"></div> {/* Đường phân cách */}

          {/* Phần thêm topic đã tồn tại */}
          <div className="topic-existing-section"> {/* Sử dụng className */}
            <h4>Add existed topic</h4>
            <p className="section-instruction">Select a topic from the list below:</p> {/* Sử dụng className */}

            {/* Render bảng topic đã tồn tại */}
            {renderExistingTopicsTable()}


            {/* Nút hành động cho phần topic đã tồn tại */}
             <div className="modal-actions">
                 <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button>
                 <button type="button" className="create-btn" onClick={handleAddExistingSubmit}>Add topic</button> {/* type="button" */}
             </div>

          </div> {/* Hết topic-existing-section */}

        </div> {/* Hết modal-body */}
      </div> {/* Hết modal-content */}
    </div> // Hết modal-overlay
  );
}

export default TopicModal;