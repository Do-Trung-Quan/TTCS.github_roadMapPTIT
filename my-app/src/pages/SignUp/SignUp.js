import React, { useState, useEffect, useMemo } from "react";
import "./SignUp.css";
import githubIcon from "../../assets/img/github_Icon.png";
import googleIcon from "../../assets/img/google_Icon.png";
import { Link, useNavigate } from "react-router-dom";

// Đảm bảo firebaseConfig, auth, googleProvider, githubProvider được cấu hình đúng
import { auth, googleProvider, githubProvider } from "../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const SignUp = ({ currentLang }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const initialTranslations = useMemo(() => ({
    signupTitle: "Đăng ký",
    signupSubtitle: "Tạo tài khoản để theo dõi tiến trình học tập, học hỏi các kỹ năng chuyên môn và trở thành một phần của cộng đồng lập trình.",
    googleButton: "Kết nối bằng Google",
    githubButton: "Kết nối bằng Github",
    divider: "HOẶC",
    usernamePlaceholder: "Tên đăng nhập",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Mật khẩu",
    signupButton: "Đăng ký",
    loginPrompt: "Đã có tài khoản?",
    loginLink: "Đăng nhập",
    processing: "Đang xử lý...",
    errorPrefix: "Lỗi đăng ký: ",
    successMessage: "Đăng ký thành công! Vui lòng đăng nhập.",
    connectionError: "Lỗi kết nối tới server.",
    passwordLengthError: "Mật khẩu phải có ít nhất 8 ký tự.",
    passwordUppercaseError: "Mật khẩu phải chứa ít nhất 1 chữ hoa.",
    passwordNumberError: "Mật khẩu phải chứa ít nhất 1 số.",
    missingFieldsError: "Vui lòng điền đầy đủ thông tin.",
    invalidUsername: "Vui lòng nhập tên đăng nhập.",
    invalidEmail: "Email không hợp lệ. Vui lòng nhập đúng định dạng.",
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const translateText = async (texts, targetLang) => {
    try {
      const response = await fetch("http://localhost:8000/api/translate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error("Lỗi dịch:", error);
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

  // Hàm kiểm tra độ mạnh mật khẩu
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= minLength;

    if (!isLongEnough) return translations.passwordLengthError;
    if (!hasUpperCase) return translations.passwordUppercaseError;
    if (!hasNumber) return translations.passwordNumberError;

    return "";
  };

  // Hàm xử lý response API chung cho đăng ký
  const handleApiResponse = async (response) => {
    const data = await response.json();

    if (response.ok) {
      console.log("Đăng ký thành công:", data);
      setSuccessMessage(translations.successMessage);
      setError(null);
      setTimeout(() => navigate("/login"), 1500);
    } else {
      const errorMessage = data.detail || data.message || data.error || JSON.stringify(data);
      let validationErrors = "";
      if (data && typeof data === 'object') {
        for (const field in data) {
          if (Array.isArray(data[field])) {
            validationErrors += `${field}: ${data[field].join(", ")}\n`;
          } else if (typeof data[field] === 'string') {
            validationErrors += data[field] + "\n";
          }
        }
      }
      setError(`${translations.errorPrefix}${validationErrors || errorMessage}`);
      console.error("Lỗi đăng ký API response:", data);
      setSuccessMessage(null);
    }
  };

  // Hàm xử lý Đăng ký bằng Form
  const handleStandardSignUp = async (payload) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await handleApiResponse(response);
    } catch (err) {
      console.error("Lỗi kết nối server (Standard SignUp):", err);
      setError(translations.connectionError);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý Đăng ký bằng Social
  const handleSocialSignUpRequest = async (payload) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("http://localhost:8000/api/social-register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await handleApiResponse(response);
    } catch (err) {
      console.error("Lỗi kết nối server (Social SignUp):", err);
      setError(translations.connectionError);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý submit Form Đăng ký
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError(translations.missingFieldsError);
      setSuccessMessage(null);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setSuccessMessage(null);
      return;
    }

    const payload = { username, email, password };
    await handleStandardSignUp(payload);
  };

  // Hàm xử lý Google Sign Up
  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const payload = {
        username: user.displayName || (user.email ? user.email.split("@")[0] : user.uid),
        email: user.email,
        password: user.uid,
        avatar: user.photoURL,
      };
      if (!payload.email) {
        setError(`${translations.errorPrefix}Không thể lấy thông tin email từ Google.`);
        setSuccessMessage(null);
        return;
      }
      if (!payload.username) {
        setError(`${translations.errorPrefix}Không thể tạo tên đăng nhập từ thông tin Google.`);
        setSuccessMessage(null);
        return;
      }
      await handleSocialSignUpRequest(payload);
    } catch (err) {
      console.error("Google signup error:", err);
      let errorMessage = `${translations.errorPrefix}Lỗi đăng ký Google.`;
      if (err.code) errorMessage += ` Mã lỗi: ${err.code}`;
      if (err.message) errorMessage += ` Chi tiết: ${err.message}`;
      setError(errorMessage);
      setSuccessMessage(null);
    }
  };

  // Hàm xử lý Github Sign Up
  const handleGithubSignUp = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const payload = {
        username: user.displayName || (user.email ? user.email.split("@")[0] : user.uid),
        email: user.email,
        password: user.uid,
        avatar: user.photoURL,
      };
      if (!payload.email) {
        setError(`${translations.errorPrefix}Không thể lấy thông tin email từ Github.`);
        setSuccessMessage(null);
        return;
      }
      if (!payload.username) {
        setError(`${translations.errorPrefix}Không thể tạo tên đăng nhập từ thông tin Github.`);
        setSuccessMessage(null);
        return;
      }
      await handleSocialSignUpRequest(payload);
    } catch (err) {
      console.error("GitHub signup error:", err);
      let errorMessage = `${translations.errorPrefix}Lỗi đăng ký Github.`;
      if (err.code) errorMessage += ` Mã lỗi: ${err.code}`;
      if (err.message) errorMessage += ` Chi tiết: ${err.message}`;
      setError(errorMessage);
      setSuccessMessage(null);
    }
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-box">
          <h2 className="signup-title">{translations.signupTitle}</h2>
          <p className="signup-subtitle">{translations.signupSubtitle}</p>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="social-buttons">
            <button className="social-button google" onClick={handleGoogleSignUp} disabled={isLoading}>
              <img src={googleIcon} alt="Google" className="icon" />
              <span>{translations.googleButton}</span>
            </button>
            <button className="social-button github" onClick={handleGithubSignUp} disabled={isLoading}>
              <img src={githubIcon} alt="Github" className="icon" />
              <span>{translations.githubButton}</span>
            </button>
          </div>

          <div className="divider">{translations.divider}</div>

          <form className="signup-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder={translations.usernamePlaceholder}
              className="signup-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                e.target.setCustomValidity("");
                setError(null);
                setSuccessMessage(null);
              }}
              onBlur={(e) => {
                if (username.trim() === "") {
                  e.target.setCustomValidity(translations.invalidUsername);
                } else {
                  e.target.setCustomValidity("");
                }
              }}
              onInvalid={(e) => {
                if (username.trim() === "") {
                  e.target.setCustomValidity(translations.invalidUsername);
                } else {
                  e.target.setCustomValidity("");
                }
              }}
              required
              disabled={isLoading}
            />

            <input
              type="email"
              placeholder={translations.emailPlaceholder}
              className="signup-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                e.target.setCustomValidity("");
                setError(null);
                setSuccessMessage(null);
              }}
              onBlur={(e) => {
                if (email.trim() === "" || !email.includes('@')) {
                  e.target.setCustomValidity(translations.invalidEmail);
                } else {
                  e.target.setCustomValidity("");
                }
              }}
              onInvalid={(e) => {
                e.target.setCustomValidity(translations.invalidEmail);
              }}
              required
              disabled={isLoading}
            />

            <input
              type="password"
              placeholder={translations.passwordPlaceholder}
              className="signup-input"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                const message = validatePassword(value);
                e.target.setCustomValidity(message);
                setError(null);
                setSuccessMessage(null);
              }}
              onBlur={(e) => {
                const message = validatePassword(password);
                e.target.setCustomValidity(message);
              }}
              onInvalid={(e) => {
                const message = validatePassword(password);
                e.target.setCustomValidity(message);
              }}
              required
              disabled={isLoading}
            />

            <button type="submit" className="signUp-button" disabled={isLoading}>
              {isLoading ? translations.processing : translations.signupButton}
            </button>
          </form>

          <p className="login-link">
            {decodeHtmlEntities(translations.loginPrompt)} <Link to="/login">{decodeHtmlEntities(translations.loginLink)}</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;