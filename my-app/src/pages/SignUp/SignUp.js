import React from "react";
import "./SignUp.css"; // Nhúng file CSS
import githubIcon from '../../assets/img/github_Icon.png';
import googleIcon from '../../assets/img/google_Icon.png';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/header';
const SignUp = () => {
  return (
    <>
    <Header/>
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Đăng ký</h2>
        <p className="signup-subtitle">
          Tạo tài khoản để theo dõi tiến trình học tập, học hỏi các kỹ năng chuyên môn và trở thành một phần của cộng đồng lập trình.
        </p>

        <div className="social-buttons">
        <button className="social-button google"> <img src={googleIcon} alt="Google" className="icon" />
        <span>Kết nối bằng Google</span> </button>
        <button className="social-button github"> <img src={githubIcon} alt="Github" className="icon" />
        <span>Kết nối bằng Github</span> </button>
        </div>

        <div className="divider">HOẶC</div>

        <form className="signup-form">
          <input type="text" placeholder="Username" className="signup-input" />
          <input type="email" placeholder="Email " className="signup-input" />
          <input type="password" placeholder="Mật khẩu" className="signup-input" />
          <button type="submit" className="signUp-button">Đăng ký</button>
        </form>

        <p className="login-link">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default SignUp;
