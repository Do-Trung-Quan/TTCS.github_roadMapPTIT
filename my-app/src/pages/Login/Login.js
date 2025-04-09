import React from "react";
import "./Login.css"; // Nhúng file CSS
import githubIcon from '../../assets/img/github_Icon.png';
import googleIcon from '../../assets/img/google_Icon.png';
import Header from '../../components/Header/header';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <>
    <Header />
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <p className="login-subtitle">
          Chào mừng trở lại 🥳
        </p>

        <div className="social-buttons">
        <button className="social-button google"> <img src={googleIcon} alt="Google" className="icon" />
        <span>Kết nối bằng Google</span> </button>
        <button className="social-button github"> <img src={githubIcon} alt="Github" className="icon" />
        <span>Kết nối bằng Github</span> </button>
        </div>

        <div className="divider">HOẶC</div>

        <form className="signup-form">
          <input type="text" placeholder="Username" className="login-input" />
          <input type="password" placeholder="Mật khẩu" className="login-input" />
          <button type="submit" className="signUp-button">Đăng nhập</button>
        </form>
        <p className="signup-link">
          Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;
