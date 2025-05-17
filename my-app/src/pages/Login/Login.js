import React, { useState } from "react";
import "./Login.css";
import githubIcon from "../../assets/img/github_Icon.png";
import googleIcon from "../../assets/img/google_Icon.png";
import { Link, useNavigate } from "react-router-dom";

// Đảm bảo firebaseConfig, auth, googleProvider, githubProvider được cấu hình đúng
import { auth, googleProvider, githubProvider } from "../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

// Import thư viện js-cookie
import Cookies from 'js-cookie';

// Import useAuth từ AuthContext của bạn
import { useAuth } from '../../context/AuthContext'; // <-- Đảm bảo đường dẫn đúng


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Sử dụng useAuth để lấy hàm loginSuccess
  const { loginSuccess } = useAuth(); // <-- Lấy loginSuccess từ Context


  // Hàm xử lý response API chung (lưu token vào cookie, thông báo, điều hướng, và cập nhật AuthContext)
  const handleApiResponse = async (response) => {
    const data = await response.json();

    if (response.ok) {
      console.log("Đăng nhập thành công:", data);
      // --- Lưu Token vào Cookie ---
      if (data.tokens && data.tokens.access && data.tokens.refresh) {
          // Lưu token vào cookie (có thể điều chỉnh expires, secure, sameSite)
          Cookies.set('access_token', data.tokens.access, { expires: 1/24, secure: true, sameSite: 'Strict' });
          Cookies.set('refresh_token', data.tokens.refresh, { expires: 7, secure: true, sameSite: 'Strict' });

           // Tùy chọn: lưu thêm thông tin user như username, email, role vào cookie hoặc state/context
          Cookies.set('user_username', data.username, { expires: 7, secure: true, sameSite: 'Strict' });
          Cookies.set('user_email', data.email, { expires: 7, secure: true, sameSite: 'Strict' });

          // --- GỌI loginSuccess ĐỂ CẬP NHẬT TRẠNG THÁI TRONG AuthContext ---
          loginSuccess(data.tokens.access); // Truyền token hoặc chỉ gọi không tham số tùy AuthContext

          setSuccessMessage("Đăng nhập thành công!");
          setError(null);
          // Điều hướng sau một khoảng thời gian ngắn
          setTimeout(() => navigate("/"), 500);

      } else {
          // API thành công nhưng không có token (trường hợp ít xảy ra với API login)
          setError("Đăng nhập thành công nhưng không nhận được token.");
          console.error("API response ok but no token:", data);
          setSuccessMessage(null);
      }

    } else {
      // Xử lý lỗi từ backend (response.ok là false)
      const errorMessage = data.detail || data.message || data.error || JSON.stringify(data);
      setError("Lỗi đăng nhập: " + errorMessage);
      console.error("Lỗi đăng nhập API response:", data);
      setSuccessMessage(null);
    }
  };

  // Hàm xử lý đăng nhập bằng Username/Password
  const handleStandardLogin = async (payload) => {
     setIsLoading(true);
     setError(null);
     setSuccessMessage(null);
    try {
      const response = await fetch("http://localhost:8000/api/login/", { // <-- Đảm bảo đúng endpoint API login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await handleApiResponse(response); // Sử dụng hàm xử lý response chung

    } catch (err) {
      console.error("Lỗi kết nối server (Standard Login):", err);
      setError("Lỗi kết nối tới server.");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

   // Hàm xử lý đăng nhập bằng Social (Google/Github)
   const handleSocialLoginRequest = async (payload) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
       try {
         // API social login nhận email
         const response = await fetch("http://localhost:8000/api/social-login/", { // <-- Đảm bảo đúng endpoint API social login
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload),
         });

         await handleApiResponse(response); // Sử dụng hàm xử lý response chung

       } catch (err) {
         console.error("Lỗi kết nối server (Social Login):", err);
         setError("Lỗi kết nối tới server.");
         setSuccessMessage(null);
       } finally {
         setIsLoading(false);
       }
   };


  // Hàm xử lý submit form đăng nhập (Username/Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
        setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
        setSuccessMessage(null);
        return;
    }
    const payload = { username, password };
    await handleStandardLogin(payload); // Gọi hàm xử lý standard login
  };


  // Hàm xử lý click nút Google Login (sử dụng Firebase)
  const handleGoogleLogin = async () => {
     setError(null);
     setSuccessMessage(null);
     setIsLoading(true); // Bắt đầu loading cho social login
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user; // User object từ Firebase

      // Lấy email từ Firebase user
      const email = user.email;
      if (!email) {
          setError("Không thể lấy thông tin email từ Google.");
          setSuccessMessage(null);
          setIsLoading(false); // Kết thúc loading
          return;
      }

      const payload = { email: email }; // Payload chỉ gồm email cho social login API
      await handleSocialLoginRequest(payload); // Gọi hàm xử lý social login API

    } catch (err) {
      console.error("Google login error:", err);
       // Xử lý lỗi Firebase popup
       let errorMessage = "Lỗi đăng nhập Google.";
       if (err.code) {
           errorMessage += ` Mã lỗi: ${err.code}`;
       }
       if (err.message) {
           errorMessage += ` Chi tiết: ${err.message}`;
       }
      setError(errorMessage);
       setSuccessMessage(null);
    } finally {
         setIsLoading(false); // Luôn kết thúc loading
    }
  };


  // Hàm xử lý click nút Github Login (sử dụng Firebase)
  const handleGithubLogin = async () => {
      setError(null);
      setSuccessMessage(null);
      setIsLoading(true); // Bắt đầu loading cho social login
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user; // User object từ Firebase

      // Lấy email từ Firebase user
      const email = user.email;
       if (!email) {
           setError("Không thể lấy thông tin email từ Github.");
            setSuccessMessage(null);
            setIsLoading(false); // Kết thúc loading
           return;
       }

      const payload = { email: email }; // Payload chỉ gồm email cho social login API
      await handleSocialLoginRequest(payload); // Gọi hàm xử lý social login API

    } catch (err) {
      console.error("GitHub login error:", err);
       // Xử lý lỗi Firebase popup
       let errorMessage = "Lỗi đăng nhập Github.";
        if (err.code) {
           errorMessage += ` Mã lỗi: ${err.code}`;
       }
       if (err.message) {
           errorMessage += ` Chi tiết: ${err.message}`;
       }
      setError(errorMessage);
       setSuccessMessage(null);
    } finally {
        setIsLoading(false); // Luôn kết thúc loading
    }
  };


  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-subtitle">Chào mừng trở lại 🥳</p>

           {/* Hiển thị thông báo lỗi hoặc thành công */}
           {error && <div className="error-message">{error}</div>}
           {successMessage && <div className="success-message">{successMessage}</div>}


          <div className="social-buttons">
             {/* Thêm disabled khi đang loading */}
            <button className="social-button google" onClick={handleGoogleLogin} disabled={isLoading}>
              <img src={googleIcon} alt="Google" className="icon" />
              <span>Kết nối bằng Google</span>
            </button>
             {/* Thêm disabled khi đang loading */}
            <button className="social-button github" onClick={handleGithubLogin} disabled={isLoading}>
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
              disabled={isLoading} // Thêm disabled khi đang loading
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
               disabled={isLoading} // Thêm disabled khi đang loading
            />
            <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'} {/* Text động khi loading */}
            </button>
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
