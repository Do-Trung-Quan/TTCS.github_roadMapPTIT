import React, { useState, useEffect } from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import "./roadmap.css";
import Header from "../../components/Header/header";

// Dữ liệu thông tin và bài tập cho từng node
const nodeDetails = {
  "1": { 
    info: "Frontend là lĩnh vực phát triển giao diện người dùng (UI) cho website và ứng dụng web, tập trung vào trải nghiệm người dùng. Frontend developer sử dụng HTML, CSS, JavaScript và các framework như React để tạo ra các giao diện đẹp, tương tác và dễ sử dụng. Đây là cầu nối giữa thiết kế (UI/UX) và backend, đảm bảo dữ liệu được hiển thị một cách trực quan.",
    exercises: [
      "Tìm hiểu các công cụ cơ bản của Frontend developer (trình duyệt, DevTools, VS Code).",
      "Đọc tài liệu về sự khác biệt giữa Frontend, Backend và Full-stack.",
      "Xem một video giới thiệu về lộ trình học Frontend trên YouTube và ghi chú các kỹ năng chính."
    ],
    completed: false
  },
  "2": { 
    info: "HTML (HyperText Markup Language) là ngôn ngữ đánh dấu dùng để tạo cấu trúc và nội dung cho website. HTML sử dụng các thẻ (tags) để định nghĩa các thành phần như tiêu đề, đoạn văn, hình ảnh, liên kết, v.v. Đây là nền tảng của mọi trang web, giúp trình duyệt hiểu cách hiển thị nội dung.",
    exercises: [
      "Tạo một trang HTML với các thành phần: tiêu đề (h1), đoạn văn (p), danh sách (ul), và một liên kết (a).",
      "Sử dụng các thẻ semantic như <header>, <nav>, <main>, <footer> để xây dựng cấu trúc một trang portfolio cá nhân.",
      "Tìm hiểu về thẻ <meta> và thêm các meta tag (description, charset) vào trang HTML của bạn."
    ],
    completed: false
  },
  "3": { 
    info: "CSS (Cascading Style Sheets) là ngôn ngữ dùng để tạo kiểu (style) và bố cục cho website, kiểm soát màu sắc, font chữ, kích thước, khoảng cách, v.v. CSS cho phép tùy chỉnh giao diện để phù hợp với thương hiệu và nâng cao trải nghiệm người dùng. Các khái niệm như box model, specificity, và inheritance là cốt lõi của CSS.",
    exercises: [
      "Tạo một div với border, màu nền, và căn giữa nội dung bằng margin: auto.",
      "Sử dụng Flexbox để tạo một hàng chứa 3 thẻ div, căn đều khoảng cách giữa chúng.",
      "Viết CSS để thay đổi màu chữ của một đoạn văn khi hover chuột."
    ],
    completed: false
  },
  "4": { 
    info: "JavaScript là ngôn ngữ lập trình động, cho phép thêm tính tương tác vào website, như xử lý sự kiện, thay đổi nội dung theo thời gian thực, hoặc gọi API. JavaScript là nền tảng cho các ứng dụng web phức tạp, từ form validation đến các ứng dụng đơn trang (SPA).",
    exercises: [
      "Viết một hàm JavaScript hiển thị thông báo 'Hello World' trong console và trên một thẻ <p>.",
      "Tạo một nút HTML và thêm sự kiện click để hiển thị một alert với thông điệp tùy chỉnh.",
      "Viết một hàm đổi màu nền của trang web ngẫu nhiên khi người dùng click vào nút."
    ],
    completed: false
  },
  "5": { 
    info: "Semantic HTML sử dụng các thẻ có ý nghĩa rõ ràng (như <article>, <section>, <aside>) để mô tả nội dung, giúp mã dễ đọc, cải thiện SEO, và hỗ trợ các công nghệ trợ giúp (screen readers). Semantic HTML là tiêu chuẩn trong phát triển web hiện đại để tăng tính tiếp cận và bảo trì.",
    exercises: [
      "Tạo một trang HTML cho một bài viết blog, sử dụng các thẻ <article>, <section>, <header>, và <footer>.",
      "Chuyển đổi một trang HTML không semantic (chỉ dùng <div>) thành phiên bản sử dụng semantic tags.",
      "Tìm hiểu về thuộc tính role trong ARIA và thêm role='navigation' cho thẻ <nav> trong trang của bạn."
    ],
    completed: false
  },
  "6": { 
    info: "Flexbox và CSS Grid là hai hệ thống bố cục mạnh mẽ trong CSS. Flexbox lý tưởng cho bố cục một chiều (hàng hoặc cột), trong khi CSS Grid phù hợp cho bố cục hai chiều phức tạp. Cả hai giúp tạo các giao diện responsive, dễ dàng căn chỉnh và sắp xếp các phần tử.",
    exercises: [
      "Tạo một layout hai cột (sidebar và nội dung chính) sử dụng Flexbox, với sidebar chiếm 30% chiều rộng.",
      "Sử dụng CSS Grid để tạo một gallery ảnh 3x3, với các ô có kích thước bằng nhau.",
      "Kết hợp Flexbox và Grid để tạo một trang web với header, footer, và khu vực nội dung dạng lưới."
    ],
    completed: false
  },
  "7": { 
    info: "DOM Manipulation là kỹ thuật sử dụng JavaScript để tương tác với Document Object Model (DOM), cho phép thay đổi nội dung, thuộc tính, hoặc cấu trúc của trang web theo thời gian thực. Các phương thức như querySelector, addEventListener, và innerHTML là công cụ chính để thao tác DOM.",
    exercises: [
      "Viết JavaScript để thay đổi nội dung của một thẻ <p> thành 'Nội dung mới' khi người dùng click nút.",
      "Tạo một danh sách công việc (to-do list) với các mục có thể thêm/xóa bằng JavaScript.",
      "Sử dụng querySelectorAll để thay đổi màu chữ của tất cả các thẻ <li> trong một danh sách."
    ],
    completed: false
  },
  "8": { 
    info: "Forms & Validation là một phần quan trọng trong phát triển web, cho phép thu thập dữ liệu từ người dùng (như đăng ký, đăng nhập) và đảm bảo dữ liệu hợp lệ trước khi gửi. Validation có thể thực hiện phía client (HTML/JS) hoặc server, tập trung vào kiểm tra định dạng, độ dài, hoặc tính hợp lệ của dữ liệu.",
    exercises: [
      "Tạo một form HTML với các trường email, mật khẩu, và nút submit, thêm required cho các trường.",
      "Viết JavaScript để kiểm tra định dạng email hợp lệ (chứa @ và .com) trước khi submit form.",
      "Tạo một form đăng ký với trường tên, email, và số điện thoại, hiển thị thông báo lỗi nếu dữ liệu không hợp lệ."
    ],
    completed: false
  },
  "9": { 
    info: "Accessibility (a11y) đảm bảo website có thể sử dụng bởi mọi người, bao gồm người khuyết tật, thông qua các công nghệ trợ giúp như screen readers. Các thực hành tốt bao gồm sử dụng semantic HTML, thuộc tính ARIA, và đảm bảo tương phản màu sắc phù hợp.",
    exercises: [
      "Thêm thuộc tính alt mô tả chi tiết cho tất cả hình ảnh trong một trang HTML.",
      "Sử dụng thuộc tính ARIA (aria-label, aria-required) cho một form đăng nhập.",
      "Kiểm tra độ tương phản màu của văn bản và nền trên trang web của bạn bằng công cụ như WebAIM Contrast Checker."
    ],
    completed: false
  },
  "10": { 
    info: "Responsive Design đảm bảo website hiển thị tốt trên mọi thiết bị, từ điện thoại, tablet đến máy tính. Các kỹ thuật chính bao gồm sử dụng media queries, đơn vị tương đối (%, vw, rem, em), và các framework như Bootstrap. Responsive design cải thiện trải nghiệm người dùng và SEO.",
    exercises: [
      "Sử dụng media query để thay đổi kích thước chữ và bố cục của một trang khi xem trên màn hình dưới 600px.",
      "Tạo một layout responsive với Flexbox, chuyển từ 3 cột trên desktop thành 1 cột trên mobile.",
      "Tối ưu hóa một trang portfolio để hiển thị tốt trên cả desktop và mobile, kiểm tra bằng DevTools."
    ],
    completed: false
  },
  "11": { 
    info: "Animations và Transitions trong CSS làm website sinh động, thu hút người dùng. Transitions thay đổi mượt mà các thuộc tính như màu sắc, kích thước, trong khi animations cho phép tạo các hiệu ứng phức tạp hơn. Cần sử dụng hợp lý để không ảnh hưởng hiệu suất.",
    exercises: [
      "Tạo hiệu ứng hover cho một nút, đổi màu nền và phóng to nút trong 0.3 giây.",
      "Sử dụng @keyframes để tạo animation fade-in cho một div khi trang tải.",
      "Tạo một carousel ảnh đơn giản với hiệu ứng chuyển slide sử dụng CSS transitions."
    ],
    completed: false
  },
  "12": { 
    info: "SCSS/Sass và CSS Modules giúp quản lý CSS hiệu quả hơn trong các dự án lớn. SCSS/Sass cung cấp biến, nesting, và mixins để viết CSS dễ bảo trì. CSS Modules giới hạn phạm vi style, tránh xung đột trong ứng dụng React.",
    exercises: [
      "Viết một file SCSS với biến cho màu sắc và áp dụng cho một button component.",
      "Sử dụng nesting trong SCSS để style một menu điều hướng với các trạng thái hover.",
      "Tích hợp CSS Modules vào một dự án React, tạo style riêng cho một component card."
    ],
    completed: false
  },
  "13": { 
    info: "ES6+ Features là các tính năng hiện đại của JavaScript, như arrow functions, destructuring, template literals, và modules, giúp mã ngắn gọn, dễ đọc, và mạnh mẽ hơn. Hiểu ES6+ là cần thiết để làm việc với các framework như React hoặc Vue.",
    exercises: [
      "Viết một arrow function tính tổng của một mảng số và so sánh với function thông thường.",
      "Sử dụng destructuring để trích xuất các thuộc tính từ một object và hiển thị chúng trong console.",
      "Tạo một file JS sử dụng import/export để chia sẻ một hàm giữa hai module."
    ],
    completed: false
  },
  "14": { 
    info: "Events và Event Delegation quản lý các sự kiện người dùng (click, keypress, v.v.) trong JavaScript. Event Delegation tận dụng bubbling để gắn một listener duy nhất cho nhiều phần tử, cải thiện hiệu suất và xử lý các phần tử động.",
    exercises: [
      "Tạo một danh sách <ul> với các <li>, thêm event listener để console.log nội dung khi click mỗi <li>.",
      "Sử dụng event delegation để xử lý click trên một danh sách động (thêm/xóa <li> bằng JS).",
      "Tạo một bảng với các ô, thêm sự kiện click để đổi màu nền của ô được click."
    ],
    completed: false
  },
  "15": { 
    info: "Async JavaScript (Promises, async/await) xử lý các tác vụ bất đồng bộ như gọi API, đọc file, hoặc setTimeout. Promises quản lý trạng thái (pending, fulfilled, rejected), trong khi async/await làm mã dễ đọc hơn, giống cú pháp đồng bộ.",
    exercises: [
      "Tạo một Promise trả về 'Thành công' sau 2 giây, xử lý kết quả bằng .then().",
      "Sử dụng async/await để fetch dữ liệu từ API công cộng (như JSONPlaceholder) và hiển thị lên giao diện.",
      "Viết một hàm async tải lần lượt 3 API giả lập, xử lý lỗi bằng try-catch."
    ],
    completed: false
  },
  "16": { 
    info: "Fetch API và Axios là các công cụ gọi HTTP request để lấy hoặc gửi dữ liệu từ server. Fetch là API tích hợp của trình duyệt, trong khi Axios là thư viện bên thứ ba với cú pháp đơn giản và hỗ trợ tốt hơn cho các tính năng như cancel request.",
    exercises: [
      "Sử dụng Fetch để lấy danh sách bài viết từ API JSONPlaceholder và hiển thị tiêu đề trong một danh sách.",
      "Cài đặt Axios và viết một hàm lấy dữ liệu người dùng từ một API công cộng, xử lý lỗi nếu có.",
      "So sánh Fetch và Axios bằng cách gọi cùng một API, ghi chú sự khác biệt trong cách xử lý dữ liệu."
    ],
    completed: false
  },
  "17": { 
    info: "LocalStorage và SessionStorage là các API lưu trữ dữ liệu trên trình duyệt, cho phép lưu thông tin như cài đặt người dùng hoặc trạng thái ứng dụng. LocalStorage lưu vĩnh viễn (cho đến khi xóa), còn SessionStorage chỉ tồn tại trong phiên duyệt web.",
    exercises: [
      "Tạo một form để lưu tên người dùng vào LocalStorage, hiển thị lại khi tải lại trang.",
      "Sử dụng SessionStorage để lưu số lần người dùng click vào một nút trong một phiên, reset khi đóng tab.",
      "Viết một ứng dụng đơn giản lưu danh sách công việc (to-do list) vào LocalStorage và cho phép xóa mục."
    ],
    completed: false
  },
};

