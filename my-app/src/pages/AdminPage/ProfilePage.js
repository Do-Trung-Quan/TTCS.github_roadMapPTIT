import React, { useState, useEffect } from 'react'; // Giữ useEffect nếu cần cho mục đích khác, nhưng sẽ không fetch data
import './ProfilePage.css'; // Import file CSS tương ứng
// Import Font Awesome icons nếu dùng component React hoặc đảm bảo CSS global
// import { FaGlobe, FaLock, FaCaretDown, FaCamera } from 'react-icons/fa';

// Component hiển thị Profile người dùng (chế độ tĩnh/mẫu)
// Các chức năng lưu/cập nhật chỉ là giả lập (log ra console, alert)
function ProfilePage() {
    // State lưu trữ dữ liệu form để chỉnh sửa (dữ liệu mẫu)
    const [formData, setFormData] = useState({
        username: 'Sample User Name', // Dữ liệu mẫu
        email: 'sample.user@example.com', // Dữ liệu mẫu
    });
    // State cho file avatar mới được chọn (chỉ để hiển thị preview tạm thời)
    const [avatarFile, setAvatarFile] = useState(null);
     // State cho URL preview của ảnh mới (nếu chọn file)
     const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
    // State riêng cho mật khẩu mới (không lưu vào formData chung)
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State cho trạng thái hiển thị dropdown công khai
    const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);
    const [visibility, setVisibility] = useState('public'); // Dữ liệu mẫu

    // TODO: Nếu bạn có dữ liệu user mẫu phức tạp hơn hoặc cần load từ JSON file tĩnh, có thể dùng useEffect ở đây

     // Cleanup URL.createObjectURL khi component unmount hoặc file thay đổi
     useEffect(() => {
         // Khi avatarPreviewUrl thay đổi (chọn file mới hoặc null), revoke URL cũ
         return () => {
             if (avatarPreviewUrl) {
                 URL.revokeObjectURL(avatarPreviewUrl);
             }
         };
     }, [avatarPreviewUrl]); // Chạy cleanup khi avatarPreviewUrl thay đổi


    // Hàm xử lý thay đổi input form (username, email)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Hàm xử lý thay đổi input mật khẩu mới
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newPassword') {
            setNewPassword(value);
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
    };

     // Hàm xử lý chọn file avatar mới và tạo preview URL
    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            // Tạo URL tạm thời cho ảnh preview
            const previewUrl = URL.createObjectURL(file);
             // Thu hồi URL cũ trước khi tạo URL mới
             if (avatarPreviewUrl) {
                 URL.revokeObjectURL(avatarPreviewUrl);
             }
            setAvatarPreviewUrl(previewUrl); // Lưu URL preview
        } else {
            setAvatarFile(null);
            // Xóa ảnh preview nếu không chọn file
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            setAvatarPreviewUrl(null);
        }
    };


    // Hàm xử lý click nút "Save Profile" (Giả lập)
    const handleSaveChangesProfile = (event) => {
        event.preventDefault();
        console.log("Static Save Profile Clicked:", formData, "New Avatar File:", avatarFile);
        alert("Save Profile functionality is a placeholder in this static version.");
        // TODO: Trong ứng dụng thật, gọi API cập nhật profile
    };


    // Hàm xử lý click nút "Update Password" (Giả lập)
     const handleUpdatePassword = (event) => {
        event.preventDefault();
         console.log("Static Update Password Clicked:", { newPassword, confirmPassword });

         // Client-side validation đơn giản
         if (!newPassword || !confirmPassword) {
             alert("Please enter new password and confirm password.");
             return;
         }
         if (newPassword !== confirmPassword) {
             alert("New password and confirm password do not match.");
             return;
         }
        alert("Update Password functionality is a placeholder in this static version.");
        // TODO: Trong ứng dụng thật, gọi API cập nhật password
         setNewPassword(''); // Xóa mật khẩu đã nhập sau khi giả lập
         setConfirmPassword('');
    };


    // Hàm xử lý dropdown hiển thị công khai
    const toggleVisibilityDropdown = () => {
        setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen);
    };

    const handleVisibilitySelect = (value) => {
        setVisibility(value);
        setIsVisibilityDropdownOpen(false);
        console.log("Static Visibility changed to:", value);
    };


    return (
        <div className="page-content profile-page-container"> {/* Sử dụng className cho container chính */}
            {/* Không có hiển thị lỗi/thành công từ API ở đây trong bản tĩnh */}

            <div className="profile-header">
              <h2>Skill Profile</h2>
              {/* Phần hiển thị công khai */}
              <div className="visibility-selector">
                <button id="visibility-dropdown-btn" className="visibility-btn" onClick={toggleVisibilityDropdown}>
                   {visibility === 'public' ? '🌐 Public' : '🔒 Private'} ▼
                </button>
                {isVisibilityDropdownOpen && (
                    <div id="visibility-dropdown" className="visibility-dropdown">
                      <div className="dropdown-item" onClick={() => handleVisibilitySelect('public')}>
                         Public
                      </div>
                      <div className="dropdown-item" onClick={() => handleVisibilitySelect('private')}>
                         Private
                      </div>
                    </div>
                )}
              </div>
            </div>
            <p className="profile-description">Create your skill profile to showcase your skills.</p>

            {/* --- Phần Profile Section --- */}
            <div className="profile-section">
              <h3>Profile picture</h3>
              <div className="profile-picture-container">
                 {/* Hiển thị avatar mẫu hoặc preview ảnh mới */}
                <img
                    src={avatarPreviewUrl || '/creator-ava.png'} // Sử dụng avatarPreviewUrl nếu có, ngược lại dùng ảnh mẫu
                    alt="Profile Picture"
                    id="profile-image"
                    className="profile-picture"
                 />
                 {/* Nút Edit và input file ẩn cho avatar */}
                <button className="edit-btn" onClick={() => document.getElementById('profile-pic-upload').click()}>Edit</button>
                <input
                    type="file"
                    id="profile-pic-upload"
                    accept="image/*"
                    style={{display:'none'}} // Ẩn input file gốc
                    onChange={handleAvatarFileChange} // Xử lý khi file được chọn
                />
              </div>
            </div>

            <div className="profile-section">
              <h3>Name<span className="required">*</span></h3>
              <input
                type="text"
                className="form-control-us"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="profile-section">
              <h3>Email<span className="required">*</span></h3>
              <div className="email-section">
                <input
                    type="email"
                    className="form-control-us"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    // email mẫu tĩnh, không disable
                />
              </div>
            </div>


            {/* --- Phần Update Password --- */}
            <div className="settings-section">
              <h2>Password</h2>
              <p className="settings-description">Use the form below to update your password.</p>

              <div className="password-fields">
                <div className="field-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    className="form-control-us"
                    id="new-password"
                    name="newPassword"
                    placeholder="New password"
                    value={newPassword}
                    onChange={handlePasswordInputChange}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control-us"
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={handlePasswordInputChange}
                  />
                </div>

                <button
                    className="update-password-btn"
                    onClick={handleUpdatePassword} // Gọi hàm giả lập
                    // disabled={isUpdatingPassword} // Bỏ disabled loading API
                >
                    Update Password
                </button>
              </div>
            </div>

            {/* --- Phần Save Profile Actions --- */}
            <div className="profile-actions-section" style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'right'}}>
              <button
                className="save-profile-btn"
                onClick={handleSaveChangesProfile} // Gọi hàm giả lập
                 // disabled={isSavingProfile} // Bỏ disabled loading API
              >
                Save Profile
              </button>
            </div>
        </div>
    );
}

export default ProfilePage;