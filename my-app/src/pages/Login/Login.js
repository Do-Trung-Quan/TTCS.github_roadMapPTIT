import React, { useState } from "react";
import "./Login.css";
import githubIcon from "../../assets/img/github_Icon.png";
import googleIcon from "../../assets/img/google_Icon.png";
// Đảm bảo component Header tồn tại
import Header from "../../components/Header/header";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

// Đảm bảo firebaseConfig, auth, googleProvider, githubProvider được cấu hình đúng
import { auth, googleProvider, githubProvider } from "../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

// --- Import thư viện js-cookie ---
import Cookies from 'js-cookie';
// --- Hết Import thư viện js-cookie ---


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const [error, setError] = useState(null); // Thêm state lỗi
  const [successMessage, setSuccessMessage] = useState(null); // Thêm state thông báo thành công
  const navigate = useNavigate();

<<<<<<< Updated upstream
<<<<<<< Updated upstream
   const sendLoginRequest = async (payload) => {
=======
=======
>>>>>>> Stashed changes
  // Hàm xử lý response API chung (lưu token vào cookie, thông báo, điều hướng)
  const handleApiResponse = async (response) => {
    const data = await response.json();

    if (response.ok) {
      console.log("Đăng nhập thành công:", data);
      // --- Lưu Token vào Cookie ---
      if (data.tokens && data.tokens.access && data.tokens.refresh) {
          // Lưu access token (thường có thời gian sống ngắn hơn)
          Cookies.set('access_token', data.tokens.access, { expires: 1/24, secure: true, sameSite: 'Strict' }); // Ví dụ: hết hạn sau 1 giờ (1/24 ngày), chỉ HTTPS, SameSite Strict
          // Lưu refresh token (thường có thời gian sống dài hơn)
          Cookies.set('refresh_token', data.tokens.refresh, { expires: 7, secure: true, sameSite: 'Strict' }); // Ví dụ: hết hạn sau 7 ngày, chỉ HTTPS, SameSite Strict

           // Tùy chọn: lưu thêm thông tin user như username, email, role vào cookie hoặc state/context
          Cookies.set('user_username', data.username, { expires: 7, secure: true, sameSite: 'Strict' });
          Cookies.set('user_email', data.email, { expires: 7, secure: true, sameSite: 'Strict' });
           // Lưu role nếu API trả về và bạn cần dùng ở frontend
           // Cookies.set('user_role', data.role, { expires: 7, secure: true, sameSite: 'Strict' }); // Cần backend trả về role trong response login

          setSuccessMessage("Đăng nhập thành công!");
          setError(null);

          // Điều hướng đến trang chính sau khi đăng nhập thành công
          // TODO: Điều hướng dựa trên vai trò (role) nếu cần (admin -> /admin, user -> /)
          setTimeout(() => navigate("/"), 500); // Điều hướng về trang gốc (UserPage) sau 0.5s
          // setTimeout(() => navigate("/admin"), 500); // Điều hướng về trang admin nếu cần

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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Đăng nhập thành công:", data);
        alert("Đăng nhập thành công!");
        setTimeout(() => navigate("/roadmap"), 1000);
      } else {
        console.error("Lỗi đăng nhập:", data);
        alert("Lỗi đăng nhập: " + JSON.stringify(data));
      }
=======

      await handleApiResponse(response); // Sử dụng hàm xử lý response chung

>>>>>>> Stashed changes
    } catch (err) {
      console.error("Lỗi kết nối server (Standard Login):", err);
      setError("Lỗi kết nối tới server.");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };
<<<<<<< Updated upstream
  
  const sendSocialLoginRequest = async (payload) => {
    try {
      const response = await fetch("http://localhost:8000/api/social-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Đăng nhập bằng tài khoản xã hội thành công:", data);
        alert("Đăng nhập xã hội thành công!");
        setTimeout(() => navigate("/roadmap"), 1000);
      } else {
        console.error("Lỗi đăng nhập bằng tài khoản xã hội:", data);
        alert("Lỗi đăng nhập xã hội: " + JSON.stringify(data));
      }
=======

      await handleApiResponse(response); // Sử dụng hàm xử lý response chung

>>>>>>> Stashed changes
    } catch (err) {
      console.error("Lỗi kết nối server (Standard Login):", err);
      setError("Lỗi kết nối tới server.");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };
<<<<<<< Updated upstream
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const payload = { username, password };
    await sendLoginRequest(payload);
=======

   // Hàm xử lý đăng nhập bằng Social (Google/Github)
   const handleSocialLoginRequest = async (payload) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
       try {
         // API social login nhận email
         const response = await fetch("http://localhost:8000/api/social-login/", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload), // Payload chỉ chứa email
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
=======

   // Hàm xử lý đăng nhập bằng Social (Google/Github)
   const handleSocialLoginRequest = async (payload) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
       try {
         // API social login nhận email
         const response = await fetch("http://localhost:8000/api/social-login/", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload), // Payload chỉ chứa email
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
>>>>>>> Stashed changes
    if (!username || !password) {
        setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
        setSuccessMessage(null);
        return;
    }
    const payload = { username, password };
    await handleStandardLogin(payload); // Gọi hàm xử lý standard login
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  };


  // Hàm xử lý click nút Google Login (sử dụng Firebase)
  const handleGoogleLogin = async () => {
     setError(null);
     setSuccessMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      const user = result.user;
      const payload = {
        email: user.email,
        password: user.uid,
      };
      await sendSocialLoginRequest(payload);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Lỗi đăng nhập với Google: " + err.message);
    }
  };
  
=======
      const user = result.user; // User object từ Firebase

      // Lấy email từ Firebase user
      const email = user.email;
      if (!email) {
          setError("Không thể lấy thông tin email từ Google.");
          setSuccessMessage(null);
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
    }
  };


  // Hàm xử lý click nút Github Login (sử dụng Firebase)
>>>>>>> Stashed changes
=======
      const user = result.user; // User object từ Firebase

      // Lấy email từ Firebase user
      const email = user.email;
      if (!email) {
          setError("Không thể lấy thông tin email từ Google.");
          setSuccessMessage(null);
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
    }
  };


  // Hàm xử lý click nút Github Login (sử dụng Firebase)