// Danh sách các node
const nodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Frontend" }, type: "input" },
  { id: "2", position: { x: -500, y: 150 }, data: { label: "HTML" } },
  { id: "5", position: { x: -650, y: 300 }, data: { label: "Semantic HTML" } },
  { id: "8", position: { x: -500, y: 300 }, data: { label: "Forms & Validation" } },
  { id: "9", position: { x: -350, y: 300 }, data: { label: "Accessibility (a11y)" } },
  { id: "3", position: { x: 0, y: 150 }, data: { label: "CSS" } },
  { id: "6", position: { x: -150, y: 300 }, data: { label: "Flexbox / Grid" } },
  { id: "10", position: { x: 0, y: 300 }, data: { label: "Responsive Design" } },
  { id: "11", position: { x: 150, y: 300 }, data: { label: "Animations / Transitions" } },
  { id: "12", position: { x: 0, y: 450 }, data: { label: "SCSS / Sass / CSS Modules" } },
  { id: "4", position: { x: 500, y: 150 }, data: { label: "JavaScript" } },
  { id: "7", position: { x: 350, y: 300 }, data: { label: "DOM Manipulation" } },
  { id: "13", position: { x: 500, y: 300 }, data: { label: "ES6+ Features" } },
  { id: "14", position: { x: 650, y: 300 }, data: { label: "Events / Event Delegation" } },
  { id: "15", position: { x: 500, y: 450 }, data: { label: "Async JS (Promises, async/await)" } },
  { id: "16", position: { x: 650, y: 450 }, data: { label: "Fetch API / Axios" } },
  { id: "17", position: { x: 350, y: 450 }, data: { label: "LocalStorage / SessionStorage" } },
];

