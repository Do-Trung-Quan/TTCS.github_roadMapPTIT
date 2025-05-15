import React, { useState } from 'react';
import './TopicItemEditable.css'; // Import file CSS tương ứng
// Import Font Awesome icons nếu dùng component React (hoặc đảm bảo CSS global)
// import { FaChevronUp, FaChevronDown, FaTrashCan, FaGear, FaPencil, FaBookOpen, FaLaptopCode } from 'react-icons/fa6'; // Icons ví dụ
// Đảm bảo Font Awesome CSS được link global

// Import các component modal con
import ResourceFormModal from './ResourceFormModal';
import ExerciseFormModal from './ExerciseFormModal';


// Component hiển thị và quản lý một Topic có thể chỉnh sửa trong Edit Roadmap Page
// Props:
// - topic: Object chứa dữ liệu của topic ({ id, name, description, resources, exercises })
// - onEditTopic: Hàm callback khi click Edit Topic (nếu có)
// - onDeleteTopic: Hàm callback khi click Delete Topic
// - onSaveResource: Hàm callback khi thêm/sửa Resource (truyền data resource)
// - onDeleteResource: Hàm callback khi xóa Resource (truyền resourceId)
// - onSaveExercise: Hàm callback khi thêm/sửa Exercise (truyền data exercise)
// - onDeleteExercise: Hàm callback khi xóa Exercise (truyền exerciseId)
function TopicItemEditable({
    topic,
    onEditTopic,
    onDeleteTopic,
    onSaveResource, // Handler Save/Add Resource
    onDeleteResource, // Handler Delete Resource
    onSaveExercise, // Handler Save/Add Exercise
    onDeleteExercise, // Handler Delete Exercise
}) {
    // State để đóng mở phần hiển thị Resources/Exercises của topic
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // State để quản lý modal Add/Edit Resource
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    // State để lưu resource đang được chỉnh sửa (null nếu đang add)
    const [editingResource, setEditingResource] = useState(null);

    // State để quản lý modal Add/Edit Exercise
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false); // <-- Đã sửa lỗi, đảm bảo khai báo này tồn tại
    // State để lưu exercise đang được chỉnh sửa (null nếu đang add)
    const [editingExercise, setEditingExercise] = useState(null);


    // Hàm xử lý click nút mở rộng/thu gọn chi tiết topic
    const toggleDetails = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    // --- Xử lý Modals Resource ---
    const handleAddResourceClick = () => {
        setEditingResource(null); // Resetting for add mode
        setIsResourceModalOpen(true);
    };

    const handleEditResourceClick = (resource) => {
        setEditingResource(resource); // Set data resource cần edit
        setIsResourceModalOpen(true);
    };

    const handleCloseResourceModal = () => {
        setIsResourceModalOpen(false);
        setEditingResource(null); // Reset editing state khi đóng
    };

    const handleSaveResource = (resourceData) => {
        console.log("Submit resource data:", resourceData, "for topic:", topic.id);
        // Gọi handler Save/Add Resource được truyền từ cha (EditRoadmapPage)
        if (onSaveResource) {
            onSaveResource(resourceData); // Truyền data, bao gồm topicId và có thể cả resource.id
        }
        handleCloseResourceModal(); // Đóng modal sau khi xử lý
        // TODO: Cha (EditRoadmapPage) cần fetch lại data hoặc cập nhật state topics để hiển thị thay đổi
    };

     // --- Xử lý Modals Exercise ---
    const handleAddExerciseClick = () => {
        setEditingExercise(null); // Resetting for add mode
        setIsExerciseModalOpen(true); // <-- Sử dụng đúng state setter
    };

    const handleEditExerciseClick = (exercise) => {
        setEditingExercise(exercise); // Set data exercise cần edit
        setIsExerciseModalOpen(true); // <-- Sử dụng đúng state setter
    };

     const handleCloseExerciseModal = () => {
        setIsExerciseModalOpen(false); // <-- Sử dụng đúng state setter
        setEditingExercise(null); // Reset editing state khi đóng
    };

    const handleSaveExercise = (exerciseData) => {
        console.log("Submit exercise data:", exerciseData, "for topic:", topic.id);
         // Gọi handler Save/Add Exercise được truyền từ cha (EditRoadmapPage)
        if (onSaveExercise) {
            onSaveExercise(exerciseData); // Truyền data, bao gồm topicId và có thể cả exercise.id
        }
        handleCloseExerciseModal(); // Đóng modal sau khi xử lý
        // TODO: Cha (EditRoadmapPage) cần fetch lại data hoặc cập nhật state topics để hiển thị thay đổi
    };

    // --- Xử lý Xóa Resource/Exercise ---
    const handleDeleteResourceClick = (resourceId) => {
         if (onDeleteResource) {
             onDeleteResource(resourceId); // Gọi handler xóa resource được truyền từ cha
         }
    };

     const handleDeleteExerciseClick = (exerciseId) => {
         if (onDeleteExercise) {
             onDeleteExercise(exerciseId); // Gọi handler xóa exercise được truyền từ cha
         }
     };


    return (
        <div className="topic-item-editable">
            {/* Header tóm tắt */}
            <div className="topic-header-summary" onClick={toggleDetails}>
                {/* Tên topic */}
                <span className="topic-name">{topic.name}</span>
                {/* Số lượng Resources và Exercises */}
                <span className="topic-stats">
                    {topic.resources?.length || 0} resources, {topic.exercises?.length || 0} exercises
                </span>
                {/* Icon mở rộng/thu gọn */}
                <span className={`details-toggle-icon ${isDetailsOpen ? 'open' : ''}`}>
                     <i className={`fa-solid ${isDetailsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </span>
                 {/* Nút Edit Topic (nếu có) */}
                 {/* <button className="action-btn edit-topic-btn" onClick={(e) => { e.stopPropagation(); onEditTopic(topic); }}><i className="fa-solid fa-gear"></i></button> */}
                 {/* Nút Delete Topic */}
                 {onDeleteTopic && (
                     <button
                         className="action-btn delete-topic-btn"
                         onClick={(e) => { e.stopPropagation(); onDeleteTopic(topic.id); }} // Ngăn sự kiện click lan ra header
                     >
                          <i className="fa-solid fa-xmark"></i>
                     </button>
                 )}
            </div>

            {/* Phần chi tiết Resources và Exercises (chỉ hiển thị khi isDetailsOpen là true) */}
            {isDetailsOpen && (
                <div className="topic-details">
                    {/* Phần Resources */}
                    <div className="topic-resources-section">
                        <h4>Resources</h4>
                         <button className="add-item-btn" onClick={handleAddResourceClick}>+ Add Resource</button>
                        {/* Hiển thị danh sách Resources */}
                        {topic.resources && topic.resources.length > 0 ? (
                            <ul>
                                {topic.resources.map(resource => (
                                    <li key={resource.id}>
                                        {/* Nội dung Resource: Title, URL, Type */}
                                        <span>
                                            {/* Có thể thêm icon tùy loại Resource */}
                                            {/* <i className={`fa-solid ${getResourceTypeIcon(resource.resource_type_name)}`}></i>  */}
                                            <i className="fa-solid fa-link"></i> {/* Icon link chung */}
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link"> {/* Link */}
                                                {resource.title}
                                            </a>
                                            <span className="resource-type">({resource.resource_type_name || 'Unknown Type'})</span> {/* Loại Resource */}
                                        </span>
                                       {/* Nút Edit/Delete Resource */}
                                       <span className="item-actions"> {/* Container cho các nút */}
                                            <button className="action-btn edit-btn" onClick={() => handleEditResourceClick(resource)}>
                                                <i className="fa-solid fa-pencil"></i> {/* Icon Edit */}
                                            </button>
                                            {onDeleteResource && (
                                                <button className="action-btn delete-btn" onClick={() => handleDeleteResourceClick(resource.id)}>
                                                    <i className="fa-solid fa-xmark"></i> {/* Icon Delete */}
                                                </button>
                                            )}
                                       </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-items-message">No resources added yet.</p>
                        )}
                    </div>

                     {/* Phần Exercises */}
                    <div className="topic-exercises-section">
                        <h4>Exercises</h4>
                         <button className="add-item-btn" onClick={handleAddExerciseClick}>+ Add Exercise</button>
                         {/* Hiển thị danh sách Exercises */}
                        {topic.exercises && topic.exercises.length > 0 ? (
                            <ul>
                                {topic.exercises.map(exercise => (
                                     <li key={exercise.id}>
                                         {/* Nội dung Exercise: Title, Difficulty, Description (có thể ẩn) */}
                                        <span>
                                             <i className="fa-solid fa-laptop-code"></i> {/* Icon Exercise chung */}
                                             {exercise.title}
                                             <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>({exercise.difficulty})</span> {/* Độ khó */}
                                        </span>
                                        {/* Nút Edit/Delete Exercise */}
                                         <span className="item-actions"> {/* Container cho các nút */}
                                             <button className="action-btn edit-btn" onClick={() => handleEditExerciseClick(exercise)}>
                                                 <i className="fa-solid fa-pencil"></i> {/* Icon Edit */}
                                             </button>
                                             {onDeleteExercise && (
                                                <button className="action-btn delete-btn" onClick={() => handleDeleteExerciseClick(exercise.id)}>
                                                     <i className="fa-solid fa-xmark"></i> {/* Icon Delete */}
                                                 </button>
                                             )}
                                        </span>
                                     </li>
                                     // TODO: Có thể thêm phần hiển thị description khi click mở rộng item exercise
                                     // TODO: Thêm phần quản lý Quiz nếu cần (link đến modal/component khác)
                                ))}
                            </ul>
                        ) : (
                             <p className="no-items-message">No exercises added yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ResourceFormModal
                isVisible={isResourceModalOpen} // Điều khiển hiển thị
                onClose={handleCloseResourceModal} // Handler đóng modal
                onSubmit={handleSaveResource} // Handler Save/Add Resource
                topicId={topic.id} // Truyền topicId
                initialData={editingResource} // Truyền data nếu đang edit
            />
             <ExerciseFormModal
                isVisible={isExerciseModalOpen} // <-- Sử dụng đúng state variable
                onClose={handleCloseExerciseModal} // Handler đóng modal
                onSubmit={handleSaveExercise} // Handler Save/Add Exercise
                topicId={topic.id} // Truyền topicId
                initialData={editingExercise} // Truyền data nếu đang edit
             />

        </div>
    );
}

export default TopicItemEditable;

// TODO: Helper function để lấy icon dựa trên resource type name (tùy chọn)
// function getResourceTypeIcon(typeName) {
//     switch (typeName?.toLowerCase()) {
//         case 'article': return 'fa-file-alt';
//         case 'video': return 'fa-video';
//         case 'tutorial': return 'fa-graduation-cap';
//         case 'book': return 'fa-book';
//         default: return 'fa-link'; // Icon mặc định
//     }
// }