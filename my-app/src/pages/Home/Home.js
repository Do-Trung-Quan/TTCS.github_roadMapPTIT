import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import './Home.css';

function Home({ currentLang }) {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();

  const initialTranslations = useMemo(() => ({
    welcome: "Chào mừng đến với RoadMapPTIT",
    intro: "Đây là nơi giúp anh em có những sự tham khảo, học hỏi cũng như là luyện tập một số kỹ năng nhất định để xác định được hướng đi của mình. Chúc anh em học tập vui vẻ!",
    webDev: "Lập Trình web:",
    otherPaths: "Các hướng đi khác:",
    references: "Một số tài liệu tham khảo:",
    webDevDocs: "Tài liệu cho Lập trình Web",
    devOpsDocs: "Tài liệu cho DevOps, Bảo mật và Nhúng",
    frontEnd: "Lộ Trình học front-end",
    backEnd: "Lộ Trình học back-end",
    fullStack: "Lộ Trình học full stacks",
    devOps: "Dev-ops",
    cybersecurity: "Cybersecurity",
    embedded: "Lập trình nhúng",
    mdnTitle: "MDN Web Docs",
    mdnDesc: "Tài liệu chuẩn cho HTML, CSS, JavaScript từ Mozilla.",
    w3Title: "W3Schools",
    w3Desc: "Nền tảng học lập trình web cơ bản dễ hiểu.",
    fccTitle: "FreeCodeCamp",
    fccDesc: "Học qua dự án, hoàn toàn miễn phí và rất thực tiễn.",
    jsInfoTitle: "JavaScript.info",
    jsInfoDesc: "Trang tài liệu chi tiết, hiện đại và đầy đủ về JavaScript.",
    gfgTitle: "GeeksForGeeks",
    gfgDesc: "Giải thích thuật toán, cấu trúc dữ liệu, bài tập lập trình rõ ràng.",
    roadmapTitle: "Roadmap.sh",
    roadmapDesc: "Tổng hợp lộ trình học từ Frontend, Backend, DevOps và nhiều hơn nữa.",
    devOpsHandbookTitle: "DevOps Handbook",
    devOpsHandbookDesc: "Sách hướng dẫn thực tiễn và toàn diện về DevOps, CI/CD, automation.",
    owaspTitle: "OWASP Top 10",
    owaspDesc: "Tài liệu hàng đầu về các lỗ hổng bảo mật phổ biến và cách phòng tránh.",
    embeddedTitle: "Embedded C Programming",
    embeddedDesc: "Tài liệu học lập trình nhúng từ cơ bản đến nâng cao, đặc biệt dùng C.",
    accessButton: "Truy cập",
  }), []);

  const [translations, setTranslations] = useState(() => {
    const savedTranslations = localStorage.getItem('homeTranslations');
    return savedTranslations ? JSON.parse(savedTranslations) : initialTranslations;
  });

  const translateText = async (texts, targetLang) => {
    try {
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: texts,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể dịch: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error('Lỗi khi gọi API dịch:', error);
      return texts;
    }
  };

  useEffect(() => {
    const translateContent = async () => {
      if (currentLang === 'vi') {
        setTranslations(initialTranslations);
        return;
      }

      const textsToTranslate = Object.values(initialTranslations);
      const translatedTexts = await translateText(textsToTranslate, currentLang);

      const updatedTranslations = {};
      Object.keys(initialTranslations).forEach((key, index) => {
        updatedTranslations[key] = translatedTexts[index] || initialTranslations[key];
      });
      setTranslations(updatedTranslations);
    };

    translateContent();
  }, [currentLang, initialTranslations]);

  useEffect(() => {
    localStorage.setItem('homeTranslations', JSON.stringify(translations));
  }, [translations]);

  const handleRoadmapClick = async (roadmapId) => {
    console.log('Handling roadmap click for ID:', roadmapId);
    let shouldNavigateToRoadmap = true; // Flag to control navigation

    if (user && user.role === 'user') {
      const token = getToken();
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/enrolls/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              UserID: user.id,
              RoadmapID: roadmapId,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('API enrolls thành công:', result);
            // No alert, silent enrollment
          } else {
            const errorData = await response.json();
            console.error('API enrolls thất bại. Status:', response.status, 'Error Data:', errorData);
            if (response.status === 400) {
              if (errorData.errors) {
                console.error("Lỗi validation từ backend:", errorData.errors);
              } else {
                console.error("Lỗi Bad Request không xác định:", errorData);
              }
            } else if (response.status === 403) {
              console.error("Thông báo lỗi: Bạn không có quyền thực hiện thao tác này (API returned 403 Forbidden).");
              alert('Lỗi: Bạn không có quyền ghi danh.');
            } else if (response.status === 401) {
              console.warn('Token hết hạn hoặc không hợp lệ, chuyển hướng về trang chủ sau 2 giây.');
              shouldNavigateToRoadmap = false; // Prevent navigating to roadmap
              setTimeout(() => navigate('/'), 2000); // Delayed redirect
            } else {
              console.error("Thông báo lỗi: Có lỗi xảy ra khi ghi danh. Vui lòng thử lại. Status:", response.status);
              alert('Đã xảy ra lỗi khi ghi danh. Vui lòng thử lại sau.');
            }
          }
        } catch (error) {
          console.error('Lỗi mạng hoặc lỗi khác khi gọi API enrolls:', error);
          shouldNavigateToRoadmap = false; // Prevent navigating to roadmap
          setTimeout(() => navigate('/'), 2000); // Delayed redirect
        }
      } else {
        console.warn('Không tìm thấy token sau khi kiểm tra user hợp lệ.');
        shouldNavigateToRoadmap = false; // Prevent navigating to roadmap
        setTimeout(() => navigate('/'), 2000); // Delayed redirect
      }
    }

    if (shouldNavigateToRoadmap) {
      console.log('Navigating to roadmap:', `/roadmap/${roadmapId}`);
      navigate(`/roadmap/${roadmapId}`);
    }
  };

  return (
    <>
      <div className="sc-1">
        <h1>{translations.welcome}</h1>
        <p>{translations.intro}</p>
      </div>
      <div className="container">
        <h3>{translations.webDev}</h3>
        <div className="course" onClick={() => handleRoadmapClick('RM001')}>
          <div className="progress-circle" data-progress="70"></div>
          <span><i className="ri-computer-line"></i> {translations.frontEnd}</span>
        </div>
        <div className="course" onClick={() => handleRoadmapClick('RM002')}>
          <div className="progress-circle" data-progress="70"></div>
          <span><i className="ri-code-s-slash-line"></i> {translations.backEnd}</span>
        </div>
        <div className="course" onClick={() => handleRoadmapClick('RM003')}>
          <div className="progress-circle" data-progress="70"></div>
          <span><i className="ri-terminal-window-line"></i> {translations.fullStack}</span>
        </div>

        <h3>{translations.otherPaths}</h3>
        <div className="course" onClick={() => handleRoadmapClick('RM004')}>
          <div className="progress-circle" data-progress="70"></div>
          <span>{translations.devOps}</span>
        </div>
        <div className="course" onClick={() => handleRoadmapClick('RM005')}>
          <div className="progress-circle" data-progress="70"></div>
          <span>{translations.cybersecurity}</span>
        </div>
        <div className="course" onClick={() => handleRoadmapClick('RM006')}>
          <div className="progress-circle" data-progress="70"></div>
          <span>{translations.embedded}</span>
        </div>

        <h3>{translations.references}</h3>
        <h4 className="mt-4 text-dark">🔗 {translations.webDevDocs}</h4>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-book-open-line"></i> {translations.mdnTitle}</h5>
                <p className="card-text">{translations.mdnDesc}</p>
                <a href="https://developer.mozilla.org/vi/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-global-line"></i> {translations.w3Title}</h5>
                <p className="card-text">{translations.w3Desc}</p>
                <a href="https://www.w3schools.com/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-graduation-cap-line"></i> {translations.fccTitle}</h5>
                <p className="card-text">{translations.fccDesc}</p>
                <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-javascript-line"></i> {translations.jsInfoTitle}</h5>
                <p className="card-text">{translations.jsInfoDesc}</p>
                <a href="https://javascript.info/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-warning btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-terminal-box-line"></i> {translations.gfgTitle}</h5>
                <p className="card-text">{translations.gfgDesc}</p>
                <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-road-map-line"></i> {translations.roadmapTitle}</h5>
                <p className="card-text">{translations.roadmapDesc}</p>
                <a href="https://roadmap.sh/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <h4 className="mt-4 text-dark">🔐 {translations.devOpsDocs}</h4>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-settings-3-line"></i> {translations.devOpsHandbookTitle}</h5>
                <p className="card-text">{translations.devOpsHandbookDesc}</p>
                <a href="https://itrevolution.com/product/the-devops-handbook/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-shield-line"></i> {translations.owaspTitle}</h5>
                <p className="card-text">{translations.owaspDesc}</p>
                <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title"><i className="ri-cpu-line"></i> {translations.embeddedTitle}</h5>
                <p className="card-text">{translations.embeddedDesc}</p>
                <a href="https://www.tutorialspoint.com/embedded_systems/index.htm" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">{translations.accessButton}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;