>>>>>>> Stashed changes
  const handleGithubLogin = async () => {
      setError(null);
      setSuccessMessage(null);
    try {
      const result = await signInWithPopup(auth, githubProvider);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      const user = result.user;
      const payload = {
        email: user.email,
        password: user.uid,
      };
      await sendSocialLoginRequest(payload);
    } catch (err) {
      console.error("GitHub login error:", err);
      alert("Lỗi đăng nhập với GitHub: " + err.message);
=======
      const user = result.user; // User object từ Firebase

      // Lấy email từ Firebase user
      const email = user.email;
       if (!email) {
           setError("Không thể lấy thông tin email từ Github.");
            setSuccessMessage(null);
           return;
       }

      const payload = { email: email }; // Payload chỉ gồm email cho social login API
      await handleSocialLoginRequest(payload); // Gọi hàm xử lý social login API

    } catch (err) {
      console.error("GitHub login error:", err);
=======
      const user = result.user; // User object từ Firebase

      // Lấy email từ Firebase user
      const email = user.email;
       if (!email) {
           setError("Không thể lấy thông tin email từ Github.");
            setSuccessMessage(null);
           return;
       }

      const payload = { email: email }; // Payload chỉ gồm email cho social login API
      await handleSocialLoginRequest(payload); // Gọi hàm xử lý social login API

    } catch (err) {
      console.error("GitHub login error:", err);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }
  };


  return (
    <>
      {/* Đảm bảo component Header tồn tại và hoạt động */}
      <Header />
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