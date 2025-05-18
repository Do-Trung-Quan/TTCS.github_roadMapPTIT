import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

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
  // State để kiểm tra xem AuthProvider đã sẵn sàng chưa (đã kiểm tra cookie ban đầu)
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Effect kiểm tra cookie khi Provider được mount
  useEffect(() => {
    const token = Cookies.get('access_token'); // Sử dụng tên cookie token của bạn
    setIsLoggedIn(!!token); // Cập nhật trạng thái dựa trên sự tồn tại của token
    setIsAuthReady(true); // Đánh dấu là đã sẵn sàng
  }, []); // Chạy một lần duy nhất khi component mount

  // Hàm được gọi từ component Login khi đăng nhập thành công
  const loginSuccess = (token) => {
    // Cookies.set('access_token', token, { expires: 7 }); // Đặt cookie nếu chưa có
    setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập thành true
    // Có thể lưu token vào state ở đây nếu cần truy cập token từ context
  };

  // Hàm đăng xuất (tùy chọn)
  const logout = () => {
    Cookies.remove('access_token'); // Xóa cookie token
    setIsLoggedIn(false); // Cập nhật trạng thái đăng nhập thành false
    // Có thể xóa token khỏi state ở đây
  };

  // Giá trị sẽ được cung cấp cho các component con
  const contextValue = {
    isLoggedIn,
    isAuthReady, // Cung cấp trạng thái sẵn sàng để tránh render UI không chính xác
    loginSuccess,
    logout, // Cung cấp hàm logout nếu cần
  };

  // Chỉ render children khi AuthProvider đã sẵn sàng (đã kiểm tra cookie ban đầu)
  // Điều này giúp tránh hiển thị UI không chính xác trong lần render đầu tiên
  // khi trạng thái isLoggedIn chưa được xác định từ cookie.
  if (!isAuthReady) {
      return <div>Loading authentication status...</div>; // Hoặc một loading spinner
  }


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
