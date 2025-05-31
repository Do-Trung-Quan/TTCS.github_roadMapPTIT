import React, { useState, useEffect, useCallback } from 'react';
// Import các component trang con
import ProfilePage from './ProfilePage';
import RoadmapsPage from './RoadmapsPage';
import SettingsPage from './SettingsPage';
import UserManagementPage from './UserManagementPage';
import EditRoadmapPage from './EditRoadmapPage';
import ActivityPage from './ActivityPage'; // Import ActivityPage

import Sidebar from "../../components/Sidebar/Sidebar";

import './AdminPage.css';
import Cookies from 'js-cookie';

function AdminPage() {
    const [currentAdminView, setCurrentAdminView] = useState('profile');
    const [editingRoadmapId, setEditingRoadmapId] = useState(null);

    const token = Cookies.get('access_token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user_id : null;

    const [adminUserInfo, setAdminUserInfo] = useState({
        username: Cookies.get('user_username') || 'Người dùng quản trị',
        avatar: Cookies.get('user_avatar') || '/default-admin-avatar.png',
        userId: userId,
        role: Cookies.get('user_role') || 'user',
    });

    const fetchUserData = useCallback(async () => {
        console.log("AdminPage fetch: Token:", token ? "Đã tồn tại" : "Thiếu", "UserId:", userId ? "Đã tồn tại" : "Thiếu");

        if (!token || !userId) {
            console.log("AdminPage fetch: Thiếu Token hoặc UserId, không thể tải dữ liệu người dùng.");
            setAdminUserInfo({
                username: 'Người dùng không xác định',
                avatar: '/default-admin-avatar.png',
                userId: null,
                role: 'user',
            });
            return;
        }

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
                const errorData = await response.json().catch(() => ({}));
                console.error("AdminPage fetch: Lỗi khi tải dữ liệu người dùng:", response.status, errorData);
                if (response.status === 401) {
                    console.log("AdminPage fetch: Nhận được 401, token có thể đã hết hạn. Đang đăng xuất.");
                    // handleLogout(); // Uncomment để tự động logout khi token hết hạn
                }
                setAdminUserInfo({
                    username: 'Người dùng không xác định',
                    avatar: '/default-admin-admin-avatar.png',
                    userId: null,
                    role: 'user',
                });
                throw new Error(errorData.detail || `Không thể tải dữ liệu người dùng: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("AdminPage fetch: Tải dữ liệu người dùng thành công:", data);

            setAdminUserInfo({
                username: data.username || 'Người dùng quản trị',
                avatar: data.avatar || '/default-admin-avatar.png',
                userId: userId,
                role: data.role || 'user',
            });
            Cookies.set('user_username', data.username, { expires: 7, secure: true, sameSite: 'Strict' });
            Cookies.set('user_avatar', data.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
            Cookies.set('user_role', data.role, { expires: 7, secure: true, sameSite: 'Strict' });

            console.log("AdminPage: Thông tin người dùng quản trị được cập nhật từ fetch:", {
                username: data.username,
                avatar: data.avatar,
                role: data.role
            });

        } catch (err) {
            console.error('AdminPage fetch: Lỗi khi tải dữ liệu người dùng:', err.message);
            setAdminUserInfo({
                username: Cookies.get('user_username') || 'Người dùng không xác định',
                avatar: Cookies.get('user_avatar') || '/default-admin-avatar.png',
                userId: Cookies.get('user_id') || null,
                role: Cookies.get('user_role') || 'user',
            });
        }
    }, [token, userId]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleSidebarMenuItemClick = (viewName) => {
        console.log("AdminPage: Chuyển đến chế độ xem:", viewName);
        setCurrentAdminView(viewName);
        if (viewName !== 'edit-roadmap') {
            setEditingRoadmapId(null);
        }
    };

    const handleEditRoadmapClick = (roadmapId) => {
        console.log("AdminPage: Đang chỉnh sửa lộ trình với ID:", roadmapId);
        setEditingRoadmapId(roadmapId);
        setCurrentAdminView('edit-roadmap');
    };

    const handleSaveChangesRoadmap = (roadmapId, updatedData) => {
        console.log("AdminPage: Đã nhận dữ liệu để lưu lộ trình:", roadmapId, updatedData);
    };

    const handleTopicAdded = () => {
        console.log("AdminPage: Một chủ đề đã được thêm/hủy liên kết trong EditRoadmapPage. Cần làm mới các chủ đề lộ trình.");
    };

    const handleSaveResource = (resourceData) => {
        console.log("AdminPage: Đã nhận dữ liệu tài nguyên để lưu:", resourceData);
    };

    const handleDeleteResource = (resourceId) => {
        console.log("AdminPage: Đã nhận ID tài nguyên để xóa:", resourceId);
    };

    const handleSaveExercise = (exerciseData) => {
        console.log("AdminPage: Đã nhận dữ liệu bài tập để lưu:", exerciseData);
    };

    const handleDeleteExercise = (exerciseId) => {
        console.log("AdminPage: Đã nhận ID bài tập để xóa:", exerciseId);
    };

    const handleLogout = () => {
        console.log("Đăng xuất quản trị viên đã bắt đầu.");
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_username');
        Cookies.remove('user_avatar');
        Cookies.remove('user_id');
        Cookies.remove('user_role');
        window.location.href = '/login';
    };

    const handleAdminProfileUpdated = (updatedUserData, navigateToSettings = false) => {
        console.log("AdminPage: Đã nhận dữ liệu người dùng được cập nhật từ ProfilePage:", updatedUserData);
        setAdminUserInfo(prev => ({
            ...prev,
            username: updatedUserData.username || prev.username,
            avatar: updatedUserData.avatar || prev.avatar,
        }));
        Cookies.set('user_username', updatedUserData.username, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('user_avatar', updatedUserData.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
        if (navigateToSettings) {
            handleSidebarMenuItemClick('settings');
        }
    };

    const handleSettingsUpdated = (updatedUserData) => {
        console.log("AdminPage: Đã nhận dữ liệu người dùng được cập nhật từ SettingsPage:", updatedUserData);
        setAdminUserInfo(prev => ({
            ...prev,
            username: updatedUserData.username || prev.username,
            avatar: updatedUserData.avatar || prev.avatar,
        }));
        if (updatedUserData.email) {
            Cookies.set('user_email', updatedUserData.email, { expires: 7, secure: true, sameSite: 'Strict' });
        }
        if (updatedUserData.username) {
            Cookies.set('user_username', updatedUserData.username, { expires: 7, secure: true, sameSite: 'Strict' });
        }
        if (updatedUserData.avatar) {
            Cookies.set('user_avatar', updatedUserData.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
        }
    };

    const renderPageContent = () => {
        if (!token || !userId) {
            return <div>Đang tải dữ liệu người dùng hoặc xác thực thất bại...</div>;
        }

        switch (currentAdminView) {
            case 'profile':
                return <ProfilePage userId={userId} authToken={token} onProfileUpdated={handleAdminProfileUpdated} />;
            case 'settings':
                return <SettingsPage userId={userId} authToken={token} onSettingsUpdated={handleSettingsUpdated} />;
            case 'roadmaps-list':
                return <RoadmapsPage onEditRoadmap={handleEditRoadmapClick} authToken={token} />;
            case 'edit-roadmap':
                if (editingRoadmapId) {
                    return (
                        <EditRoadmapPage
                            roadmapId={editingRoadmapId}
                            authToken={token}
                            onSave={handleSaveChangesRoadmap}
                            onTopicAdded={handleTopicAdded}
                            onSaveResource={handleSaveResource}
                            onDeleteResource={handleDeleteResource}
                            onSaveExercise={handleSaveExercise}
                            onDeleteExercise={handleDeleteExercise}
                            onCancelEdit={() => handleSidebarMenuItemClick('roadmaps-list')}
                        />
                    );
                } else {
                    return <div>Lỗi: Không có lộ trình nào được chọn để chỉnh sửa.</div>;
                }
            case 'users':
                return <UserManagementPage authToken={token} />;
            case 'activity':
                if (adminUserInfo.role === 'user') {
                    return <ActivityPage />;
                }
                return <div>Truy cập bị từ chối: Hoạt động chỉ dành cho Người dùng.</div>;
            default:
                return <div>Trang quản trị: Vui lòng chọn một tùy chọn từ thanh bên.</div>;
        }
    };

    return (
        <div className="admin-page-container">
            <Sidebar
                userName={adminUserInfo.username}
                role={adminUserInfo.role}
                activePageId={currentAdminView}
                onMenuItemClick={handleSidebarMenuItemClick}
                onLogout={handleLogout}
            />
            <div className="main-content-area">
                {renderPageContent()}
            </div>
        </div>
    );
}

export default AdminPage;