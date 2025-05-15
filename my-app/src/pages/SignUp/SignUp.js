import React, { useState } from "react";
import "./SignUp.css";
import githubIcon from "../../assets/img/github_Icon.png";
import googleIcon from "../../assets/img/google_Icon.png";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../../components/Header/header"; // Đảm bảo component Header tồn tại

// Đảm bảo firebaseConfig, auth, googleProvider, githubProvider được cấu hình đúng
import { auth, googleProvider, githubProvider } from "../../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";


const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const [error, setError] = useState(null); // Thêm state lỗi
  const [successMessage, setSuccessMessage] = useState(null); // Thêm state thông báo thành công

  const navigate = useNavigate();

  // Hàm kiểm tra độ mạnh mật khẩu (giữ nguyên)
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= minLength;
    // TODO: Có thể thêm kiểm tra ký tự đặc biệt nếu cần
    // const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);


    if (!isLongEnough) {
      return "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!hasUpperCase) {
      return "Mật khẩu phải chứa ít nhất 1 chữ hoa.";
    }
    if (!hasNumber) {
      return "Mật khẩu phải chứa ít nhất 1 số.";
    }
     // TODO: Thêm kiểm tra ký tự đặc biệt nếu có
     // if (!hasSpecialChar) { return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt."; }

    return ""; // Mật khẩu hợp lệ theo tiêu chí frontend
  };

  // Hàm xử lý response API chung cho đăng ký
   const handleApiResponse = async (response) => {
     const data = await response.json();

     if (response.ok) {
       console.log("Đăng ký thành công:", data);
        // API đăng ký thường không trả về token, chỉ thông báo thành công
       setSuccessMessage("Đăng ký thành công! Vui lòng đăng nhập.");
       setError(null);
        // Điều hướng đến trang đăng nhập sau khi đăng ký thành công
       setTimeout(() => navigate("/login"), 1500); // Điều hướng sau 1.5s

     } else {
       // Xử lý lỗi từ backend (ví dụ: email/username đã tồn tại)
       const errorMessage = data.detail || data.message || data.error || JSON.stringify(data);
        // Các lỗi validation từ serializer có thể nằm trực tiếp trong 'data'
        let validationErrors = "";
        if (data && typeof data === 'object') {
            for (const field in data) {
                if (Array.isArray(data[field])) {
                    validationErrors += `${field}: ${data[field].join(", ")}\n`;
                } else if (typeof data[field] === 'string') {
                     validationErrors += data[field] + "\n"; // Xử lý các trường hợp lỗi chung không theo format mảng
                }
            }
        }

       setError("Lỗi đăng ký: " + (validationErrors || errorMessage));
       console.error("Lỗi đăng ký API response:", data);
       setSuccessMessage(null);
     }
   };


// Hàm xử lý Đăng ký bằng Form (Username, Email, Password)
const handleStandardSignUp = async (payload) => {
  setIsLoading(true);
  setError(null);
  setSuccessMessage(null);
  try {
    const response = await fetch("http://localhost:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // Payload: {username, email, password}
    });

    await handleApiResponse(response); // Sử dụng hàm xử lý response chung

  } catch (err) {
    console.error("Lỗi kết nối server (Standard SignUp):", err);
    setError("Lỗi kết nối tới server.");
    setSuccessMessage(null);
  } finally {
    setIsLoading(false);
  }
};

// Hàm xử lý Đăng ký bằng Social (Google/Github)
// Payload cho social register API (có thể bao gồm username, email, password, avatar)
const handleSocialSignUpRequest = async (payload) => {
     setIsLoading(true);
     setError(null);
     setSuccessMessage(null);
    try {
       // API social register nhận payload đầy đủ user info
      const response = await fetch("http://localhost:8000/api/social-register/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), // Payload: {username, email, password, avatar}
      });

      await handleApiResponse(response); // Sử dụng hàm xử lý response chung

    } catch (err) {
      console.error("Lỗi kết nối server (Social SignUp):", err);
      setError("Lỗi kết nối tới server.");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
};


// Hàm xử lý submit Form Đăng ký
const handleFormSubmit = async (e) => {
  e.preventDefault();

   // Client-side validation cơ bản
   if (!username || !email || !password) {
       setError("Vui lòng điền đầy đủ thông tin.");
        setSuccessMessage(null);
       return;
   }
    const passwordError = validatePassword(password);
    if (passwordError) {
        setError(passwordError);
         setSuccessMessage(null);
        return;
    }
    // TODO: Thêm validate format email nếu không dùng required/type="email" của HTML5 form validation

  const payload = { username, email, password };
  await handleStandardSignUp(payload); // Gọi hàm xử lý standard signup
};

