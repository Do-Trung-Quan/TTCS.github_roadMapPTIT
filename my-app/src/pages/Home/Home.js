import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import './Home.css';

function Home() {
  const navigate = useNavigate();
  // Lấy thông tin user và hàm lấy token từ useAuth.
  // Đảm bảo useAuth cung cấp user object (có id và role) và hàm getToken().
  const { user, getToken } = useAuth();

  // Hàm xử lý khi click vào một roadmap
  const handleRoadmapClick = async (roadmapId) => {
    // Kiểm tra nếu user đã đăng nhập VÀ user có vai trò là 'user' (không phải admin hoặc guest)
    // Dựa trên code AuthContext.js mới, user object có thuộc tính 'role' và 'id'
    if (user && user.role === 'user') {
      // Lấy token từ AuthContext (giờ đã được cung cấp bởi AuthContext.js)
      const token = getToken();
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/enrolls/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Thêm header Authorization với token
            },
            body: JSON.stringify({
              // === CHỈNH SỬA TÊN TRƯỜNG Ở ĐÂY ĐỂ KHỚP VỚI BACKEND SERIALIZER ===
              UserID: user.id,     // Sử dụng 'UserID' thay vì 'user'
              RoadmapID: roadmapId, // Sử dụng 'RoadmapID' thay vì 'roadmap'
              // ==============================================================
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('API enrolls thành công:', result);
            alert('Bạn đã đăng ký lộ trình thành công!'); // Ví dụ thông báo thành công
            // Có thể thêm logic hiển thị thông báo cho người dùng tại đây
          } else {
             const errorData = await response.json();
             console.error('API enrolls thất bại. Status:', response.status, 'Error Data:', errorData);
             // Xử lý các trạng thái lỗi cụ thể
             if (response.status === 400) {
                  if (errorData.errors) {
                      console.error("Lỗi validation từ backend:", errorData.errors);
                      // Hiển thị lỗi validation cho người dùng nếu có
                      // Ví dụ: alert('Lỗi ghi danh: ' + JSON.stringify(errorData.errors));
                  } else {
                      console.error("Lỗi Bad Request không xác định:", errorData);
                  }
                  // Có thể kiểm tra thêm các thông báo lỗi cụ thể từ backend nếu có
             } else if (response.status === 403) {
                  console.error("Thông báo lỗi: Bạn không có quyền thực hiện thao tác này (API returned 403 Forbidden).");
                  alert('Lỗi: Bạn không có quyền ghi danh.'); // Ví dụ thông báo lỗi quyền
             } else {
                  console.error("Thông báo lỗi: Có lỗi xảy ra khi ghi danh. Vui lòng thử lại. Status:", response.status);
                  alert('Đã xảy ra lỗi khi ghi danh. Vui lòng thử lại sau.'); // Ví dụ thông báo lỗi chung
             }
             // Có thể thêm logic hiển thị thông báo lỗi cho người dùng tại đây
          }
        } catch (error) {
          console.error('Lỗi mạng hoặc lỗi khác khi gọi API enrolls:', error);
           alert('Lỗi kết nối mạng hoặc hệ thống. Vui lòng thử lại.'); // Ví dụ thông báo lỗi mạng
        }
      } else {
        console.warn('Không tìm thấy token sau khi kiểm tra user hợp lệ. User đã đăng nhập nhưng AuthContext không cung cấp token.');
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'); // Thông báo cần đăng nhập lại
        // Có thể tự động điều hướng đến trang login navigate('/login');
      }
    } else {
      // Nếu không phải user thông thường (là Admin, guest hoặc chưa đăng nhập)
      console.log('Người dùng không đủ điều kiện để ghi nhận enroll (Admin/Guest/Chưa đăng nhập). Chỉ điều hướng.');
       alert('Vui lòng đăng nhập với tài khoản người dùng để đăng ký lộ trình.'); // Thông báo cho người dùng chưa đăng nhập/admin
      // Không làm gì thêm ngoài việc điều hướng
    }

    // Luôn điều hướng đến trang roadmap sau khi xử lý (hoặc bỏ qua xử lý API)
    // Có thể trì hoãn navigate nếu muốn người dùng thấy thông báo API trước
    // Ví dụ: setTimeout(() => navigate(`/roadmap/${roadmapId}`), 2000); // Điều hướng sau 2 giây
    navigate(`/roadmap/${roadmapId}`);
  };

  return (
    <> {/* Sử dụng Fragment để nhóm các phần tử */}
      <div className="sc-1">
        <h1>Chào mừng đến với RoadMapPTIT</h1>
        <p>"Đây là nơi giúp anh em có những sự tham khảo, học hỏi cũng như là luyện tập một số kỹ năng nhất định để xác định được hướng đi của mình. Chúc anh em học tập vui vẻ!</p>
      </div>
      <div className="container">
        <h3>Lập Trình web:</h3>
        {/* Thay thế onClick trực tiếp bằng handleRoadmapClick */}
         <div className="course" onClick={() => handleRoadmapClick('RM001')}>
           <div className="progress-circle" data-progress="70"></div> {/* Data progress này có thể cần fetch từ API riêng cho từng user và roadmap */}
           <span><i className="ri-computer-line"></i> Lộ Trình học front-end</span>
         </div>
         <div className="course" onClick={() => handleRoadmapClick('RM002')}>
           <div className="progress-circle" data-progress="70"></div> {/* Data progress này có thể cần fetch từ API riêng cho từng user và roadmap */}
           <span><i className="ri-code-s-slash-line"></i> Lộ Trình học back-end</span>
         </div>
         <div className="course" onClick={() => handleRoadmapClick('RM003')}>
           <div className="progress-circle" data-progress="70"></div> {/* Data progress này có thể cần fetch từ API riêng cho từng user và roadmap */}
           <span><i className="ri-terminal-window-line"></i> Lộ Trình học full stacks</span>
         </div>

        <h3>Các hướng đi khác:</h3>
         <div className="course" onClick={() => handleRoadmapClick('RM004')}>
           <div className="progress-circle" data-progress="70"></div> {/* Data progress này có thể cần fetch từ API riêng cho từng user và roadmap */}
           <span>Dev-ops</span>
         </div>
         <div className="course" onClick={() => handleRoadmapClick('RM005')}>
           <div className="progress-circle" data-progress="70"></div> {/* Data progress này có thể cần fetch từ API riêng cho từng user và roadmap */}
           <span>Cybersecurity</span>
         </div>
         <div className="course" onClick={() => handleRoadmapClick('RM006')}>
           <div className="progress-circle" data-progress="70"></div> {/* Data progress này có thể cần fetch từ API riêng cho từng user và roadmap */}
           <span>Lập trình nhúng</span>
         </div>

        <h3>Một số tài liệu tham khảo:</h3>
        <h4 className="mt-4 text-dark">🔗 Tài liệu cho Lập trình Web</h4>
        <div className="row">
          {/* Giữ nguyên các liên kết tài liệu */}
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-book-open-line"></i> MDN Web Docs</h5>
                <p className="card-text">Tài liệu chuẩn cho HTML, CSS, JavaScript từ Mozilla.</p>
                <a href="https://developer.mozilla.org/vi/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Truy cập</a>
              </div>
            </div>
          </div>
           <div className="col-md-4 mb-3">
             <div className="card h-100 shadow-sm">
               <div className="card-body">
                 <h5 className="card-title"><i className="ri-global-line"></i> W3Schools</h5>
                 <p className="card-text">Nền tảng học lập trình web cơ bản dễ hiểu.</p>
                 <a href="https://www.w3schools.com/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">Truy cập</a>
               </div>
             </div>
           </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-graduation-cap-line"></i> FreeCodeCamp</h5>
                  <p className="card-text">Học qua dự án, hoàn toàn miễn phí và rất thực tiễn.</p>
                  <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">Truy cập</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-javascript-line"></i> JavaScript.info</h5>
                  <p className="card-text">Trang tài liệu chi tiết, hiện đại và đầy đủ về JavaScript.</p>
                  <a href="https://javascript.info/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-warning btn-sm">Truy cập</a>
                </div>
              </div>
            </div>

            {/* GeeksForGeeks */}
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-terminal-box-line"></i> GeeksForGeeks</h5>
                  <p className="card-text">Giải thích thuật toán, cấu trúc dữ liệu, bài tập lập trình rõ ràng.</p>
                  <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">Truy cập</a>
                </div>
              </div>
            </div>

            {/* Roadmap.sh */}
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-road-map-line"></i> Roadmap.sh</h5>
                  <p className="card-text">Tổng hợp lộ trình học từ Frontend, Backend, DevOps và nhiều hơn nữa.</p>
                  <a href="https://roadmap.sh/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm">Truy cập</a>
                </div>
              </div>
            </div>
            <h4 className="mt-4 text-dark">🔐 Tài liệu cho DevOps, Bảo mật và Nhúng</h4>
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-settings-3-line"></i> DevOps Handbook</h5>
                  <p className="card-text">Sách hướng dẫn thực tiễn và toàn diện về DevOps, CI/CD, automation.</p>
                  <a href="https://itrevolution.com/product/the-devops-handbook/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">Truy cập</a>
                </div>
              </div>
            </div>

            {/* OWASP (Cybersecurity) */}
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-shield-line"></i> OWASP Top 10</h5>
                  <p className="card-text">Tài liệu hàng đầu về các lỗ hổng bảo mật phổ biến và cách phòng tránh.</p>
                  <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">Truy cập</a>
                </div>
              </div>
            </div>

            {/* Embedded Programming */}
            <div className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title"><i className="ri-cpu-line"></i> Embedded C Programming</h5>
                  <p className="card-text">Tài liệu học lập trình nhúng từ cơ bản đến nâng cao, đặc biệt dùng C.</p>
                  <a href="https://www.tutorialspoint.com/embedded_systems/index.htm" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">Truy cập</a>
                </div>
              </div>
            </div>
        </div>
      </div>
      {/* Phần footer đã được xóa khỏi đây */}
    </>
  );
}

export default Home;