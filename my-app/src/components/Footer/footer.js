import React, { useState, useEffect, useMemo } from "react";
import './footer.css';

export default function Footer({ currentLang }) {
  const initialTranslations = useMemo(() => ({
    title: "RoadMapPTIT",
    description: "RoadMapPTIT là nền tảng cung cấp lộ trình học tập và tài liệu tham khảo giúp bạn định hướng và phát triển kỹ năng lập trình, DevOps, bảo mật và nhiều lĩnh vực khác.",
    quickLinks: "Liên kết nhanh",
    roadmapLink: "Lộ Trình",
    aboutUsLink: "Về Chúng Tôi",
    loginLink: "Đăng nhập",
    contact: "Liên hệ",
    email: "Email: support@roadmapptit.com",
    hotline: "Hotline: (+84) 123 456 789",
    copyright: "© 2025 RoadMapPTIT. All rights reserved.",
  }), []); // Không có dependency, chỉ tạo một lần

  const [translations, setTranslations] = useState(() => {
    const savedTranslations = localStorage.getItem('footerTranslations');
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
    localStorage.setItem('footerTranslations', JSON.stringify(translations));
  }, [translations]);

  return (
    <footer className="footer py-4" style={{ backgroundColor: '#0b0b0b', color: '#fff' }}>
      <div className="container-2">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase mb-3">{translations.title}</h5>
            <p>{translations.description}</p>
          </div>

          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase mb-3">{translations.quickLinks}</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white text-decoration-none">{translations.roadmapLink}</a></li>
              <li><a href="/about-us" className="text-white text-decoration-none">{translations.aboutUsLink}</a></li>
              <li><a href="/login" className="text-white text-decoration-none">{translations.loginLink}</a></li>
            </ul>
          </div>

          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase mb-3">{translations.contact}</h5>
            <ul className="list-unstyled">
              <li><i className="ri-mail-line me-2"></i>{translations.email}</li>
              <li><i className="ri-phone-line me-2"></i>{translations.hotline}</li>
            </ul>
            <div className="social-icons mt-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="ri-twitter-fill"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="ri-github-fill"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <i className="ri-linkedin-fill"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="mb-0">{translations.copyright}</p>
        </div>
      </div>
    </footer>
  );
}