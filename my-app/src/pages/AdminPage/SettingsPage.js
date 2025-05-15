import React, { useState } from 'react'; // Cần useState để quản lý form input
import './SettingsPage.css'; // Import file CSS tương ứng

// Component hiển thị nội dung trang Settings
function SettingsPage() {
  // State cho các trường form mật khẩu
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State cho email hiện tại (có thể lấy từ props hoặc fetch)
  const currentUserEmail = "quantrungdo198@gmail.com"; // Placeholder email

  // State để kiểm tra nếu cần hiển thị cảnh báo email (dựa trên logic app)
  // Giả định cần hiển thị cảnh báo nếu email dùng Google và chưa set pass
  const needsPasswordSetForEmailUpdate = true; // Placeholder logic

  // Hàm xử lý click nút "Update Password"
  const handleUpdatePassword = () => {
    console.log("Updating password:", { newPassword, confirmPassword });
    // TODO: Thêm validation (mật khẩu không trống, khớp nhau, độ mạnh...)
    // TODO: Gửi request cập nhật mật khẩu đến backend API
    alert("Password update logic goes here."); // Placeholder thông báo
    // Reset form sau khi xử lý
    setNewPassword('');
    setConfirmPassword('');
  };

  // Hàm xử lý click nút "Delete My Account"
  const handleDeleteAccount = () => {
    console.log("Deleting account");
    // TODO: Thêm xác nhận từ người dùng (modal/confirm dialog)
    // TODO: Gửi request xóa tài khoản đến backend API
    alert("Delete account logic goes here."); // Placeholder thông báo
  };

  return (
    // Giữ lại class và ID
    <div className="page-content" id="settings"> {/* Sử dụng className */}
      <div className="settings-container"> {/* Sử dụng className */}

        {/* Phần cài đặt mật khẩu */}
        <div className="settings-section"> {/* Sử dụng className */}
          <h2>Password</h2>
          <p className="settings-description">Use the form below to update your password.</p> {/* Sử dụng className */}

          <div className="password-fields"> {/* Sử dụng className */}
            <div className="field-group"> {/* Sử dụng className */}
              <label htmlFor="new-password">New Password</label> {/* Sử dụng htmlFor */}
              <input
                type="password"
                className="form-control us password-input" // Sử dụng className
                id="new-password"
                placeholder="New password"
                value={newPassword} // Controlled component
                onChange={(e) => setNewPassword(e.target.value)} // Cập nhật state
              />
            </div>

            <div className="field-group"> {/* Sử dụng className */}
              <label htmlFor="confirm-password">Confirm New Password</label> {/* Sử dụng htmlFor */}
              <input
                type="password"
                className="form-control us password-input" // Sử dụng className
                id="confirm-password"
                placeholder="Confirm New Password"
                value={confirmPassword} // Controlled component
                onChange={(e) => setConfirmPassword(e.target.value)} // Cập nhật state
              />
            </div>

            <button
              className="update-password-btn" // Sử dụng className
              id="update-password-btn"
              onClick={handleUpdatePassword} // Xử lý click
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Đường phân cách */}
        <hr className="settings-divider"/> {/* Sử dụng className */}

        {/* Phần cập nhật Email */}
        <div className="settings-section"> {/* Sử dụng className */}
          <h2>Update Email</h2>
          {/* Văn bản mô tả email - nội dung này có thể thay đổi tùy trạng thái user */}
          <p className="settings-description">
            {needsPasswordSetForEmailUpdate
              ? "You have used google when signing up. Please set your password first."
              : "Use the form below to update your email address." // Ví dụ nội dung khác
            }
          </p> {/* Sử dụng className */}

          <div className="email-fields"> {/* Sử dụng className */}
            <div className="field-group"> {/* Sử dụng className */}
              <label>Current Email</label> {/* Không cần htmlFor nếu không có input tương ứng */}
              <input
                type="email"
                className="form-control us" // Sử dụng className
                value={currentUserEmail} // Hiển thị email từ state/prop
                disabled // Input này là disabled theo HTML gốc
              />
            </div>

            {/* Hiển thị cảnh báo email nếu cần */}
            {needsPasswordSetForEmailUpdate && (
              <div className="email-warning"> {/* Sử dụng className */}
                Please set your password first to update your email.
              </div>
            )}

            {/* Phần hiển thị email trên profile - logic này có thể liên quan đến ProfilePage hoặc cài đặt backend */}
            {/* Nếu muốn giữ lại phần checkbox, cần thêm state và handler */}
            {/*
            <div className="email-display"> // Sử dụng className
              <input type="checkbox" id="show-email" checked={profileData.showEmail} onChange={handleInputChange} /> // Cần state và handler
              <label htmlFor="show-email">Show my email on profile</label> // Sử dụng htmlFor
            </div>
            */}
             {/* Link "Visit settings page to change email" từ Profile page có thể trỏ về đây */}
             {/* Nhưng trong SettingsPage, nó hơi thừa hoặc cần link đến nơi khác */}
             {/* Nếu muốn giữ link này: <a href="#" className="email-settings-link">Visit settings page to change email</a> */}
          </div>
        </div>

        {/* Đường phân cách */}
        <hr className="settings-divider"/> {/* Sử dụng className */}
      </div>
    </div>
  );
}

export default SettingsPage;