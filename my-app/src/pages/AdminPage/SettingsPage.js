import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';

const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

function SettingsPage({ currentLang = 'vi', onSettingsUpdated }) {
  const { getToken, logout, isLoggedIn } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const token = getToken();
  const userId = token ? JSON.parse(atob(token.split('.')[1])).user_id : null;

  const initialTranslations = useMemo(() => ({
    passwordTitle: 'Mật khẩu',
    passwordDescription: 'Sử dụng biểu mẫu dưới đây để cập nhật mật khẩu của bạn.',
    newPasswordLabel: 'Mật khẩu mới',
    newPasswordPlaceholder: 'Mật khẩu mới',
    confirmPasswordLabel: 'Xác nhận mật khẩu mới',
    confirmPasswordPlaceholder: 'Xác nhận mật khẩu mới',
    updatePasswordButton: 'Cập nhật mật khẩu',
    emailTitle: 'Cập nhật Email',
    emailDescription: 'Sử dụng biểu mẫu dưới đây để cập nhật địa chỉ email của bạn.',
    currentEmailLabel: 'Email hiện tại',
    newEmailLabel: 'Email mới',
    newEmailPlaceholder: 'Nhập email mới',
    updateEmailButton: 'Cập nhật Email',
    errorAuth: 'Không tìm thấy mã thông báo xác thực hoặc ID người dùng. Vui lòng đăng nhập.',
    errorSessionExpired: 'Phiên đã hết hạn. Vui lòng đăng nhập lại.',
    errorEmailRequired: 'Email mới là bắt buộc.',
    errorEmailFormat: 'Định dạng email không hợp lệ.',
    errorPasswordRequired: 'Mật khẩu mới là bắt buộc.',
    errorPasswordLength: 'Mật khẩu phải dài ít nhất 8 ký tự.',
    errorPasswordUppercase: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa.',
    errorPasswordNumber: 'Mật khẩu phải chứa ít nhất một chữ số.',
    errorPasswordMatch: 'Mật khẩu không khớp.',
    errorServer: 'Đã xảy ra lỗi không mong muốn khi cập nhật.',
    successPassword: 'Mật khẩu đã được cập nhật thành công.',
    successEmail: 'Email đã được cập nhật thành công.',
    loading: 'Đang tải...',
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

  const fetchUserData = useCallback(async () => {
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

    if (!token || !userId) {
      setError(translations.errorAuth);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('SettingsPage fetch: API response not OK:', response.status, errorData);
        if (response.status === 401) {
          setError(translations.errorSessionExpired);
          logout();
          navigate('/');
          return;
        }
        throw new Error(errorData.detail || `Không thể tìm nạp dữ liệu người dùng: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('SettingsPage fetch: Đã tìm nạp thành công dữ liệu người dùng:', data);
      setCurrentUserEmail(data.email || '');
    } catch (err) {
      console.error('SettingsPage fetch: Lỗi khi tìm nạp dữ liệu người dùng:', err);
      setError(err.message || translations.errorServer);
      setCurrentUserEmail('');
    } finally {
      setIsLoading(false);
    }
  }, [token, userId, translations, isLoggedIn, getToken, logout, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const validateEmail = (email) => {
    if (!email) return translations.errorEmailRequired;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) return translations.errorEmailFormat;
    return null;
  };

  const handleUpdateEmail = async () => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const emailError = validateEmail(newEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', newEmail);
    console.log('Đang cố gắng cập nhật email với dữ liệu:', Object.fromEntries(formData));

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('SettingsPage update email: Trạng thái phản hồi API:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('SettingsPage update email: Phản hồi API không OK:', response.status, errorData);
        if (response.status === 401) {
          setError(translations.errorSessionExpired);
          logout();
          navigate('/');
          return;
        }
        const errorDetails = errorData.errors
          ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
          : errorData.message || errorData.detail || translations.errorServer;
        throw new Error(errorDetails);
      }

      const updatedData = await response.json();
      console.log('SettingsPage update email: Đã cập nhật email thành công. Dữ liệu phản hồi:', updatedData);
      setCurrentUserEmail(updatedData.data.email);
      setNewEmail('');
      setSuccessMessage(updatedData.message || translations.successEmail);
      if (onSettingsUpdated) onSettingsUpdated(updatedData.data);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('SettingsPage update email: Lỗi khi cập nhật email:', err);
      setError(err.message || translations.errorServer);
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = () => {
    if (!newPassword) return translations.errorPasswordRequired;
    if (newPassword.length < 8) return translations.errorPasswordLength;
    if (!/[A-Z]/.test(newPassword)) return translations.errorPasswordUppercase;
    if (!/[0-9]/.test(newPassword)) return translations.errorPasswordNumber;
    if (newPassword !== confirmPassword) return translations.errorPasswordMatch;
    return null;
  };

  const handleUpdatePassword = async () => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('password', newPassword);
    console.log('Đang cố gắng cập nhật mật khẩu với dữ liệu:', Object.fromEntries(formData));

    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('SettingsPage update password: Trạng thái phản hồi API:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('SettingsPage update password: Phản hồi API không OK:', response.status, errorData);
        if (response.status === 401) {
          setError(translations.errorSessionExpired);
          logout();
          navigate('/');
          return;
        }
        const errorDetails = errorData.errors
          ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
          : errorData.message || errorData.detail || translations.errorServer;
        throw new Error(errorDetails);
      }

      const data = await response.json();
      setSuccessMessage(data.message || translations.successPassword);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('SettingsPage update password: Lỗi khi cập nhật mật khẩu:', err);
      setError(err.message || translations.errorServer);
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-content" id="settings">
      <div className="settings-container">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {isLoading && <p style={{ textAlign: 'center', color: '#007bff' }}>{translations.loading}</p>}

        <div className="settings-section">
          <h2>{translations.passwordTitle}</h2>
          <p className="settings-description">{translations.passwordDescription}</p>

          <div className="password-fields">
            <div className="field-group">
              <label htmlFor="new-password">{translations.newPasswordLabel}</label>
              <input
                type="password"
                className="form-control us password-input"
                id="new-password"
                placeholder={translations.newPasswordPlaceholder}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="field-group">
              <label htmlFor="confirm-password">{translations.confirmPasswordLabel}</label>
              <input
                type="password"
                className="form-control us password-input"
                id="confirm-password"
                placeholder={translations.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              className="update-password-btn"
              id="update-password-btn"
              onClick={handleUpdatePassword}
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {translations.updatePasswordButton}
            </button>
          </div>
        </div>

        <hr className="settings-divider" />

        <div className="settings-section">
          <h2>{translations.emailTitle}</h2>
          <p className="settings-description">{translations.emailDescription}</p>

          <div className="email-fields">
            <div className="field-group">
              <label>{translations.currentEmailLabel}</label>
              <input
                type="email"
                className="form-control us"
                value={currentUserEmail}
                disabled
              />
            </div>

            <div className="field-group">
              <label htmlFor="new-email">{translations.newEmailLabel}</label>
              <input
                type="email"
                className="form-control us"
                id="new-email"
                placeholder={translations.newEmailPlaceholder}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              className="update-email-btn"
              onClick={handleUpdateEmail}
              disabled={isLoading || !newEmail}
            >
              {translations.updateEmailButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;