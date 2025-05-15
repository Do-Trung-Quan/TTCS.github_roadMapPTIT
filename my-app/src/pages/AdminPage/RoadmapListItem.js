import React from 'react';
import './RoadmapListItem.css'; // Import file CSS tương ứng

// Component hiển thị một mục Roadmap trong danh sách
// Props:
// - roadmap: Object chứa dữ liệu của roadmap ({ id, title, description, topics_count })
// - onEditClick: Hàm callback khi click nút Edit (truyền từ RoadmapsPage)
// - onDeleteClick: Hàm callback khi click nút Delete (nếu có)
function RoadmapListItem({ roadmap, onEditClick, onDeleteClick }) {

    // Hàm xử lý click nút Edit
    const handleEditClick = () => {
        // Gọi hàm onEditClick được truyền từ component cha, truyền ID roadmap
        // Điều kiện 'if (onEditClick)' đảm bảo hàm tồn tại trước khi gọi
        if (onEditClick) {
            onEditClick(roadmap.id);
        }
    };

    // Hàm xử lý click nút Delete (nếu có)
    const handleDeleteClick = () => {
         // Điều kiện 'if (onDeleteClick)' đảm bảo hàm tồn tại trước khi gọi
         if (onDeleteClick) {
             // TODO: Thêm xác nhận trước khi xóa nếu cần
             onDeleteClick(roadmap.id); // Gọi hàm xóa được truyền từ cha
         }
    };


    return (
        <div className="roadmap-list-item"> {/* Sử dụng className */}
            <div className="item-details"> {/* Sử dụng className */}
                {/* Tên Roadmap */}
                <span className="item-title">{roadmap.title}</span> {/* Sử dụng className */}
                {/* Mô tả tóm tắt hoặc số lượng topics (như hình mẫu) */}
                 {/* Giả định roadmap object có trường topics_count */}
                <span className="item-stats">{roadmap.topics_count || 0} topics</span> {/* Sử dụng className */}
                {/* Bạn có thể hiển thị mô tả ngắn nếu có: <p>{roadmap.description}</p> */}
            </div>
            <div className="item-actions"> {/* Sử dụng className */}
                {/* Nút Edit - Chỉ render nếu prop onEditClick được truyền (là truthy) */}
                {/* Đây là điều kiện hiển thị nút Edit */}
                {onEditClick && (
                    <button
                        className="action-btn edit-btn" // Sử dụng className
                        onClick={handleEditClick} // Xử lý click
                    >
                        Edit {/* <-- Chữ "Edit" nằm ở đây */}
                    </button>
                )}
                 {/* Nút Delete - Chỉ render nếu prop onDeleteClick được truyền (là truthy) */}
                 {onDeleteClick && (
                     <button
                         className="action-btn delete-btn"
                         onClick={handleDeleteClick}
                     >
                         Delete
                     </button>
                 )}
            </div>
        </div>
    );
}

export default RoadmapListItem;