// Danh sách các liên kết giữa node
const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e1-4", source: "1", target: "4" },
  { id: "e2-5", source: "2", target: "5" },
  { id: "e2-8", source: "2", target: "8" },
  { id: "e2-9", source: "2", target: "9" },
  { id: "e3-6", source: "3", target: "6" },
  { id: "e3-10", source: "3", target: "10" },
  { id: "e3-11", source: "3", target: "11" },
  { id: "e3-12", source: "3", target: "12" },
  { id: "e4-7", source: "4", target: "7" },
  { id: "e4-13", source: "4", target: "13" },
  { id: "e4-14", source: "4", target: "14" },
  { id: "e4-15", source: "4", target: "15" },
  { id: "e4-16", source: "4", target: "16" },
  { id: "e4-17", source: "4", target: "17" },
];

export default function Roadmap() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeProgress, setNodeProgress] = useState(nodeDetails);

  // Tính phần trăm tiến độ
  const totalNodes = Object.keys(nodeProgress).length;
  const completedNodes = Object.values(nodeProgress).filter(node => node.completed).length;
  const progressPercentage = Math.round((completedNodes / totalNodes) * 100);

  // Xử lý thay đổi trạng thái hoàn thành
  const handleCompleteToggle = (nodeId) => {
    setNodeProgress(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        completed: !prev[nodeId].completed
      }
    }));
  };

  // Debug state changes
  useEffect(() => {
    console.log("selectedNode updated:", selectedNode);
    console.log("nodeProgress updated:", nodeProgress);
  }, [selectedNode, nodeProgress]);

  const onNodeClick = (event, node) => {
    console.log("Node clicked:", node);
    console.log("Node ID:", node.id);
    console.log("Node details:", nodeProgress[node.id]);
    setSelectedNode(node);
  };

  const closePanel = () => {
    setSelectedNode(null);
  };

  return (
    <>
      <Header />
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <h1>Front-end Roadmap</h1>
        <p>Chào mừng, đây là lộ trình front-end cho các anh chị em</p>
        <div className="progress-container">
          <label>Tiến độ: {progressPercentage}%</label>
          <div className="progress-bar">
            <div style={{ width: `${progressPercentage}%` }}>
            </div>
          </div>
        </div>
      </div>
      <div
        className="roadmap-container"
        style={{ position: "relative", width: "100%", height: "80vh" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>

        {selectedNode && (
          <>
            <div className="overlay" onClick={closePanel}></div>
            <div className="info-panel">
              <div className="info-panel-header">
                <h3>{selectedNode.data.label}</h3>
                <button onClick={closePanel}>✕</button>
              </div>
              <div className="completion-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={nodeProgress[selectedNode.id].completed}
                    onChange={() => handleCompleteToggle(selectedNode.id)}
                  />
                  Đánh dấu hoàn thành
                </label>
              </div>
              <h4>Thông tin:</h4>
              <p>{nodeProgress[selectedNode.id]?.info || "Không có thông tin."}</p>
              <h4>Bài tập:</h4>
              <ul>
                {nodeProgress[selectedNode.id]?.exercises?.length > 0 ? (
                  nodeProgress[selectedNode.id].exercises.map((exercise, index) => (
                    <li key={index}>{exercise}</li>
                  ))
                ) : (
                  <li>Không có bài tập.</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}