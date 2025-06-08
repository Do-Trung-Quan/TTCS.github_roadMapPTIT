import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import './header.css';

function Header({ currentLang, setCurrentLang }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const token = Cookies.get('access_token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userId = payload ? payload.user_id : null;
  const [role, setRole] = useState(payload ? payload.role : null);
  const [avatarUrl, setAvatarUrl] = useState(payload ? payload.avatar : null);

  const initialTranslations = {
    searchPlaceholder: 'Tìm kiếm lộ trình...',
    searchButton: 'Tìm',
    roadmapLink: 'Lộ trình',
    aboutUsLink: 'Về chúng tôi',
    profileButton: 'Trang cá nhân',
    loginButton: 'Đăng nhập',
    noResults: 'Không tìm thấy kết quả nào cho',
  };

  const [translations, setTranslations] = useState(() => {
    const savedTranslations = localStorage.getItem('headerTranslations');
    return savedTranslations ? JSON.parse(savedTranslations) : initialTranslations;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(() => {
    const savedResults = localStorage.getItem('headerSearchResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });
  const [showResults, setShowResults] = useState(false);

  const translateText = async (texts, targetLang) => {
    console.log('Gửi yêu cầu dịch với texts:', texts, 'và target_lang:', targetLang);
    try {
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: texts,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phản hồi lỗi từ API:', errorText);
        throw new Error(`Không thể dịch: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Phản hồi từ API dịch:', data);
      return data.translated || texts;
    } catch (error) {
      console.error('Lỗi khi gọi API dịch:', error);
      return texts;
    }
  };

  const handleLanguageChange = async (lang) => {
    setCurrentLang(lang);

    if (lang === 'vi') {
      setTranslations(initialTranslations);
      // Đặt lại kết quả tìm kiếm về nguyên bản (tiếng Việt)
      const originalResults = localStorage.getItem('headerSearchResultsOriginal') ? JSON.parse(localStorage.getItem('headerSearchResultsOriginal')) : [];
      setSearchResults(originalResults);
      return;
    }

    const textsToTranslate = Object.values(initialTranslations);
    const translatedTexts = await translateText(textsToTranslate, lang);

    const updatedTranslations = {};
    Object.keys(initialTranslations).forEach((key, index) => {
      updatedTranslations[key] = translatedTexts[index] || initialTranslations[key];
    });
    setTranslations(updatedTranslations);

    // Dịch lại kết quả tìm kiếm nếu có
    if (searchResults.length > 0) {
      const searchResultTexts = searchResults.map(result => result.title || 'Không có tiêu đề');
      const translatedResultTexts = await translateText(searchResultTexts, lang);
      const updatedResults = searchResults.map((result, index) => ({
        ...result,
        title: translatedResultTexts[index] || result.title || 'Không có tiêu đề',
      }));
      setSearchResults(updatedResults);
    }
  };

  useEffect(() => {
    localStorage.setItem('headerTranslations', JSON.stringify(translations));
  }, [translations]);

  useEffect(() => {
    localStorage.setItem('headerSearchResults', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !userId) {
        setRole(null);
        setAvatarUrl(null);
        return; // No token or userId, reset states
      }

      try {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.warn('Token expired or invalid (401), logging out and resetting states.');
            logout(); // Trigger logout in AuthContext
            setRole(null);
            setAvatarUrl(null);
            navigate('/');
            return;
          }
          throw new Error(`Không thể tải dữ liệu người dùng: ${response.statusText}`);
        }

        const data = await response.json();
        setRole(data.role);
        setAvatarUrl(data.avatar);
        Cookies.set('user_role', data.role, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('user_avatar', data.avatar, { expires: 7, secure: true, sameSite: 'Strict' });
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        logout(); // Logout on any error
        setRole(null);
        setAvatarUrl(null);
        navigate('/');
      }
    };

    fetchUserData();
  }, [token, userId, navigate, logout]);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('Handling search for term:', searchTerm);
    if (!searchTerm) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/roadmap-search/?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        if (response.status === 400) {
          console.warn('Yêu cầu không hợp lệ:', searchTerm);
          setSearchResults([]);
          setShowResults(true);
          return;
        }
        throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
      }
      const data = await response.json();
      let results = data.data || [];
      localStorage.setItem('headerSearchResultsOriginal', JSON.stringify(results));

      // Dịch kết quả nếu ngôn ngữ khác tiếng Việt
      if (currentLang !== 'vi' && results.length > 0) {
        const searchResultTexts = results.map(result => result.title || 'Không có tiêu đề');
        const translatedTexts = await translateText(searchResultTexts, currentLang);
        results = results.map((result, index) => ({
          ...result,
          title: translatedTexts[index] || result.title || 'Không có tiêu đề',
        }));
      }

      setSearchResults(results);
      setShowResults(true);
      console.log('Kết quả tìm kiếm:', results);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm && searchResults.length > 0) setShowResults(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 150);
  };

  const handleResultClick = (id) => {
    console.log('Navigating to roadmap with ID:', id);
    navigate(`/roadmap/${id}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleProfileClick = () => {
    console.log('Handling profile click, role:', role);
    if (!role) {
      console.log('No role, redirecting to homepage.');
      navigate('/');
      return;
    }
    const destination = role === 'admin' ? '/admin/profile' : '/admin/activity';
    console.log('Navigating to:', destination);
    navigate(destination);
  };

  // Fallback to login button if avatar fails to load
  const handleImageError = () => {
    setAvatarUrl(null); // Reset avatarUrl on error
  };

  return (
    <div className="navigation">
      <nav className="navbar navbar-expand-sm navbar-dark" style={{ backgroundColor: '#0b0b0b', position: 'relative', zIndex: 20001 }}>
        <div className="container-fluid">
          <Link className="nav-bar letter-logo" to="/">RoadMapPTIT</Link>

          <div className="search-section d-flex ms-3" style={{ position: 'relative', zIndex: 20001 }}>
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  className="form-control"
                  type="search"
                  placeholder={translations.searchPlaceholder}
                  aria-label="Tìm kiếm"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{ minWidth: '220px', maxWidth: '220px' }} 
                />
                <button className="btn btn-outline-danger" type="submit">
                  {translations.searchButton}
                </button>
              </div>
            </form>
          </div>

          {showResults && (
            <div
              className="search-results-container"
              style={{
                position: 'absolute',
                top: document.querySelector('.search-section')?.getBoundingClientRect().bottom + window.scrollY + 'px',
                left: document.querySelector('.search-section')?.getBoundingClientRect().left + 'px',
                width: document.querySelector('.search-section')?.getBoundingClientRect().width + 'px',
              }}
            >
              <div className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="search-result-item"
                      onClick={() => handleResultClick(result.id)}
                    >
                      {result.title || 'Không có tiêu đề'}
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="search-result-item no-results">
                    {translations.noResults} "{searchTerm}"
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                {translations.roadmapLink}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/about-us">
                {translations.aboutUsLink}
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item d-flex align-items-center">
              <button className="nav-link p-0" style={{ background: 'none', border: 'none' }} onClick={() => handleLanguageChange('vi')}>
                <img src="https://flagsapi.com/VN/flat/64.png" alt="Tiếng Việt" width="30" height="30" />
              </button>
              <span className="border-start mx-2" style={{ height: '24px', display: 'inline-block' }}></span>
              <button className="nav-link p-0" style={{ background: 'none', border: 'none' }} onClick={() => handleLanguageChange('en')}>
                <img src="https://flagsapi.com/GB/flat/64.png" alt="Tiếng Anh" width="30" height="30" />
              </button>
            </li>
            <li className="nav-item d-flex align-items-center">
              {isLoggedIn && avatarUrl ? (
                <button className="user-avatar-btn" onClick={handleProfileClick}>
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="user-avatar"
                    onError={handleImageError}
                  />
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger"
                  id="signin-btn"
                  onClick={() => navigate('/login')}
                >
                  {translations.loginButton}
                </button>
              )}
            </li>
          </ul>
        </div>

        <label htmlFor="nav-mobile-input" className="nav-home">
          <i className="ri-menu-fill"></i>
        </label>
        <input type="checkbox" name="nav-mobile-toggle" className="nav-input-mobile" id="nav-mobile-input" />
        <label htmlFor="nav-mobile-input" className="nav-overlay"></label>

        <nav className="nav-mobile">
          <label htmlFor="nav-mobile-input" className="nav-mobile-close">
            <i className="ri-close-large-line"></i>
          </label>
          <ul className="mobile-list">
            <li className="nav-mobile-item">
              <Link className="nav-link active" to="/" onClick={() => document.getElementById('nav-mobile-input').checked = false}>
                {translations.roadmapLink}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/about-us" onClick={() => document.getElementById('nav-mobile-input').checked = false}>
                {translations.aboutUsLink}
              </Link>
            </li>
            <li className="nav-mobile-item d-flex align-items-center">
              <button
                className="nav-link p-0"
                style={{ background: 'none', border: 'none' }}
                onClick={() => { handleLanguageChange('vi'); document.getElementById('nav-mobile-input').checked = false; }}
              >
                <img src="https://flagsapi.com/VN/flat/64.png" alt="Tiếng Việt" width="30" height="30" />
              </button>
              <button
                className="nav-link p-0"
                style={{ background: 'none', border: 'none' }}
                onClick={() => { handleLanguageChange('en'); document.getElementById('nav-mobile-input').checked = false; }}
              >
                <img src="https://flagsapi.com/GB/flat/64.png" alt="Tiếng Anh" width="30" height="30" />
              </button>
            </li>
            <li className="nav-mobile-item d-flex align-items-center">
              {isLoggedIn && avatarUrl ? (
                <button className="user-avatar-btn" onClick={() => { handleProfileClick(); document.getElementById('nav-mobile-input').checked = false; }}>
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="user-avatar"
                    onError={handleImageError}
                  />
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => { navigate('/login'); document.getElementById('nav-mobile-input').checked = false; }}
                >
                  {translations.loginButton}
                </button>
              )}
            </li>
          </ul>
        </nav>
      </nav>
    </div>
  );
}

export default Header;