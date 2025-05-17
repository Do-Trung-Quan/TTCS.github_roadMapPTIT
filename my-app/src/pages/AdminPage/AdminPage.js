import React, { useState, useEffect, useCallback } from 'react';
// Import các component trang con
import ProfilePage from './ProfilePage';
import RoadmapsPage from './RoadmapsPage';
import SettingsPage from './SettingsPage';
import UserManagementPage from './UserManagementPage';
import EditRoadmapPage from './EditRoadmapPage';

// Import Header và Sidebar
import Header from "../../components/Header/header";
import Sidebar from "../../components/Sidebar/Sidebar";

import './AdminPage.css';
import Cookies from 'js-cookie';

function AdminPage() {
    const [currentAdminView, setCurrentAdminView] = useState('profile');
    const [editingRoadmapId, setEditingRoadmapId] = useState(null);

    const token = Cookies.get('access_token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user_id : null;

    const [adminUserInfo, setAdminUserInfo] = useState({
        username: Cookies.get('user_username') || 'Admin User',
        avatar: Cookies.get('user_avatar') || '/default-admin-avatar.png',
        userId: userId,
        role: Cookies.get('user_role') || 'user',
    });

    const fetchUserData = useCallback(async () => {
        console.log("AdminPage fetch: Token:", token ? "Exists" : "Missing", "UserId:", userId ? "Exists" : "Missing");

        if (!token || !userId) {
            console.log("AdminPage fetch: Token or UserId missing, cannot fetch user data.");
            setAdminUserInfo({
                username: 'Unknown User',
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

            console.log("AdminPage fetch: API Response Status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("AdminPage fetch: Failed to fetch user data:", response.status, errorData);
                if (response.status === 401) {
                    console.log("AdminPage fetch: Received 401, token likely expired. Logging out.");
                    // handleLogout(); // Uncomment để tự động logout khi token hết hạn
                }
                setAdminUserInfo({
                    username: 'Unknown User',
                    avatar: '/default-admin-avatar.png',
                    userId: null,
                    role: 'user',
                });
                throw new Error(errorData.detail || `Failed to fetch user data: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("AdminPage fetch: Successfully fetched user data:", data);

            setAdminUserInfo({
                username: data.username || 'Admin User',
                avatar: data.avatar || '/default-admin-avatar.png',
                userId: userId,
                role: data.role || 'user',
            });
            Cookies.set('user_username', data.username, { expires: 7, secure: true, sameSite: 'Strict' });
            Cookies.set('user_avatar', data.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
            Cookies.set('user_role', data.role, { expires: 7, secure: true, sameSite: 'Strict' });

            console.log("AdminPage: Admin user info updated from fetch:", {
                username: data.username,
                avatar: data.avatar,
                role: data.role
            });

        } catch (err) {
            console.error('AdminPage fetch: Error fetching user data:', err.message);
            setAdminUserInfo({
                username: Cookies.get('user_username') || 'Unknown User',
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
        console.log("AdminPage: Navigating to view:", viewName);
        setCurrentAdminView(viewName);
        if (viewName !== 'edit-roadmap') {
            setEditingRoadmapId(null);
        }
    };

    const handleEditRoadmapClick = (roadmapId) => {
        console.log("AdminPage: Editing roadmap with ID:", roadmapId);
        setEditingRoadmapId(roadmapId);
        setCurrentAdminView('edit-roadmap');
    };

    const handleSaveChangesRoadmap = (roadmapId, updatedData) => {
        console.log("AdminPage: Received data to save roadmap:", roadmapId, updatedData);
    };

    const handleTopicAdded = () => {
        console.log("AdminPage: A topic was added/unlinked in EditRoadmapPage. Need to potentially refresh roadmap topics.");
    };

    const handleSaveResource = (resourceData) => {
        console.log("AdminPage: Received resource data to save:", resourceData);
    };

    const handleDeleteResource = (resourceId) => {
        console.log("AdminPage: Received resource ID to delete:", resourceId);
    };

    const handleSaveExercise = (exerciseData) => {
        console.log("AdminPage: Received exercise data to save:", exerciseData);
    };

    const handleDeleteExercise = (exerciseId) => {
        console.log("AdminPage: Received exercise ID to delete:", exerciseId);
    };

    const handleLogout = () => {
        console.log("Admin Logout initiated.");
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_username');
        Cookies.remove('user_avatar');
        Cookies.remove('user_id');
        Cookies.remove('user_role');
        window.location.href = '/login';
    };

    const handleAdminProfileUpdated = (updatedUserData, navigateToSettings = false) => {
        console.log("AdminPage: Received updated user data from ProfilePage:", updatedUserData);
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
        console.log("AdminPage: Received updated user data from SettingsPage:", updatedUserData);
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
            return <div>Loading user data or authentication failed...</div>;
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
                    return <div>Error: No roadmap selected for editing.</div>;
                }
            case 'users':
                return <UserManagementPage authToken={token} />;
            case 'activity':
                if (adminUserInfo.role === 'user') {
                    return <div>Activity Page (Placeholder for User Role)</div>; // Placeholder cho activity
                }
                return <div>Access Denied: Activity is only for Users</div>;
            default:
                return <div>Admin Page: Select an option from Sidebar.</div>;
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