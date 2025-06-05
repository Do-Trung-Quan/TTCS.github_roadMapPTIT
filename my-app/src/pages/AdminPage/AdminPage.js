import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Sidebar/Sidebar";
import './AdminPage.css';
import Cookies from 'js-cookie';

function AdminPage({ currentLang }) {
  const navigate = useNavigate();
  const location = useLocation();

  const token = Cookies.get('access_token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userId = payload ? payload.user_id : null;

  const [userData, setUserData] = useState({
    username: payload?.username || 'Người dùng',
    role: payload?.role || null,
    avatar: payload?.avatar || null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    console.log("AdminPage fetch: Token:", token ? "Đã tồn tại" : "Thiếu", "UserId:", userId ? "Đã tồn tại" : "Thiếu");

    if (!token || !userId) {
      console.log("AdminPage fetch: Thiếu Token hoặc UserId, chuyển hướng về trang ch.");
      setError("Thiếu thông tin xác thực.");
      navigate('/');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("AdminPage fetch: Trạng thái phản hồi API:", response.status);

      if (!response.ok) {
        console.error("AdminPage fetch: Lỗi khi tải dữ liệu người dùng:", response.status);
        if (response.status === 401) {
          console.log("AdminPage fetch: Nhận được 401, token có thể đã hết hạn. Đang đăng xuất.");
          handleLogout();
        }
        throw new Error(`Không thể tải dữ liệu người dùng: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("AdminPage fetch: Tải dữ liệu người dùng thành công:", data);

      setUserData({
        username: data.username || 'Người dùng',
        role: data.role || 'user',
        avatar: data.avatar || null,
      });

      Cookies.set('user_username', data.username, { expires: 7, secure: true, sameSite: 'Strict' });
      Cookies.set('user_role', data.role, { expires: 7, secure: true, sameSite: 'Strict' });
      Cookies.set('user_avatar', data.avatar || '', { expires: 7, secure: true, sameSite: 'Strict' });

      console.log("AdminPage: Thông tin người dùng quản trị được cập nhật từ fetch:", {
        username: data.username,
        avatar: data.avatar,
        role: data.role,
      });
    } catch (err) {
      console.error('AdminPage fetch: Lỗi khi tải dữ liệu người dùng:', err.message);
      setError(err.message);
      if (err.message.includes('401')) {
        handleLogout();
      } else {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, userId, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSidebarMenuItemClick = (viewName) => {
    console.log("AdminPage: Điều hướng đến:", viewName);
    navigate(`/admin/${viewName}`);
  };

  const handleLogout = () => {
    console.log("Đăng xuất quản trị viên đã bắt đầu.");
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_username');
    Cookies.remove('user_avatar');
    Cookies.remove('user_id');
    Cookies.remove('user_role');
    window.location.href = '/';
  };

  const getActivePageId = () => {
    const path = location.pathname.split('/').pop() || 'profile';
    return path === 'admin' ? 'profile' : path;
  };

  if (isLoading) {
    return <div>Đang tải dữ liệu người dùng...</div>;
  }

  if (error) {
    return <div className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div className="admin-page-container">
      <Sidebar
        userName={userData.username}
        role={userData.role}
        activePageId={getActivePageId()}
        onMenuItemClick={handleSidebarMenuItemClick}
        onLogout={handleLogout}
        currentLang={currentLang}
        avatarUrl={userData.avatar}
      />
      <div className="main-content-area">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPage;