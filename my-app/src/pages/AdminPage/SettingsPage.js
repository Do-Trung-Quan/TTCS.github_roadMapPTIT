import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import './SettingsPage.css'; // Đảm bảo file CSS này tồn tại

function SettingsPage({ userId, authToken, onSettingsUpdated }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    // XÓA STATE hasPasswordSet - không cần nữa

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // XÓA BIẾN needsPasswordSetForEmailUpdate - không cần nữa
    // const needsPasswordSetForEmailUpdate = true; // XÓA DÒNG NÀY


    // Sử dụng authToken và userId từ props (được truyền từ AdminPage/UserPage)
    const token = authToken;
    const id = userId;

    // Hàm fetch dữ liệu user ban đầu (chỉ cần email hiện tại)
    const fetchUserData = useCallback(async () => {
        if (!token || !id) {
            setError("Authentication token or user ID not found. Please login.");
            // Tùy chọn: Chuyển hướng về trang login sau vài giây
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
            return;
        }

        setIsLoading(true);
        setError(null); // Xóa lỗi cũ
        setSuccessMessage(null); // Xóa thông báo cũ

        try {
            // Fetch dữ liệu user chi tiết
            const response = await fetch(`http://localhost:8000/api/users/${id}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Kiểm tra response status
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                 console.error('SettingsPage fetch: API response not OK:', response.status, errorData); // Log lỗi API
                // Xử lý lỗi 401 Unauthorized (token hết hạn/không hợp lệ)
                if (response.status === 401) {
                    setError("Session expired. Please login again.");
                    // Xóa cookie và chuyển hướng
                    Cookies.remove('access_token');
                    Cookies.remove('user_id');
                    Cookies.remove('user_username');
                    Cookies.remove('user_role');
                    // setTimeout(() => { window.location.href = '/login'; }, 2000);
                    return;
                }
                // Ném lỗi cho các status khác
                throw new Error(errorData.detail || `Failed to fetch user data: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('SettingsPage fetch: Successfully fetched user data:', data); // Log dữ liệu user nhận được

            // Cập nhật state email hiện tại
            // Dữ liệu user detail trả về trực tiếp object user (không bọc trong data.data)
            setCurrentUserEmail(data.email || '');
            // XÓA DÒNG CẬP NHẬT hasPasswordSet - không cần nữa
            // setHasPasswordSet(Boolean(data.has_password_set));

        } catch (err) {
            console.error('SettingsPage fetch: Error fetching user data:', err); // Log lỗi fetch
            setError(err.message || "An error occurred while loading settings data.");
            // Reset các trường nếu fetch lỗi
            setCurrentUserEmail('');
            // setHasPasswordSet(false); // XÓA DÒNG NÀY
        } finally {
            setIsLoading(false); // Tắt loading
        }
    }, [token, id]); // Dependencies: fetch lại khi token hoặc id thay đổi

    // Effect để gọi hàm fetchUserData khi component mount hoặc dependencies thay đổi
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]); // Dependency: fetchUserData (đã dùng useCallback)


    // Hàm validate định dạng email
    const validateEmail = (email) => {
        if (!email) {
            return "New email is required.";
        }
        // Regex kiểm tra định dạng email cơ bản
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            return "Invalid email format.";
        }
        return null; // Trả về null nếu hợp lệ
    };

    // Hàm xử lý cập nhật Email
    const handleUpdateEmail = async () => {
        // Kiểm tra lại token/userId (đảm bảo không gọi API khi chưa sẵn sàng)
         if (!token || !id) {
            setError("Authentication token or user ID not found. Cannot update email.");
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
            return;
        }

        // XÓA KIỂM TRA hasPasswordSet - không cần nữa
        // if (!hasPasswordSet) {
        //     setError("Please set your password first before updating email.");
        //     return;
        // }

        // Validate email mới
        const emailError = validateEmail(newEmail);
        if (emailError) {
            setError(emailError);
            return;
        }

        setError(null); // Xóa lỗi cũ
        setSuccessMessage(null); // Xóa thông báo cũ
        setIsLoading(true); // Bật loading

        // Chuẩn bị dữ liệu gửi đi (chỉ gửi trường email)
        // Backend UserUpdateView của bạn đã hỗ trợ nhận email trong request.data
        const payload = {
            email: newEmail
        };
        console.log('Attempting to update email with payload:', payload); // Log payload gửi đi

        try {
            // Gửi request PUT để cập nhật email
            const response = await fetch(`http://localhost:8000/api/users/${id}/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', // Gửi JSON
                },
                body: JSON.stringify(payload), // Chuyển payload thành JSON string
            });

             console.log('SettingsPage update email: API Response Status:', response.status); // Log status

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                 console.error('SettingsPage update email: API response not OK:', response.status, errorData); // Log lỗi API
                 // Xử lý lỗi 401 Unauthorized
                 if (response.status === 401) {
                    setError("Session expired. Please login again.");
                    Cookies.remove('access_token');
                    Cookies.remove('user_id');
                    Cookies.remove('user_username');
                    Cookies.remove('user_role');
                    // setTimeout(() => { window.location.href = '/login'; }, 2000);
                    return;
                }
                // Xử lý các lỗi validation khác từ backend (ví dụ: email đã tồn tại)
                const errorDetails = errorData.errors
                    ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
                    : errorData.message || errorData.detail || `Failed to update email: ${response.statusText}`;
                throw new Error(errorDetails);
            }

            // Xử lý response thành công
            const updatedData = await response.json();
            console.log('SettingsPage update email: Successfully updated email. Response data:', updatedData); // Log response data
            // Cập nhật email hiển thị hiện tại
            // Dữ liệu user update trả về user object bọc trong data.data
            setCurrentUserEmail(updatedData.data.email);
            setNewEmail(''); // Xóa nội dung input email mới

            // Hiển thị thông báo thành công
            setSuccessMessage(updatedData.message || "Email updated successfully.");
            // Gọi callback nếu có để thông báo cho component cha (ví dụ AdminPage/UserPage)
            if (onSettingsUpdated) {
                 // Truyền thông tin user đã cập nhật (có thể bao gồm email, username nếu backend trả về)
                onSettingsUpdated(updatedData.data); // Truyền data.data object
            }
             // Tự động ẩn thông báo thành công sau vài giây
            setTimeout(() => setSuccessMessage(null), 5000);


        } catch (err) {
            console.error('SettingsPage update email: Error updating email:', err); // Log lỗi fetch/xử lý response
            setError(err.message || "An unexpected error occurred while updating email."); // Hiển thị lỗi
            // Tự động ẩn thông báo lỗi sau vài giây
            setTimeout(() => setError(null), 10000);
        } finally {
            setIsLoading(false); // Tắt loading
        }
    };

    // Hàm validate mật khẩu mới
    const validatePassword = () => {
        if (!newPassword) {
            return "New password is required.";
        }
        if (newPassword.length < 8) { // Kiểm tra độ dài
            return "Password must be at least 8 characters long.";
        }
        // Thêm các kiểm tra khác nếu cần (chữ hoa, số, ký tự đặc biệt) dựa trên validate backend
         if (!/[A-Z]/.test(newPassword)) {
             return "Password must contain at least one uppercase letter.";
         }
         if (!/[0-9]/.test(newPassword)) {
             return "Password must contain at least one digit.";
         }
        if (newPassword !== confirmPassword) { // Kiểm tra khớp mật khẩu xác nhận
            return "Passwords do not match.";
        }
        return null; // Trả về null nếu hợp lệ
    };

    // Hàm xử lý cập nhật Mật khẩu
    const handleUpdatePassword = async () => {
        // Validate mật khẩu mới
        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            return;
        }

         // Kiểm tra lại token/userId
         if (!token || !id) {
            setError("Authentication token or user ID not found. Cannot update password.");
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
            return;
        }


        setError(null); // Xóa lỗi cũ
        setSuccessMessage(null); // Xóa thông báo cũ
        setIsLoading(true); // Bật loading

        // Chuẩn bị dữ liệu gửi đi (chỉ gửi trường password)
        const payload = {
            password: newPassword
        };
        console.log('Attempting to update password.'); // Log hành động

        try {
            // Gửi request PUT để cập nhật mật khẩu
            const response = await fetch(`http://localhost:8000/api/users/${id}/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', // Gửi JSON
                },
                body: JSON.stringify(payload), // Chuyển payload thành JSON string
            });

             console.log('SettingsPage update password: API Response Status:', response.status); // Log status

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('SettingsPage update password: API response not OK:', response.status, errorData); // Log lỗi API
                 // Xử lý lỗi 401 Unauthorized
                 if (response.status === 401) {
                    setError("Session expired. Please login again.");
                     Cookies.remove('access_token');
                    Cookies.remove('user_id');
                    Cookies.remove('user_username');
                    Cookies.remove('user_role');
                    // setTimeout(() => { window.location.href = '/login'; }, 2000);
                    return;
                }
                 // Xử lý các lỗi validation khác từ backend
                 const errorDetails = errorData.errors
                    ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
                    : errorData.message || errorData.detail || `Failed to update password: ${response.statusText}`;
                throw new Error(errorDetails);
            }

            // Xử lý response thành công (không cần đọc body nếu backend trả về 204 No Content)
            // Nếu backend trả về JSON, có thể đọc:
             const data = await response.json(); // Đọc response data nếu có

            // Hiển thị thông báo thành công
            setSuccessMessage(data.message || "Password updated successfully.");
            // Reset các trường input mật khẩu
            setNewPassword('');
            setConfirmPassword('');

            // XÓA DÒNG CẬP NHẬT hasPasswordSet - không cần nữa
            // setHasPasswordSet(true);
            // console.log('Password updated successfully. hasPasswordSet set to true.'); // Log


             // Tự động ẩn thông báo thành công sau vài giây
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err) {
            console.error('SettingsPage update password: Error updating password:', err); // Log lỗi fetch/xử lý response
            setError(err.message || "An unexpected error occurred while updating password."); // Hiển thị lỗi
            // Tự động ẩn thông báo lỗi sau vài giây
            setTimeout(() => setError(null), 10000);
        } finally {
            setIsLoading(false); // Tắt loading
        }
    };

    // --- XÓA PHẦN XÓA TÀI KHOẢN ---
    // Xóa hoàn toàn hàm handleDeleteAccount và phần render giao diện của nó


    return (
        <div className="page-content" id="settings">
            <div className="settings-container">
                {/* Hiển thị thông báo lỗi và thành công */}
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                {isLoading && <p style={{ textAlign: 'center', color: '#007bff' }}>Loading...</p>} {/* Thêm màu cho loading */}

                {/* Phần cài đặt mật khẩu */}
                <div className="settings-section">
                    <h2>Password</h2>
                    <p className="settings-description">Use the form below to update your password.</p>

                    <div className="password-fields">
                        <div className="field-group">
                            <label htmlFor="new-password">New Password</label>
                            <input
                                type="password"
                                className="form-control us password-input"
                                id="new-password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading} // Disable khi đang loading
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="confirm-password">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control us password-input"
                                id="confirm-password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading} // Disable khi đang loading
                            />
                        </div>

                        <button
                            className="update-password-btn"
                            id="update-password-btn"
                            onClick={handleUpdatePassword}
                            disabled={isLoading || !newPassword || !confirmPassword} // Disable khi loading hoặc input rỗng
                        >
                            Update Password
                        </button>
                    </div>
                </div>

                <hr className="settings-divider" />

                {/* Phần cập nhật Email - LUÔN HIỂN THỊ VÀ KHẢ DỤNG */}
                <div className="settings-section">
                    <h2>Update Email</h2>
                    {/* Mô tả đơn giản */}
                    <p className="settings-description">
                        Use the form below to update your email address.
                    </p>

                    <div className="email-fields">
                        {/* Hiển thị email hiện tại */}
                        <div className="field-group">
                            <label>Current Email</label>
                            <input
                                type="email"
                                className="form-control us"
                                value={currentUserEmail}
                                disabled // Email thường không cho sửa trực tiếp ở đây
                            />
                        </div>

                        {/* Input email mới và nút update - LUÔN HIỂN THỊ */}
                        <>
                            <div className="field-group">
                                <label htmlFor="new-email">New Email</label>
                                <input
                                    type="email"
                                    className="form-control us"
                                    id="new-email"
                                    placeholder="Enter new email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    disabled={isLoading} // Disable khi đang loading
                                />
                            </div>
                            <button
                                className="update-email-btn"
                                onClick={handleUpdateEmail}
                                disabled={isLoading || !newEmail} // Disable khi loading hoặc input rỗng
                            >
                                Update Email
                            </button>
                        </>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SettingsPage;