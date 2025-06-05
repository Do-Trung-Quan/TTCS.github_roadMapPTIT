import React, { useState, useEffect, useMemo } from "react";
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
import { useAuth } from '../../context/AuthContext';

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const Login = ({ currentLang }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Sử dụng useAuth để lấy hàm loginSuccess
  const { loginSuccess } = useAuth();

  const initialTranslations = useMemo(() => ({
    loginTitle: "Đăng nhập",
    loginSubtitle: "Chào mừng trở lại 🥳",
    googleButton: "Kết nối bằng Google",
    githubButton: "Kết nối bằng Github",
    divider: "HOẶC",
    usernamePlaceholder: "Tên đăng nhập",
    passwordPlaceholder: "Mật khẩu",
    loginButton: "Đăng nhập",
    forgetPassword: "Quên mật khẩu?",
    noAccount: "Chưa có tài khoản?",
    signupLink: "Đăng ký",
    processing: "Đang xử lý...",
    errorPrefix: "Lỗi đăng nhập: ",
    successMessage: "Đăng nhập thành công!",
    connectionError: "Lỗi kết nối tới server.",
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const translateText = async (texts, targetLang) => {
    try {
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error('Lỗi dịch:', error);
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
        updatedTranslations[key] = decodeHtmlEntities(translatedTexts[index] || initialTranslations[key]);
      });
      setTranslations(updatedTranslations);
    };
    translateContent();
  }, [currentLang, initialTranslations]);

  // Hàm xử lý response API chung
  const handleApiResponse = async (response) => {
    const data = await response.json();

    if (response.ok) {
      console.log("Đăng nhập thành công:", data);
      if (data.tokens && data.tokens.access && data.tokens.refresh) {
        Cookies.set('access_token', data.tokens.access, { expires: 1/24, secure: true, sameSite: 'Strict' });
        Cookies.set('refresh_token', data.tokens.refresh, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('user_username', data.username, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('user_email', data.email, { expires: 7, secure: true, sameSite: 'Strict' });
        loginSuccess(data.tokens.access);
        setSuccessMessage(translations.successMessage);
        setError(null);
        setTimeout(() => navigate("/"), 500);
      } else {
        setError(`${translations.errorPrefix}Đăng nhập thành công nhưng không nhận được token.`);
        console.error("API response ok but no token:", data);
        setSuccessMessage(null);
      }
    } else {
      const errorMessage = data.detail || data.message || data.error || JSON.stringify(data);
      setError(`${translations.errorPrefix}${errorMessage}`);
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
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await handleApiResponse(response);
    } catch (err) {
      console.error("Lỗi kết nối server (Standard Login):", err);
      setError(translations.connectionError);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý đăng nhập bằng Social
  const handleSocialLoginRequest = async (payload) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("http://localhost:8000/api/social-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await handleApiResponse(response);
    } catch (err) {
      console.error("Lỗi kết nối server (Social Login):", err);
      setError(translations.connectionError);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý submit form đăng nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError(`${translations.errorPrefix}Vui lòng nhập tên đăng nhập và mật khẩu.`);
      setSuccessMessage(null);
      return;
    }
    const payload = { username, password };
    await handleStandardLogin(payload);
  };

  // Hàm xử lý Google Login
  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email;
      if (!email) {
        setError(`${translations.errorPrefix}Không thể lấy thông tin email từ Google.`);
        setSuccessMessage(null);
        setIsLoading(false);
        return;
      }
      const payload = { email };
      await handleSocialLoginRequest(payload);
    } catch (err) {
      console.error("Google login error:", err);
      let errorMessage = `${translations.errorPrefix}Lỗi đăng nhập Google.`;
      if (err.code) errorMessage += ` Mã lỗi: ${err.code}`;
      if (err.message) errorMessage += ` Chi tiết: ${err.message}`;
      setError(errorMessage);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý Github Login
  const handleGithubLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const email = user.email;
      if (!email) {
        setError(`${translations.errorPrefix}Không thể lấy thông tin email từ Github.`);
        setSuccessMessage(null);
        setIsLoading(false);
        return;
      }
      const payload = { email };
      await handleSocialLoginRequest(payload);
    } catch (err) {
      console.error("GitHub login error:", err);
      let errorMessage = `${translations.errorPrefix}Lỗi đăng nhập Github.`;
      if (err.code) errorMessage += ` Mã lỗi: ${err.code}`;
      if (err.message) errorMessage += ` Chi tiết: ${err.message}`;
      setError(errorMessage);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">{translations.loginTitle}</h2>
          <p className="login-subtitle">{translations.loginSubtitle}</p>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="social-buttons">
            <button className="social-button google" onClick={handleGoogleLogin} disabled={isLoading}>
              <img src={googleIcon} alt="Google" className="icon" />
              <span>{translations.googleButton}</span>
            </button>
            <button className="social-button github" onClick={handleGithubLogin} disabled={isLoading}>
              <img src={githubIcon} alt="Github" className="icon" />
              <span>{translations.githubButton}</span>
            </button>
          </div>

          <div className="divider">{translations.divider}</div>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <input
              type="text"
              placeholder={translations.usernamePlaceholder}
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder={translations.passwordPlaceholder}
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? translations.processing : translations.loginButton}
            </button>
          </form>

          <p className="reset-password">
            <Link to="/resetPasswordEmail">{decodeHtmlEntities(translations.forgetPassword)}</Link>
          </p>
          <p className="signup-link">
            {decodeHtmlEntities(translations.noAccount)} <Link to="/signup">{decodeHtmlEntities(translations.signupLink)}</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;