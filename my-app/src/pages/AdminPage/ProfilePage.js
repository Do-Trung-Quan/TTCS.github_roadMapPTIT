import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Import file CSS tương ứng
// Import Font Awesome icons nếu dùng component React hoặc đảm bảo CSS global
// import { FaGlobe, FaLock, FaCaretDown, FaCamera } from 'react-icons/fa';

// Component hiển thị và cho phép chỉnh sửa Profile người dùng
// Props:
// - userId: ID của người dùng cần xem/chỉnh sửa profile (truyền từ AdminPage hoặc UserPage)
// - authToken: Token xác thực (ví dụ: JWT Access Token)
// - onProfileUpdated: Callback khi profile được cập nhật thành công (để thông báo cho cha)
function ProfilePage({ userId, authToken, onProfileUpdated }) {
    // State lưu trữ dữ liệu người dùng gốc fetched từ API
    const [userData, setUserData] = useState(null);
    // State lưu trữ dữ liệu form để chỉnh sửa (ban đầu lấy từ userData)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
    });
    // State cho file avatar mới được chọn
    const [avatarFile, setAvatarFile] = useState(null);
    // State riêng cho mật khẩu mới (không lưu vào formData chung)
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State cho trạng thái loading
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    // State cho thông báo lỗi và thành công
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State cho dropdown hiển thị công khai (giữ lại nếu cần)
    const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);
    const [visibility, setVisibility] = useState('public'); // Giả định giá trị mặc định


    // Effect để fetch dữ liệu người dùng khi component mount hoặc userId/authToken thay đổi
    useEffect(() => {
        if (!userId) {
            setError("User ID is not provided.");
            setIsLoading(false);
            return;
        }

        // Lấy token từ localStorage nếu không được truyền qua prop
        const token = authToken || localStorage.getItem('access_token'); // Tên key token tùy thuộc vào cách bạn lưu
         if (!token) {
             setError("Authentication token not found.");
             setIsLoading(false);
             return;
         }

        const fetchUserData = async () => {
            setIsLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                // Sử dụng API endpoint GET để lấy chi tiết người dùng
                // Giả định API chi tiết người dùng là GET /api/users/<str:id>/
                const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Gửi token xác thực
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                     // Đọc lỗi từ response body nếu có
                    const errorData = await response.json();
                    throw new Error(`Failed to fetch user data: ${errorData.detail || response.statusText}`);
                }

                const data = await response.json();
                setUserData(data); // Lưu data gốc
                setFormData({ // Điền data vào form
                    username: data.username || '',
                    email: data.email || '',
                });
                // Không điền mật khẩu vào state form vì lý do bảo mật
                setNewPassword('');
                setConfirmPassword('');

            } catch (err) {
                setError(err.message);
                console.error("Error fetching user data:", err);
                setUserData(null);
                setFormData({ username: '', email: '' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();

        // Cleanup function (optional)
        return () => {
            // Abort fetch request nếu component unmount trước khi fetch hoàn tất
            // Ví dụ: const controller = new AbortController(); signal: controller.signal
            // controller.abort();
        };

    }, [userId, authToken]); // Re-run effect if userId or authToken changes


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

     // Hàm xử lý chọn file avatar mới
    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            // TODO: Có thể hiển thị ảnh preview ở đây (Ví dụ: tạo URL tạm thời)
            // const previewUrl = URL.createObjectURL(file);
            // setAvatarPreviewUrl(previewUrl);
        } else {
            setAvatarFile(null);
            // TODO: Xóa ảnh preview nếu có
            // setAvatarPreviewUrl(null);
        }
    };


    // Hàm xử lý click nút "Save Profile" (Cập nhật Username, Email, Avatar)
    const handleSaveChangesProfile = async (event) => {
        event.preventDefault(); // Ngăn submit form mặc định

        setIsSavingProfile(true);
        setError(null);
        setSuccessMessage(null);

        const token = authToken || localStorage.getItem('access_token');
         if (!token) {
             setError("Authentication token not found.");
             setIsSavingProfile(false);
             return;
         }

        // Tạo FormData để gửi dữ liệu (cần cho việc upload file)
        const apiData = new FormData();

        // Thêm các trường đã thay đổi vào FormData
        // Chỉ thêm nếu userData đã fetch xong VÀ giá trị trong form khác với giá trị ban đầu
        if (userData) { // Đảm bảo userData đã fetch xong trước khi so sánh
            if (formData.username !== userData.username) {
                 apiData.append('username', formData.username);
            }
            if (formData.email !== userData.email) {
                 apiData.append('email', formData.email);
            }
        } else { // Trường hợp này không nên xảy ra nếu loading được xử lý đúng, nhưng thêm để an toàn
             if (formData.username) apiData.append('username', formData.username);
             if (formData.email) apiData.append('email', formData.email);
        }


        if (avatarFile) { // Thêm file avatar nếu có
            apiData.append('avatar', avatarFile);
        }

        // Kiểm tra xem FormData có bất kỳ entry nào không sau khi thêm các trường có thể thay đổi
         if (Array.from(apiData.entries()).length === 0) { // Chuyển iterator thành mảng để lấy length
              setSuccessMessage("No changes to save.");
              setIsSavingProfile(false);
              return;
         }


        try {
            // Gửi request PUT đến API update user
            const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
                method: 'PUT',
                 // Lưu ý: Không set 'Content-Type': 'application/json' khi dùng FormData cho upload file
                headers: {
                    'Authorization': `Bearer ${token}`, // Gửi token xác thực
                },
                body: apiData, // Gửi FormData
            });

            // Backend trả về 200 OK khi thành công
            if (!response.ok) {
                 const errorData = await response.json();
                 // Sử dụng error.detail hoặc message từ backend
                 const errorMessage = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData) || response.statusText;
                throw new Error(`Failed to save profile changes: ${errorMessage}`);
            }

            const result = await response.json();
            // Cập nhật lại state userData với data mới nhận được từ API
            setUserData(result.data); // Giả định API trả về user data đã cập nhật trong result.data
            setFormData({ // Cập nhật lại form data từ data mới
                username: result.data.username || '',
                email: result.data.email || '',
            });
             setAvatarFile(null); // Reset file avatar đã chọn
            // TODO: Nếu có avatar preview, thu hồi URL tạm thời: URL.revokeObjectURL(avatarPreviewUrl); setAvatarPreviewUrl(null);

            setSuccessMessage("Profile updated successfully!"); // Thông báo thành công
            setError(null); // Xóa lỗi cũ nếu có


             // Thông báo cho component cha nếu cần cập nhật UI (ví dụ: tên user ở Sidebar)
             if (onProfileUpdated) {
                 onProfileUpdated(result.data);
             }


        } catch (err) {
            setError(err.message);
            console.error("Error saving profile:", err);
            setSuccessMessage(null);
        } finally {
            setIsSavingProfile(false);
        }
    };


    // Hàm xử lý click nút "Update Password"
     const handleUpdatePassword = async (event) => {
        event.preventDefault(); // Ngăn submit form mặc định

        setIsUpdatingPassword(true);
        setError(null);
        setSuccessMessage(null);

        const token = authToken || localStorage.getItem('access_token');
         if (!token) {
             setError("Authentication token not found.");
             setIsUpdatingPassword(false);
             return;
         }

        // Client-side validation cho mật khẩu
        if (!newPassword || !confirmPassword) {
            setError("Please enter new password and confirm password.");
            setIsUpdatingPassword(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            setIsUpdatingPassword(false);
            return;
        }
         // TODO: Thêm các validation phức tạp khác (độ dài, chữ hoa, số) dựa trên serializer nếu muốn kiểm tra sớm ở frontend

        // Tạo FormData để gửi mật khẩu (API endpoint update có thể nhận password qua FormData)
        const apiData = new FormData();
         apiData.append('password', newPassword);


        try {
            // Gửi request PUT đến API update user
            const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
                method: 'PUT',
                 // Không set 'Content-Type'
                headers: {
                    'Authorization': `Bearer ${token}`, // Gửi token xác thực
                },
                body: apiData, // Gửi FormData chứa password
            });

             // Backend trả về 200 OK khi thành công
            if (!response.ok) {
                 const errorData = await response.json();
                 const errorMessage = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData) || response.statusText;
                throw new Error(`Failed to update password: ${errorMessage}`);
            }

            // Giả định API trả về thông báo thành công hoặc user data (Serializer không bao gồm password)
            // const result = await response.json();

            setSuccessMessage("Password updated successfully!"); // Thông báo thành công
            setError(null); // Xóa lỗi cũ nếu có
            setNewPassword(''); // Xóa mật khẩu đã nhập
            setConfirmPassword('');

        } catch (err) {
            setError(err.message);
            console.error("Error updating password:", err);
            setSuccessMessage(null);
        } finally {
            setIsUpdatingPassword(false);
        }
    };


    // Hàm xử lý dropdown hiển thị công khai (giữ lại nếu cần)
    const toggleVisibilityDropdown = () => {
        setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen);
    };

    const handleVisibilitySelect = (value) => {
        setVisibility(value);
        setIsVisibilityDropdownOpen(false);
        // TODO: Lưu trạng thái hiển thị này lên backend nếu API hỗ trợ
        console.log("Visibility changed to:", value);
    };


    // Hiển thị Loading hoặc Error message khi fetch ban đầu
    if (isLoading) {
        return <div className="page-content profile-page-container" style={{textAlign: 'center'}}>Loading profile...</div>;
    }

    // Hiển thị lỗi nếu fetch thất bại và không có userData nào để hiển thị form
     if (error && !userData) {
        return <div className="page-content profile-page-container error-message">{error}</div>;
    }

     // Nếu có userData (dù có thể có lỗi hoặc thông báo thành công sau submit), hiển thị form
    return (
        <div className="page-content profile-page-container"> {/* Sử dụng className cho container chính */}
            {/* Hiển thị thông báo lỗi hoặc thành công */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}


            <div className="profile-header">
              <h2>Skill Profile</h2>
              {/* Phần hiển thị công khai - giữ lại nếu cần */}
              <div className="visibility-selector">
                <button id="visibility-dropdown-btn" className="visibility-btn" onClick={toggleVisibilityDropdown}>
                   {visibility === 'public' ? '🌐 Public' : '🔒 Private'} ▼ {/* Text và mũi tên đơn giản */}
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
                 {/* Hiển thị avatar hiện tại hoặc preview ảnh mới */}
                <img
                    src={avatarFile ? URL.createObjectURL(avatarFile) : (userData?.avatar || '/creator-ava.png')}
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
                    // disabled={!userData?.email} // Tùy chọn: disable nếu email rỗng hoặc không cho sửa email
                />
              </div>
            </div>


            {/* --- Phần Update Password --- */}
             {/* Giữ nguyên cấu trúc HTML như mẫu */}
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
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* --- Phần Save Profile Actions --- */}
             {/* Đặt ở cuối form hoặc nơi phù hợp */}
            <div className="profile-actions-section" style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'right'}}>
              <button
                className="save-profile-btn"
                onClick={handleSaveChangesProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
    );
}

export default ProfilePage;