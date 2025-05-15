import React, { useState } from 'react';
import './ResetPasswordEmail.css';
import Header from '../../components/Header/header';
import { Link } from "react-router-dom";

const ResetPasswordEmail = () => {
  const [email, setEmail] = useState(''); // State để lưu email người dùng nhập

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn form submit mặc định

    // Gửi yêu cầu reset mật khẩu đến backend
    try {
      const response = await fetch('http://localhost:8000/api/password/reset-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) // Gửi email vào body yêu cầu
      });

      const data = await response.json(); // Lấy dữ liệu phản hồi từ backend

      if (response.ok) {
        // Nếu yêu cầu thành công, thông báo và chuyển hướng
        alert('Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.');
      } else {
        // Nếu có lỗi, hiển thị thông báo lỗi
        console.error(data.detail || 'Có lỗi xảy ra khi gửi email.');
        alert(data.detail || 'Có lỗi xảy ra khi gửi email.');
      }
    } catch (error) {
      // Xử lý lỗi kết nối với server
      console.error('Lỗi kết nối với server.');
      alert('Lỗi kết nối với server.');
    }
  };

  return (
    <>
      <Header />
      <div className="email-container">
        <div className="email-box">
          <h2 className="email-title">Đặt lại mật khẩu</h2>
          <p className="email-subtitle">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
          
          <form className="emailForm" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Cập nhật giá trị email khi người dùng nhập
              required
              className="email-input"
            />
            <button type="submit" className="email-button">Gửi Email</button>
          </form>
          <p className="signup-link">
            Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordEmail;
