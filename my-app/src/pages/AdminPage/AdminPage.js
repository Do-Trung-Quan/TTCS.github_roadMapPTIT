import React, { useState } from 'react';
// Import các component trang con
import ProfilePage from './ProfilePage';
import RoadmapsPage from './RoadmapsPage';
import SettingsPage from './SettingsPage';
import UserManagementPage from './UserManagementPage';
import EditRoadmapPage from './EditRoadmapPage'; // <-- Đảm bảo import EditRoadmapPage

// Import Sidebar component (Nếu bạn có component Sidebar thật)
// import Sidebar from './Sidebar';
import './AdminPage.css'; // File CSS cho layout AdminPage

// --- Import thư viện js-cookie để xử lý logout ---
import Cookies from 'js-cookie';
// --- Hết Import thư viện js-cookie ---


function AdminPage() {
    // State để quản lý trang con nào đang hiển thị
    const [currentAdminView, setCurrentAdminView] = useState('roadmaps-list'); // Mặc định là trang Roadmaps

    // State để lưu ID của roadmap đang được chỉnh sửa
    const [editingRoadmapId, setEditingRoadmapId] = useState(null);

    // State để lưu thông tin user admin (username, avatar) nếu cần hiển thị ở Sidebar
    // Tùy chọn: Lấy từ cookie hoặc context sau khi đăng nhập
    const [adminUserInfo, setAdminUserInfo] = useState({
        username: Cookies.get('user_username') || 'Admin User',
        avatar: Cookies.get('user_avatar') || '/default-admin-avatar.png', // Giả định lưu avatar trong cookie
         userId: Cookies.get('user_id') || null, // Giả định lưu userId trong cookie
    });


    // Hàm xử lý khi một mục trên Sidebar được click
    const handleSidebarMenuItemClick = (viewName) => {
        setCurrentAdminView(viewName);
        if (viewName !== 'edit-roadmap') {
            setEditingRoadmapId(null);
        }
        console.log("AdminPage: Navigating to view:", viewName);
    };

    // Hàm xử lý khi nút "Edit" trên RoadmapListItem được click
    const handleEditRoadmapClick = (roadmapId) => {
        setEditingRoadmapId(roadmapId);
        setCurrentAdminView('edit-roadmap');
        console.log("AdminPage: Editing roadmap with ID:", roadmapId);
    };

     // Hàm xử lý khi lưu thay đổi trong EditRoadmapPage (Placeholder)
    const handleSaveChangesRoadmap = (roadmapId, updatedData, updatedTopics) => {
        console.log("AdminPage: Received data to save:", roadmapId, updatedData, updatedTopics);
        alert(`AdminPage: Saving changes for roadmap ${roadmapId} (Static mode - no API call)`);
    };

     // Hàm xử lý khi topic được cập nhật (Placeholder)
     const handleTopicUpdated = () => {
         console.log("AdminPage: A topic was updated in EditRoadmapPage. Need to potentially refresh.");
     };

     // Hàm xử lý khi resource được lưu (Placeholder)
     const handleSaveResource = (resourceData) => {
          console.log("AdminPage: Received resource data to save:", resourceData);
          alert(`AdminPage: Saving resource ${resourceData.id || 'new'} (Static mode - no API call)`);
     };

     // Hàm xử lý khi resource bị xóa (Placeholder)
     const handleDeleteResource = (resourceId) => {
         console.log("AdminPage: Received resource ID to delete:", resourceId);
         alert(`AdminPage: Deleting resource ${resourceId} (Static mode - no API call)`);
     };

      // Hàm xử lý khi exercise được lưu (Placeholder)
     const handleSaveExercise = (exerciseData) => {
          console.log("AdminPage: Received exercise data to save:", exerciseData);
           alert(`AdminPage: Saving exercise ${exerciseData.id || 'new'} (Static mode - no API call)`);
     };

      // Hàm xử lý khi exercise bị xóa (Placeholder)
     const handleDeleteExercise = (exerciseId) => {
         console.log("AdminPage: Received exercise ID to delete:", exerciseId);
         alert(`AdminPage: Deleting exercise ${exerciseId} (Static mode - no API call)`);
     };

    // --- Hàm xử lý Logout ---
    const handleLogout = () => {
        console.log("Admin Logout initiated.");
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

     // Hàm cập nhật thông tin user admin sau khi ProfilePage lưu thành công (tùy chọn)
     const handleAdminProfileUpdated = (updatedUserData) => {
         setAdminUserInfo(prev => ({
             ...prev,
             username: updatedUserData.username,
             avatar: updatedUserData.avatar,
         }));
         // Cập nhật cookie user info nếu cần
         Cookies.set('user_username', updatedUserData.username, { expires: 7, secure: true, sameSite: 'Strict' });
         Cookies.set('user_avatar', updatedUserData.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
         console.log("Admin user info updated:", updatedUserData);
     };


    // Hàm render nội dung chính dựa trên trạng thái
    const renderPageContent = () => {
         // Lấy token và userId từ cookie để truyền xuống các trang con nếu cần
         const authToken = Cookies.get('access_token');
         const currentUserId = Cookies.get('user_id'); // Lấy ID user đăng nhập để truyền cho ProfilePage


        switch (currentAdminView) {
            case 'profile':
                 // Truyền userId và authToken cho ProfilePage
                return <ProfilePage userId={currentUserId} authToken={authToken} onProfileUpdated={handleAdminProfileUpdated} />; // Trang Profile cho Admin user
            case 'roadmaps-list':
                 // RoadmapsPage có thể cần authToken để fetch danh sách
                return <RoadmapsPage onEditRoadmap={handleEditRoadmapClick} authToken={authToken} />; // TODO: Có thể truyền handler xóa roadmap nếu cần
            case 'edit-roadmap':
                 if (editingRoadmapId) {
                    // EditRoadmapPage cần roadmapId và authToken để fetch chi tiết
                    return (
                         <EditRoadmapPage
                            roadmapId={editingRoadmapId}
                            authToken={authToken} // Truyền authToken
                            onSave={handleSaveChangesRoadmap}
                            onTopicAdded={handleTopicUpdated}
                            onSaveResource={handleSaveResource}
                            onDeleteResource={handleDeleteResource}
                            onSaveExercise={handleSaveExercise}
                            onDeleteExercise={handleDeleteExercise}
                            onCancelEdit={() => handleSidebarMenuItemClick('roadmaps-list')}
                         />
                    );
                 } else {
                     return <div>Error: No roadmap selected for editing.</div>;
                 }
            case 'settings':
                 // SettingsPage có thể cần authToken/userId
                return <SettingsPage userId={currentUserId} authToken={authToken} />; // Trang Settings cho Admin user
            case 'users':
                 // UserManagementPage chắc chắn cần authToken và có thể cần logic admin
                return <UserManagementPage authToken={authToken} />; // Quản lý User
            default:
                return <div>Admin Page Not Found or Select an option from Sidebar</div>;
        }
    };

    return (
        <div className="admin-page-container">
            {/* Sidebar mẫu */}
             <div className="sidebar-mock">
                 {/* Hiển thị tên và avatar user admin từ state/cookie */}
                  <div className="team-selector-mock">
                     {/* <img src={adminUserInfo.avatar} alt="Admin Avatar" style={{width:'30px', height:'30px', borderRadius:'50%', marginRight:'10px'}}/> */}
                     {adminUserInfo.username}
                 </div>
                 {/* Các mục Sidebar cho Admin */}
                 <a href="#" className={`menu-item-mock ${currentAdminView === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('profile'); }}>Profile</a>
                 <a href="#" className={`menu-item-mock ${currentAdminView === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('settings'); }}>Settings</a>
                 <a href="#" className={`menu-item-mock ${currentAdminView === 'roadmaps-list' || currentAdminView === 'edit-roadmap' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('roadmaps-list'); }}>Roadmaps Management</a>
                 <a href="#" className={`menu-item-mock ${currentAdminView === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('users'); }}>User Management</a>


                 {/* Nút Back/Cancel Edit Roadmap (tùy chọn hiển thị) */}
                 {currentAdminView === 'edit-roadmap' && (
                      <a href="#" className="menu-item-mock back-link" onClick={(e) => { e.preventDefault(); handleSidebarMenuItemClick('roadmaps-list'); }}>&lt; Back to Roadmaps List</a>
                 )}

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

export default AdminPage;