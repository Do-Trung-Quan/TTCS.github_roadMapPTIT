import React, { useState } from "react";
import "./SignUp.css";
import githubIcon from "../../assets/img/github_Icon.png";
import googleIcon from "../../assets/img/google_Icon.png";
import { Link } from "react-router-dom";
import Header from "../../components/Header/header";
import { auth, googleProvider, githubProvider } from "../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= minLength;
    if (!isLongEnough) {
      return "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!hasUpperCase) {
      return "Mật khẩu phải chứa ít nhất 1 chữ hoa.";
    }
    if (!hasNumber) {
      return "Mật khẩu phải chứa ít nhất 1 số.";
    }
    return ""; // hợp lệ
  };
  
  const sendRegisterRequest = async (payload) => {
    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Đăng ký thành công:", data);
        alert("Đăng ký thành công!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        console.error("Lỗi đăng ký:", data);
        alert("Lỗi đăng ký: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Lỗi kết nối server:", err);
      alert("Lỗi kết nối tới server.");
    }
  };
  
  const sendSocialRegisterRequest = async (payload) => {
    try {
      const response = await fetch("http://localhost:8000/api/social-register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Đăng ký bằng tài khoản xã hội thành công:", data);
        alert("Đăng ký bằng tài khoản xã hội thành công!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        console.error("Lỗi đăng ký bằng tài khoản xã hội:", data);
        alert("Lỗi đăng ký bằng tài khoản xã hội: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Lỗi kết nối server:", err);
      alert("Lỗi kết nối tới server.");
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = { username, email, password };
    await sendRegisterRequest(payload);
  };
  
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const payload = {
        username: user.displayName || user.email.split("@")[0],
        email: user.email,
        password: user.uid,
        avatar: user.photoURL,
      };
      await sendSocialRegisterRequest(payload);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Lỗi đăng ký với Google: " + err.message);
    }
  };
  
  const handleGithubSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const payload = {
        username: user.displayName || user.email?.split("@")[0] || user.uid,
        email: user.email,
        password: user.uid,
        avatar: user.photoURL,
      };
      await sendSocialRegisterRequest(payload);
    } catch (err) {
      console.error("GitHub login error:", err);
      alert("Lỗi đăng ký với GitHub: " + err.message);
    }
  };
  

  return (
    <>
      <Header />
      <div className="signup-container">
        <div className="signup-box">
          <h2 className="signup-title">Đăng ký</h2>
          <p className="signup-subtitle">
            Tạo tài khoản để theo dõi tiến trình học tập, học hỏi các kỹ năng chuyên môn và trở thành một phần của cộng đồng lập trình.
          </p>

          <div className="social-buttons">
            <button className="social-button google" onClick={handleGoogleSignUp}>
              <img src={googleIcon} alt="Google" className="icon" />
              <span>Kết nối bằng Google</span>
            </button>
            <button className="social-button github" onClick={handleGithubSignUp}>
              <img src={githubIcon} alt="Github" className="icon" />
              <span>Kết nối bằng Github</span>
            </button>
          </div>

          <div className="divider">HOẶC</div>

          <form className="signup-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="signup-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e) => {
                if (username.trim() === "") {
                  e.target.setCustomValidity("Vui lòng nhập tên đăng nhập.");
                }
              }}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="signup-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e) => {
                e.target.setCustomValidity("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
              }}
              required
            />

            <input
              type="password"
              placeholder="Mật khẩu"
              className="signup-input"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);

                const message = validatePassword(value);
                e.target.setCustomValidity(message); // Cập nhật lỗi (nếu có)
              }}
              onInvalid={(e) => {
                const message = validatePassword(password);
                e.target.setCustomValidity(message);
              }}
              required
            />

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
