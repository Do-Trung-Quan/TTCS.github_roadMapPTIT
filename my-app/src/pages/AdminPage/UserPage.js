import React, { useState } from 'react';
// Import các component trang con dành cho User
import ActivityPage from './ActivityPage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';

// Import CSS cho layout
import './UserPage.css'; // CSS riêng cho UserPage layout

// --- Import thư viện js-cookie để xử lý logout ---
import Cookies from 'js-cookie';
// --- Hết Import thư viện js-cookie ---


function UserPage() {
    // State để quản lý trang con nào đang hiển thị
    const [currentUserView, setCurrentUserView] = useState('activity'); // Mặc định là trang Activity cho User

    // State để lưu thông tin user (username, avatar) nếu cần hiển thị ở Sidebar
     // Tùy chọn: Lấy từ cookie hoặc context sau khi đăng nhập
     const [userInfo, setUserInfo] = useState({
         username: Cookies.get('user_username') || 'User Name',
         avatar: Cookies.get('user_avatar') || '/default-user-avatar.png', // Giả định lưu avatar trong cookie
          userId: Cookies.get('user_id') || null, // Giả định lưu userId trong cookie
     });


    // Hàm xử lý khi một mục trên Sidebar được click
    const handleSidebarMenuItemClick = (viewName) => {
        setCurrentUserView(viewName);
        console.log("UserPage: Navigating to view:", viewName);
    };

     // --- Hàm xử lý Logout ---
    const handleLogout = () => {
        console.log("User Logout initiated.");
        // --- Xóa Token và User Info từ Cookie ---
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_username'); // Xóa các cookie user info
        Cookies.remove('user_email');
         Cookies.remove('user_id');
        // --- Hết Xóa Token và User Info từ Cookie ---

        alert("Logging out...");
        // TODO: Gọi API đăng xuất nếu có
        // TODO: Chuyển hướng về trang đăng nhập
        window.location.href = '/login'; // <-- Chuyển hướng về trang /login
    };
    // --- Hết Hàm xử lý Logout ---

     // Hàm cập nhật thông tin user sau khi ProfilePage lưu thành công (tùy chọn)
     const handleProfileUpdated = (updatedUserData) => {
         // Cập nhật cookie user info nếu cần
         Cookies.set('user_username', updatedUserData.username, { expires: 7, secure: true, sameSite: 'Strict' });
         Cookies.set('user_avatar', updatedUserData.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
         setUserInfo(prev => ({
             ...prev,
             username: updatedUserData.username,
             avatar: updatedUserData.avatar,
         }));
         console.log("User info updated:", updatedUserData);
     };


    // Hàm render nội dung chính dựa trên trạng thái
    const renderPageContent = () => {
         // Lấy token và userId từ cookie để truyền xuống các trang con nếu cần
         const authToken = Cookies.get('access_token');
         const currentUserId = Cookies.get('user_id'); // Lấy ID user đăng nhập để truyền cho ProfilePage


        switch (currentUserView) {
            case 'activity':
                 // ActivityPage có thể cần authToken
                return <ActivityPage authToken={authToken} />;
            case 'profile':
                 // Truyền userId và authToken cho ProfilePage
                return <ProfilePage userId={currentUserId} authToken={authToken} onProfileUpdated={handleProfileUpdated} />;
            case 'settings':
                 // SettingsPage có thể cần authToken/userId
                return <SettingsPage userId={currentUserId} authToken={authToken} />;
            default:
                return <div>User Page Not Found or Select an option from Sidebar</div>;
        }
    };

    return (
        <div className="user-page-container">
            {/* Sidebar mẫu */}
             <div className="sidebar-mock">
                 {/* Hiển thị tên và avatar user từ state/cookie */}
                 <div className="team-selector-mock">
                     {/* <img src={userInfo.avatar} alt="User Avatar" style={{width:'30px', height:'30px', borderRadius:'50%', marginRight:'10px'}}/> */}
                     {userInfo.username}
                 </div>
                 {/* Các mục Sidebar cho User */}
                 <a href="#" className={`menu-item-mock ${currentUserView === 'activity' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('activity'); }}>Activity</a>
                 <a href="#" className={`menu-item-mock ${currentUserView === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('profile'); }}>Profile</a>
                 <a href="#" className={`menu-item-mock ${currentUserView === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('settings'); }}>Settings</a>

                 {/* Nút Logout */}
                 <a href="#" className="menu-item-mock logout-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                     <i className="fa-solid fa-right-from-bracket"></i>
                     Logout
                 </a>

             </div>
            {/* Hết Sidebar mẫu */}

            {/* Khu vực hiển thị nội dung chính */}
             <div className="main-content-area">
                {renderPageContent()}
            </div>
        </div>
    );
}

export default UserPage;