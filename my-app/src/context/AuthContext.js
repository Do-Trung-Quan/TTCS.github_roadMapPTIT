import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

// Tên cookie bạn dùng để lưu access token
const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

// Tạo Context
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Đảm bảo useAuth chỉ được gọi bên trong AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Component Provider
export const AuthProvider = ({ children }) => {
  // State để lưu trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State để lưu thông tin user (id, role). Khởi tạo là null.
  const [user, setUser] = useState(null);
  // State để kiểm tra xem AuthProvider đã sẵn sàng chưa (đã kiểm tra cookie ban đầu)
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Hàm lấy token từ cookie
  const getToken = () => {
    return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
  };

  // Hàm giải mã token và lấy thông tin user
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Giả định payload token có user_id và role
      if (decoded && decoded.user_id && decoded.role) {
        return {
          id: decoded.user_id,
          role: decoded.role,
          // Bạn có thể thêm các thông tin khác từ payload nếu có
        };
      }
      return null; // Trả về null nếu payload không có thông tin cần thiết
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null; // Trả về null nếu token không hợp lệ
    }
  };

  // Effect kiểm tra cookie và đăng nhập tự động khi Provider được mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      const userInfo = getUserFromToken(token);
      if (userInfo) {
        setIsLoggedIn(true);
        setUser(userInfo); // Lưu thông tin user vào state
      } else {
        // Nếu token có nhưng không giải mã được user, xóa token cũ
        Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setIsAuthReady(true); // Đánh dấu là đã sẵn sàng sau khi kiểm tra cookie ban đầu
  }, []); // Chạy một lần duy nhất khi component mount

  // Hàm được gọi từ component Login khi đăng nhập thành công
  // Hàm này cần nhận access token từ response đăng nhập
  const loginSuccess = (accessToken) => {
    // Lưu token vào cookie
    Cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, { expires: 7 }); // expires tính bằng ngày

    // Giải mã token để lấy thông tin user
    const userInfo = getUserFromToken(accessToken);

    if (userInfo) {
      setIsLoggedIn(true);
      setUser(userInfo); // Cập nhật state user
      console.log('Đăng nhập thành công, user state được cập nhật:', userInfo);
    } else {
       // Xử lý trường hợp token nhận được nhưng không giải mã được user info cần thiết
       console.error('Đăng nhập thành công nhưng không lấy được user info từ token.');
       setIsLoggedIn(false);
       setUser(null);
       Cookies.remove(ACCESS_TOKEN_COOKIE_NAME); // Xóa token lỗi
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE_NAME); // Xóa cookie token
    setIsLoggedIn(false); // Cập nhật trạng thái đăng nhập thành false
    setUser(null); // Xóa thông tin user
    console.log('Đã đăng xuất.');
  };

  // Giá trị sẽ được cung cấp cho các component con
  const contextValue = {
    isLoggedIn,
    user, // Cung cấp thông tin user
    getToken, // Cung cấp hàm lấy token
    isAuthReady, // Cung cấp trạng thái sẵn sàng
    loginSuccess,
    logout,
  };

  // Chỉ render children khi AuthProvider đã sẵn sàng (đã kiểm tra cookie ban đầu)
  if (!isAuthReady) {
      return <div>Loading authentication status...</div>; // Hoặc một loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};