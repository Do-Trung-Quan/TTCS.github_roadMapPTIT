import React, { useState } from 'react';
import './ResetPassword.css';
import Header from '../../components/Header/header';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Gửi yêu cầu đến backend
      const response = await fetch('http://localhost:8000/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
  
      // Kiểm tra phản hồi từ backend
      const data = await response.json();
  
      if (response.ok) {
        // Nếu thành công, chuyển hướng người dùng
        alert('Mật khẩu đã được thay đổi thành công!');
        navigate('/login');
      } else {
        // Nếu có lỗi, hiển thị thông báo từ backend
        alert(data.detail || 'Đã xảy ra lỗi. Vui lòng thử lại!');
      }
    } catch (error) {
      alert('Lỗi kết nối với server.');
    }
  };

  return (
    <>
      <Header />
      <div className="reset-container">
        <div className="reset-box">
          <h2 className="reset-title">Đặt lại mật khẩu</h2>
          <p className="reset-subtitle">
            Nhập và xác nhận mật khẩu mới của bạn bên dưới.
          </p>
          <form className='resetForm' onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className='reset-input'
              />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className='reset-input'
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className='reset-input'
            />
            <button type="submit" className='reset-button'>Đặt lại mật khẩu</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
