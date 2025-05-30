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
            setError("Không tìm thấy mã thông báo xác thực hoặc ID người dùng. Vui lòng đăng nhập.");
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
                    setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
                    // Xóa cookie và chuyển hướng
                    Cookies.remove('access_token');
                    Cookies.remove('user_id');
                    Cookies.remove('user_username');
                    Cookies.remove('user_role');
                    // setTimeout(() => { window.location.href = '/login'; }, 2000);
                    return;
                }
                // Ném lỗi cho các status khác
                throw new Error(errorData.detail || `Không thể tìm nạp dữ liệu người dùng: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('SettingsPage fetch: Đã tìm nạp thành công dữ liệu người dùng:', data); // Log dữ liệu user nhận được

            // Cập nhật state email hiện tại
            // Dữ liệu user detail trả về trực tiếp object user (không bọc trong data.data)
            setCurrentUserEmail(data.email || '');
            // XÓA DÒNG CẬP NHẬT hasPasswordSet - không cần nữa
            // setHasPasswordSet(Boolean(data.has_password_set));

        } catch (err) {
            console.error('SettingsPage fetch: Lỗi khi tìm nạp dữ liệu người dùng:', err); // Log lỗi fetch
            setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu cài đặt.");
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
            return "Email mới là bắt buộc.";
        }
        // Regex kiểm tra định dạng email cơ bản
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            return "Định dạng email không hợp lệ.";
        }
        return null; // Trả về null nếu hợp lệ
    };

    // Hàm xử lý cập nhật Email
    const handleUpdateEmail = async () => {
        // Kiểm tra lại token/userId (đảm bảo không gọi API khi chưa sẵn sàng)
           if (!token || !id) {
            setError("Không tìm thấy mã thông báo xác thực hoặc ID người dùng. Không thể cập nhật email.");
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
            return;
        }

        // XÓA KIỂM TRA hasPasswordSet - không cần nữa
        // if (!hasPasswordSet) {
        //  setError("Please set your password first before updating email.");
        //  return;
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
        console.log('Đang cố gắng cập nhật email với dữ liệu:', payload); // Log payload gửi đi

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

               console.log('SettingsPage update email: Trạng thái phản hồi API:', response.status); // Log status

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                   console.error('SettingsPage update email: Phản hồi API không OK:', response.status, errorData); // Log lỗi API
                   // Xử lý lỗi 401 Unauthorized
                   if (response.status === 401) {
                    setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
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
                    : errorData.message || errorData.detail || `Không thể cập nhật email: ${response.statusText}`;
                throw new Error(errorDetails);
            }

            // Xử lý response thành công
            const updatedData = await response.json();
            console.log('SettingsPage update email: Đã cập nhật email thành công. Dữ liệu phản hồi:', updatedData); // Log response data
            // Cập nhật email hiển thị hiện tại
            // Dữ liệu user update trả về user object bọc trong data.data
            setCurrentUserEmail(updatedData.data.email);
            setNewEmail(''); // Xóa nội dung input email mới

            // Hiển thị thông báo thành công
            setSuccessMessage(updatedData.message || "Email đã được cập nhật thành công.");
            // Gọi callback nếu có để thông báo cho component cha (ví dụ AdminPage/UserPage)
            if (onSettingsUpdated) {
                   // Truyền thông tin user đã cập nhật (có thể bao gồm email, username nếu backend trả về)
                onSettingsUpdated(updatedData.data); // Truyền data.data object
            }
               // Tự động ẩn thông báo thành công sau vài giây
            setTimeout(() => setSuccessMessage(null), 5000);


        } catch (err) {
            console.error('SettingsPage update email: Lỗi khi cập nhật email:', err); // Log lỗi fetch/xử lý response
            setError(err.message || "Đã xảy ra lỗi không mong muốn khi cập nhật email."); // Hiển thị lỗi
            // Tự động ẩn thông báo lỗi sau vài giây
            setTimeout(() => setError(null), 10000);
        } finally {
            setIsLoading(false); // Tắt loading
        }
    };

    // Hàm validate mật khẩu mới
    const validatePassword = () => {
        if (!newPassword) {
            return "Mật khẩu mới là bắt buộc.";
        }
        if (newPassword.length < 8) { // Kiểm tra độ dài
            return "Mật khẩu phải dài ít nhất 8 ký tự.";
        }
        // Thêm các kiểm tra khác nếu cần (chữ hoa, số, ký tự đặc biệt) dựa trên validate backend
           if (!/[A-Z]/.test(newPassword)) {
               return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa.";
           }
           if (!/[0-9]/.test(newPassword)) {
               return "Mật khẩu phải chứa ít nhất một chữ số.";
           }
        if (newPassword !== confirmPassword) { // Kiểm tra khớp mật khẩu xác nhận
            return "Mật khẩu không khớp.";
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
            setError("Không tìm thấy mã thông báo xác thực hoặc ID người dùng. Không thể cập nhật mật khẩu.");
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
        console.log('Đang cố gắng cập nhật mật khẩu.'); // Log hành động

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

               console.log('SettingsPage update password: Trạng thái phản hồi API:', response.status); // Log status

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('SettingsPage update password: Phản hồi API không OK:', response.status, errorData); // Log lỗi API
                   // Xử lý lỗi 401 Unauthorized
                   if (response.status === 401) {
                    setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
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
                       : errorData.message || errorData.detail || `Không thể cập nhật mật khẩu: ${response.statusText}`;
                throw new Error(errorDetails);
            }

            // Xử lý response thành công (không cần đọc body nếu backend trả về 204 No Content)
            // Nếu backend trả về JSON, có thể đọc:
               const data = await response.json(); // Đọc response data nếu có

            // Hiển thị thông báo thành công
            setSuccessMessage(data.message || "Mật khẩu đã được cập nhật thành công.");
            // Reset các trường input mật khẩu
            setNewPassword('');
            setConfirmPassword('');

            // XÓA DÒNG CẬP NHẬT hasPasswordSet - không cần nữa
            // setHasPasswordSet(true);
            // console.log('Password updated successfully. hasPasswordSet set to true.'); // Log


               // Tự động ẩn thông báo thành công sau vài giây
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err) {
            console.error('SettingsPage update password: Lỗi khi cập nhật mật khẩu:', err); // Log lỗi fetch/xử lý response
            setError(err.message || "Đã xảy ra lỗi không mong muốn khi cập nhật mật khẩu."); // Hiển thị lỗi
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
                {isLoading && <p style={{ textAlign: 'center', color: '#007bff' }}>Đang tải...</p>} {/* Thêm màu cho loading */}

                {/* Phần cài đặt mật khẩu */}
                <div className="settings-section">
                    <h2>Mật khẩu</h2>
                    <p className="settings-description">Sử dụng biểu mẫu dưới đây để cập nhật mật khẩu của bạn.</p>

                    <div className="password-fields">
                        <div className="field-group">
                            <label htmlFor="new-password">Mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-control us password-input"
                                id="new-password"
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading} // Disable khi đang loading
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-control us password-input"
                                id="confirm-password"
                                placeholder="Xác nhận mật khẩu mới"
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
                            Cập nhật mật khẩu
                        </button>
                    </div>
                </div>

                <hr className="settings-divider" />

                {/* Phần cập nhật Email - LUÔN HIỂN THỊ VÀ KHẢ DỤNG */}
                <div className="settings-section">
                    <h2>Cập nhật Email</h2>
                    {/* Mô tả đơn giản */}
                    <p className="settings-description">
                        Sử dụng biểu mẫu dưới đây để cập nhật địa chỉ email của bạn.
                    </p>

                    <div className="email-fields">
                        {/* Hiển thị email hiện tại */}
                        <div className="field-group">
                            <label>Email hiện tại</label>
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
                                <label htmlFor="new-email">Email mới</label>
                                <input
                                    type="email"
                                    className="form-control us"
                                    id="new-email"
                                    placeholder="Nhập email mới"
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
                                Cập nhật Email
                            </button>
                        </>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;