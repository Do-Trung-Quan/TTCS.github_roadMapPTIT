import React from 'react';
import './ActivityPage.css'; // Import file CSS tương ứng

// Component hiển thị nội dung trang Activity
// Hiện tại component này là tĩnh, hiển thị placeholder data
// Trong ứng dụng thực tế, dữ liệu sẽ được truyền qua props hoặc fetch từ API
function ActivityPage() {
  return (
    // Giữ lại class và ID để dễ dàng áp dụng lại CSS gốc
    <div className="page-content" id="activity"> {/* Sử dụng className */}
      <div className="activity-container"> {/* Sử dụng className */}
        <div className="activity-stats"> {/* Sử dụng className */}
          <div className="stats-item"> {/* Sử dụng className */}
            <span className="stats-value">0</span> {/* Dữ liệu này nên động */}
            <span className="stats-label">Topics Completed</span> {/* Label tĩnh */}
          </div>
          <div className="stats-item"> {/* Sử dụng className */}
            <span className="stats-value">0</span> {/* Dữ liệu này nên động */}
            <span className="stats-label">Currently Learning</span> {/* Label tĩnh */}
          </div>
          <div className="stats-item"> {/* Sử dụng className */}
            <span className="stats-value">2d</span> {/* Dữ liệu này nên động */}
            <span className="stats-label">Visit Streak</span> {/* Label tĩnh */}
          </div>
        </div>

        <div className="activity-empty"> {/* Sử dụng className */}
          <div className="icon-circle"> {/* Sử dụng className */}
            {/* SVG icon - copy trực tiếp */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z" fill="#ddd"/>
            </svg>
          </div>
          <h2>No Progress</h2>
          <p>Progress will appear here as you start tracking your</p>
          <p>
            {/* Link - Trong React Router, bạn có thể thay bằng <Link to="/roadmaps"> */}
            <a href="#" className="link-text">Roadmaps</a> {/* Sử dụng className */}
             progress.
             {/* Thêm event.preventDefault() vào onClick nếu muốn giữ nguyên thẻ <a> nhưng không chuyển trang */}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;