// Hàm xử lý click nút Google Sign Up (sử dụng Firebase)
const handleGoogleSignUp = async () => {
   setError(null);
   setSuccessMessage(null);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user; // User object từ Firebase

    // Tạo payload cho social register API
    const payload = {
      // Lấy username từ display name hoặc phần đầu email, hoặc UID
      username: user.displayName || (user.email ? user.email.split("@")[0] : user.uid),
      email: user.email, // Email từ Firebase
      password: user.uid, // Sử dụng UID làm mật khẩu tạm (API backend có thể bỏ qua nếu dùng social auth)
      avatar: user.photoURL, // Avatar URL từ Firebase
    };

    // Kiểm tra email có tồn tại không (Firebase có thể không cung cấp email với một số provider)
    if (!payload.email) {
         setError("Không thể lấy thông tin email từ Google.");
          setSuccessMessage(null);
         return;
    }
     // Kiểm tra username có hợp lệ không (có thể cần validate thêm)
     if (!payload.username) {
         setError("Không thể tạo tên đăng nhập từ thông tin Google.");
          setSuccessMessage(null);
         return;
     }


    await handleSocialSignUpRequest(payload); // Gọi hàm xử lý social signup API

  } catch (err) {
    console.error("Google signup error:", err);
     // Xử lý lỗi Firebase popup
    let errorMessage = "Lỗi đăng ký Google.";
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

// Hàm xử lý click nút Github Sign Up (sử dụng Firebase)
const handleGithubSignUp = async () => {
   setError(null);
   setSuccessMessage(null);
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user; // User object từ Firebase

     // Tạo payload cho social register API
    const payload = {
      // Lấy username từ display name hoặc phần đầu email, hoặc UID
      username: user.displayName || (user.email ? user.email.split("@")[0] : user.uid),
      email: user.email, // Email từ Firebase
      password: user.uid, // Sử dụng UID làm mật khẩu tạm
      avatar: user.photoURL, // Avatar URL từ Firebase
    };

     // Kiểm tra email có tồn tại không
     if (!payload.email) {
          setError("Không thể lấy thông tin email từ Github.");
           setSuccessMessage(null);
         return;
     }
      // Kiểm tra username có hợp lệ không
     if (!payload.username) {
          setError("Không thể tạo tên đăng nhập từ thông tin Github.");
           setSuccessMessage(null);
         return;
     }


    await handleSocialSignUpRequest(payload); // Gọi hàm xử lý social signup API

  } catch (err) {
    console.error("GitHub signup error:", err);
     // Xử lý lỗi Firebase popup
    let errorMessage = "Lỗi đăng ký Github.";
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


  return (
    <>
      {/* Đảm bảo component Header tồn tại */}
      <Header />
      <div className="signup-container">
        <div className="signup-box">
          <h2 className="signup-title">Đăng ký</h2>
          <p className="signup-subtitle">
            Tạo tài khoản để theo dõi tiến trình học tập, học hỏi các kỹ năng chuyên môn và trở thành một phần của cộng đồng lập trình.
          </p>

           {/* Hiển thị thông báo lỗi hoặc thành công */}
           {error && <div className="error-message">{error}</div>}
           {successMessage && <div className="success-message">{successMessage}</div>}


          <div className="social-buttons">
             {/* Thêm disabled khi đang loading */}
            <button className="social-button google" onClick={handleGoogleSignUp} disabled={isLoading}>
              <img src={googleIcon} alt="Google" className="icon" />
              <span>Kết nối bằng Google</span>
            </button>
             {/* Thêm disabled khi đang loading */}
            <button className="social-button github" onClick={handleGithubSignUp} disabled={isLoading}>
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
                e.target.setCustomValidity(""); // Reset lỗi validation HTML5
                 setError(null); // Reset lỗi tùy chỉnh
                 setSuccessMessage(null);
              }}
               onBlur={(e) => { // Thêm validation khi rời khỏi input
                    if (username.trim() === "") {
                        e.target.setCustomValidity("Vui lòng nhập tên đăng nhập.");
                    } else {
                         e.target.setCustomValidity("");
                    }
               }}
              onInvalid={(e) => {
                if (username.trim() === "") {
                  e.target.setCustomValidity("Vui lòng nhập tên đăng nhập.");
                } else {
                    e.target.setCustomValidity(""); // Đảm bảo reset nếu đã hợp lệ
                }
              }}
              required
              disabled={isLoading} // Thêm disabled khi đang loading
            />

            <input
              type="email"
              placeholder="Email"
              className="signup-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                e.target.setCustomValidity(""); // Reset lỗi validation HTML5
                 setError(null); // Reset lỗi tùy chỉnh
                 setSuccessMessage(null);
              }}
              onBlur={(e) => { // Thêm validation khi rời khỏi input
                   // Kiểm tra định dạng email cơ bản nếu cần
                    if (email.trim() === "" || !email.includes('@')) {
                        e.target.setCustomValidity("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
                    } else {
                         e.target.setCustomValidity("");
                    }
              }}
              onInvalid={(e) => {
                 e.target.setCustomValidity("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
              }}
              required
               disabled={isLoading} // Thêm disabled khi đang loading
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
                e.target.setCustomValidity(message); // Cập nhật lỗi validation HTML5
                 setError(null); // Reset lỗi tùy chỉnh
                 setSuccessMessage(null);

                 // Có thể hiển thị message lỗi validation mật khẩu ở đây nếu không dùng HTML5 form validation
                 // const validationMessage = validatePassword(value);
                 // setPasswordError(validationMessage);
              }}
              onBlur={(e) => { // Thêm validation khi rời khỏi input
                   const message = validatePassword(password);
                   e.target.setCustomValidity(message);
              }}
              onInvalid={(e) => {
                const message = validatePassword(password);
                e.target.setCustomValidity(message);
              }}
              required
               disabled={isLoading} // Thêm disabled khi đang loading
            />

            <button type="submit" className="signUp-button" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'} {/* Text động khi loading */}
            </button>
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