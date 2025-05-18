import React from 'react';
import './Home.css'; 
import '../../context/LanguageContext';

function Home() {
  return (
    <> {/* Sử dụng Fragment để nhóm các phần tử */}
      <div className="sc-1">
        <h1>Chào mừng đến với RoadMapPTIT</h1>
        <p>"Đây là nơi giúp anh em có những sự tham khảo, học hỏi cũng như là luyện tập một số kỹ năng nhất định để xác định được hướng đi của mình. Chúc anh em học tập vui vẻ!</p>
      </div>
      <div className="container">
        <h3>Lập Trình web:</h3>
        {/* Cần thay thế onclick bằng event handler của React và xử lý logic chuyển trang */}
        {/* ... các div class="course" ... */}
         <div className="course" onClick={() => window.location.href='http://localhost:3000/roadmap'}>
           <div className="progress-circle" data-progress="70"></div>
           <span><i className="ri-computer-line"></i> Lộ Trình học front-end</span>
         </div>
         <div className="course" onClick={() => window.location.href='http://localhost:3000/roadmap'}>
           <div className="progress-circle" data-progress="70"></div>
           <span><i className="ri-code-s-slash-line"></i> Lộ Trình học back-end</span>
         </div>
         <div className="course" onClick={() => window.location.href='http://localhost:3000/roadmap'}>
           <div className="progress-circle" data-progress="70"></div>
           <span><i className="ri-terminal-window-line"></i> Lộ Trình học full stacks</span>
         </div>

        <h3>Các hướng đi khác:</h3>
         <div className="course" onClick={() => window.location.href='http://localhost:3000/roadmap'}>
           <div className="progress-circle" data-progress="70"></div>
           <span>Dev-ops</span>
         </div>
         <div className="course" onClick={() => window.location.href='http://localhost:3000/roadmap'}>
           <div className="progress-circle" data-progress="70"></div>
           <span>Cybersecurity</span>
         </div>
         <div className="course" onClick={() => window.location.href='http://localhost:3000/roadmap'}>
           <div className="progress-circle" data-progress="70"></div>
           <span>Lập trình nhúng</span>
         </div>

        <h3>Một số tài liệu tham khảo:</h3>
        <h4 className="mt-4 text-dark">🔗 Tài liệu cho Lập trình Web</h4>
        <div className="row">
          {/* ... các div class="col-md-4" cho tài liệu ... */}
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