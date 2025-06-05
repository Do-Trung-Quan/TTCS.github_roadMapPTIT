import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
};

function ProfilePage({ currentLang = 'vi' }) {
    const { isLoggedIn, getToken, logout } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        avatar: '',
        github: '',
        linkedin: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
    const [showEmailOnProfile, setShowEmailOnProfile] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const token = getToken();
    const userId = token ? JSON.parse(atob(token.split('.')[1])).user_id : null;

    const initialTranslations = useMemo(() => ({
        profileTitle: "Hồ sơ kỹ năng",
        profileDescription: "Tạo hồ sơ kỹ năng của bạn để giới thiệu các kỹ năng của bạn.",
        avatarSection: "Ảnh đại diện",
        editButton: "Chỉnh sửa",
        usernameSection: "Tên người dùng",
        required: "*",
        emailSection: "Email",
        visitSettings: "Truy cập trang cài đặt để thay đổi email",
        showEmailLabel: "Hiển thị email của tôi trên hồ sơ",
        githubSection: "Github",
        linkedinSection: "LinkedIn",
        saveButton: "Lưu hồ sơ",
        errorLoading: "Không tìm thấy mã xác thực. Vui lòng đăng nhập.",
        errorValidationUsername: "Tên người dùng là bắt buộc.",
        errorValidationEmail: "Email là bắt buộc.",
        errorValidationEmailFormat: "Định dạng email không hợp lệ.",
        errorValidationGithub: "URL Github không hợp lệ.",
        errorValidationLinkedin: "URL LinkedIn không hợp lệ.",
        errorServer: "Lỗi máy chủ nội bộ",
        successMessage: "Hồ sơ đã được cập nhật thành công.",
        loading: "Đang tải...",
        errorAvatarType: "Vui lòng chọn một tệp hình ảnh.",
        errorAvatarSize: "Kích thước tệp hình ảnh phải nhỏ hơn 5MB.",
    }), []);

    const [translations, setTranslations] = useState(initialTranslations);

    const translateText = async (texts, targetLang) => {
        try {
            const response = await fetch('http://localhost:8000/api/translate/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: texts, target_lang: targetLang }),
            });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            return data.translated || texts;
        } catch (error) {
            console.error('Lỗi dịch:', error);
            return texts;
        }
    };

    useEffect(() => {
        const translateContent = async () => {
            if (currentLang === 'vi') {
                setTranslations(initialTranslations);
                return;
            }
            const textsToTranslate = Object.values(initialTranslations);
            const translatedTexts = await translateText(textsToTranslate, currentLang);
            const updatedTranslations = {};
            Object.keys(initialTranslations).forEach((key, index) => {
                updatedTranslations[key] = decodeHtmlEntities(translatedTexts[index] || initialTranslations[key]);
            });
            setTranslations(updatedTranslations);
        };
        translateContent();
    }, [currentLang, initialTranslations]);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }

        const tokenCheck = () => {
            const token = getToken();
            if (token) {
                try {
                    const decoded = JSON.parse(atob(token.split('.')[1]));
                    const exp = decoded.exp;
                    const now = Date.now() / 1000;
                    if (exp && exp < now) {
                        logout();
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Lỗi khi kiểm tra token:', error);
                    logout();
                    navigate('/');
                }
            }
        };

        tokenCheck();

        const fetchUserData = async () => {
            if (!token || !userId) {
                setError(translations.errorLoading);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || translations.errorServer);
                }

                const data = await response.json();
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    avatar: data.avatar || '',
                    github: data.github || '',
                    linkedin: data.linkedin || '',
                });
                setShowEmailOnProfile(data.show_email_on_profile || false);
                setAvatarPreviewUrl(data.avatar || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [token, userId, translations, isLoggedIn, getToken, logout, navigate]);

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
        };
    }, [avatarPreviewUrl]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError(translations.errorAvatarType);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(translations.errorAvatarSize);
                return;
            }
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            setAvatarPreviewUrl(previewUrl);
        } else {
            setAvatarFile(null);
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            setAvatarPreviewUrl(null);
        }
    };

    const validateForm = () => {
        if (!formData.username) return translations.errorValidationUsername;
        if (!formData.email) return translations.errorValidationEmail;
        const emailPattern = /^[\w.-]+@[\w.-]+\.\w+$/;
        if (!emailPattern.test(formData.email)) return translations.errorValidationEmailFormat;
        if (formData.github) {
            const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/;
            if (!githubPattern.test(formData.github)) return translations.errorValidationGithub;
        }
        if (formData.linkedin) {
            const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
            if (!linkedinPattern.test(formData.linkedin)) return translations.errorValidationLinkedin;
        }
        return null;
    };

    const handleSaveChangesProfile = async (event) => {
        event.preventDefault();
        if (!token || !userId) {
            setError(translations.errorLoading);
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('github', formData.github || '');
        formDataToSend.append('linkedin', formData.linkedin || '');
        formDataToSend.append('show_email_on_profile', showEmailOnProfile);
        if (avatarFile) formDataToSend.append('avatar', avatarFile);

        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || translations.errorServer);
            }

            const data = await response.json();
            setFormData({
                username: data.data.username,
                email: data.data.email,
                avatar: data.data.avatar,
                github: data.data.github,
                linkedin: data.data.linkedin,
            });
            setShowEmailOnProfile(data.data.show_email_on_profile);
            setAvatarPreviewUrl(data.data.avatar);
            setAvatarFile(null);
            setSuccessMessage(data.message || translations.successMessage);
            if (data.warning) setError(data.warning);
        } catch (err) {
            setError(`Lỗi khi lưu hồ sơ: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVisitSettings = (e) => {
        e.preventDefault();
        navigate('/admin/settings');
    };

    return (
        <div className="page-content profile-page-container">
            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}
            {isLoading && <p style={{ textAlign: 'center' }}>{translations.loading}</p>}

            <div className="profile-header">
                <h2>{translations.profileTitle}</h2>
            </div>
            <p className="profile-description">{translations.profileDescription}</p>

            <div className="profile-section">
                <h3>{translations.avatarSection}</h3>
                <div className="profile-picture-container">
                    <img
                        src={avatarPreviewUrl || '/creator-ava.png'}
                        alt="Hồ sơ"
                        id="profile-image"
                        className="profile-picture"
                    />
                    <button className="edit-btn" onClick={() => document.getElementById('profile-pic-upload').click()}>{translations.editButton}</button>
                    <input
                        type="file"
                        id="profile-pic-upload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarFileChange}
                    />
                </div>
            </div>

            <div className="profile-section">
                <h3>{translations.usernameSection}<span className="required">{translations.required}</span></h3>
                <input
                    type="text"
                    className="form-control-us"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                />
            </div>

            <div className="profile-section">
                <h3>{translations.emailSection}<span className="required">{translations.required}</span></h3>
                <div className="email-section">
                    <input
                        type="email"
                        className="form-control-us"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                    />
                    <p>
                        <button
                            onClick={handleVisitSettings}
                            style={{ color: 'purple', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {translations.visitSettings}
                        </button>
                    </p>
                    <label>
                        <input
                            type="checkbox"
                            checked={showEmailOnProfile}
                            onChange={(e) => setShowEmailOnProfile(e.target.checked)}
                        /> {translations.showEmailLabel}
                    </label>
                </div>
            </div>

            <div className="profile-section">
                <h3>{translations.githubSection}</h3>
                <input
                    type="url"
                    className="form-control-us"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/tên-người-dùng"
                />
            </div>

            <div className="profile-section">
                <h3>{translations.linkedinSection}</h3>
                <input
                    type="url"
                    className="form-control-us"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://www.linkedin.com/in/tên-người-dùng/"
                />
            </div>

            <div className="profile-actions-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
                <button
                    className="save-profile-btn"
                    onClick={handleSaveChangesProfile}
                    disabled={isLoading}
                >
                    {translations.saveButton}
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;