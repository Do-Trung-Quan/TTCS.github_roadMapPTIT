import React from 'react';
import './AboutUs.css'; // Import file CSS cho component này

function AboutUs() {
  return (
    <div className="about-us-container">
      <h1 className="about-us-title">Về chúng tôi</h1>

      <section className="about-us-section">
        <h2 className="section-title">Câu chuyện khởi đầu</h2>
        <p>
          Chúng tôi vốn là những sinh viên năm 3, với những trăn trở và khát khao được cống hiến. Từ những buổi thảo luận say mê trong góc thư viện, từ những đêm thức trắng code cùng nhau, dự án đầu tay mang tên RoadMapPTIT đã ra đời.
        </p>
        <p>
          RoadMapPTIT không chỉ là một dự án học tập, mà còn là tâm huyết và niềm đam mê của chúng tôi. Chúng tôi muốn tạo ra một nền tảng hỗ trợ toàn diện cho sinh viên PTIT - nơi mà các bạn có thể tìm thấy lộ trình học tập rõ ràng, nguồn tài liệu chất lượng và cộng đồng kết nối.
        </p>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">Sứ mệnh của chúng tôi</h2>
        <p>
          Chúng tôi muốn xóa bỏ rào cản thông tin mà bao thế hệ sinh viên PTIT đã từng gặp phải. Chúng tôi muốn mỗi sinh viên đều có cơ hội tiếp cận với những kiến thức quý giá, những lời khuyên hữu ích và những trải nghiệm thực tế từ các anh chị đi trước.
        </p>
        <p>
          Chúng tôi muốn tạo ra một cộng đồng nơi tinh thần học hỏi, chia sẻ và hỗ trợ lẫn nhau được đề cao. Nơi mà không ai phải bỡ ngỡ khi bước vào giảng đường đại học, không ai phải lạc lối giữa ma trận kiến thức chuyên ngành.
        </p>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">Giá trị cốt lõi</h2>
        <ul className="core-values-list">
          <li>
            <strong>Chia sẻ:</strong> Chúng tôi tin rằng kiến thức chỉ thực sự có giá trị khi được chia sẻ.
          </li>
          <li>
            <strong>Cộng đồng:</strong> Chúng tôi xây dựng một môi trường học thuật lành mạnh, nơi mỗi thành viên đều là một mắt xích quan trọng.
          </li>
          <li>
            <strong>Sáng tạo:</strong> Chúng tôi không ngừng đổi mới, tìm kiếm những phương pháp tốt nhất để truyền tải kiến thức.
          </li>
          <li>
            <strong>Chất lượng:</strong> Mọi nội dung trên RoadMapPTIT đều được chọn lọc kỹ lưỡng và cập nhật thường xuyên.
          </li>
        </ul>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">Hành trình phía trước</h2>
        <p>
          RoadMapPTIT chỉ mới là bước khởi đầu. Chúng tôi mơ về một tương lai nơi mỗi trường đại học đều có một "roadmap" riêng, nơi mà không một sinh viên nào phải mò mẫm tìm đường. Với sự đồng hành của các bạn, chúng tôi tin rằng giấc mơ đó sẽ sớm trở thành hiện thực.
        </p>
        <p>
          Hãy cùng chúng tôi viết tiếp câu chuyện RoadMapPTIT - câu chuyện của những người trẻ dám mơ ước và dám hành động vì một cộng đồng sinh viên PTIT tốt đẹp hơn.
        </p>
      </section>
    </div>
  );
}

export default AboutUs;