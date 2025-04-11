import React, { useState } from "react";
import "./Login.css";
import githubIcon from "../../assets/img/github_Icon.png";
import googleIcon from "../../assets/img/google_Icon.png";
import Header from "../../components/Header/header";
import { Link } from "react-router-dom";
import { auth, googleProvider, githubProvider } from "../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
   const navigate = useNavigate();

  const sendLoginRequest = async (payload) => {
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Đăng nhập thành công:", data);
        alert("Đăng nhập thành công!");
        // Điều hướng đến trang chính sau khi đăng nhập thành công
        setTimeout(() => navigate("/roadmap"), 1000);
      } else {
        console.error("Lỗi đăng nhập:", data);
        alert("Lỗi đăng nhập: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Lỗi kết nối server:", err);
      alert("Lỗi kết nối tới server.");
    }
  };

  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const payload = { username, password }; // Payload chỉ gồm username và password
    await sendLoginRequest(payload);
  };
  
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const payload = {
        email: user.email,
        password: user.uid, // Sử dụng UID làm password tạm
      };
      await sendLoginRequest(payload);
    } catch (err) {
      console.error("Google login error:", err);
    }
  };
  

  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const payload = {
        email: user.email,
        password: user.uid, // Sử dụng UID làm password tạm
      };
      await sendLoginRequest(payload);
    } catch (err) {
      console.error("GitHub login error:", err);
    }
  };
  

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-subtitle">Chào mừng trở lại 🥳</p>

          <div className="social-buttons">
            <button className="social-button google" onClick={handleGoogleLogin}>
              <img src={googleIcon} alt="Google" className="icon" />
              <span>Kết nối bằng Google</span>
            </button>
            <button className="social-button github" onClick={handleGithubLogin}>
              <img src={githubIcon} alt="Github" className="icon" />
              <span>Kết nối bằng Github</span>
            </button>
          </div>

          <div className="divider">HOẶC</div>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-button">Đăng nhập</button>
          </form>

          <p className="reset-password">
            <Link to="/resetPasswordEmail">Quên mật khẩu?</Link>
          </p>
          <p className="signup-link">
            Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
