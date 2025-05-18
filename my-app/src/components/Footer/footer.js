import React from "react";
import '../../context/LanguageContext';
import './footer.css';

export default function Footer() {
    return (
        <footer className="footer py-4" style={{ backgroundColor: '#0b0b0b', color: '#fff' }}>
            <div className="container-2">
                <div className="row">
                    {/* About Section */}
                    <div className="col-md-4 mb-3">
                        <h5 className="text-uppercase mb-3">RoadMapPTIT</h5>
                        <p>
                        RoadMapPTIT là nền tảng cung cấp lộ trình học tập và tài liệu tham khảo giúp bạn định hướng và phát triển kỹ năng lập trình, DevOps, bảo mật và nhiều lĩnh vực khác.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-4 mb-3">
                        <h5 className="text-uppercase mb-3">Liên kết nhanh</h5>
                        <ul className="list-unstyled">
                        <li><a href="/" className="text-white text-decoration-none">Lộ Trình</a></li>
                        <li><a href="/about-us" className="text-white text-decoration-none">Về Chúng Tôi</a></li>
                        <li><a href="/login" className="text-white text-decoration-none">Đăng nhập</a></li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="col-md-4 mb-3">
                        <h5 className="text-uppercase mb-3">Liên hệ</h5>
                        <ul className="list-unstyled">
                        <li><i className="ri-mail-line me-2"></i>Email: support@roadmapptit.com</li>
                        <li><i className="ri-phone-line me-2"></i>Hotline: (+84) 123 456 789</li>
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

                {/* Copyright */}
                <div className="text-center mt-4">
                <p className="mb-0">© 2025 RoadMapPTIT. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}