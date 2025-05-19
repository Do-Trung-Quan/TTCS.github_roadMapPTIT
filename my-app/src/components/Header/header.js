// src/components/Header/header.js
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './header.css';

function Header() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { language, currentTranslations, changeLanguage } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // API mới trả về data trực tiếp, không lồng trong results
      setSearchResults(data.data || []);
      setShowResults(true);
      console.log('Search results:', data.data);
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
    navigate(`/roadmap/${id}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="navigation">
      <nav className="navbar navbar-expand-sm navbar-dark" style={{ backgroundColor: '#0b0b0b', position: 'relative', zIndex: 20001 }}>
        <div className="container-fluid">
          <Link className="nav-bar letter-logo" to="/" data-discover="true">RoadMapPTIT</Link>

          <div className="search-section d-flex ms-3" style={{ position: 'relative', zIndex: 20001 }}>
            <form className="d-flex" role="search" onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  className="form-control"
                  type="search"
                  placeholder={currentTranslations.searchPlaceholder}
                  aria-label="Search"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <button className="btn btn-outline-danger" type="submit">
                  {currentTranslations.searchButton || 'Tìm'}
                </button>
              </div>
            </form>
          </div>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                {currentTranslations.roadmapLink}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/about-us">
                {currentTranslations.aboutUsLink}
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item d-flex align-items-center">
              <a className="nav-link p-0" href="#" onClick={() => changeLanguage('vi')}>
                <img src="https://flagsapi.com/VN/flat/64.png" alt="Vietnamese" width="30" height="30" />
              </a>
              <span className="border-start mx-2" style={{ height: '24px', display: 'inline-block' }}></span>
              <a className="nav-link p-0" href="#" onClick={() => changeLanguage('en')}>
                <img src="https://flagsapi.com/GB/flat/64.png" alt="English" width="30" height="30" />
              </a>
            </li>
            <li className="nav-item">
              {isLoggedIn ? (
                <button
                  className="btn btn-outline-danger"
                  id="profile-btn"
                  onClick={() => navigate('/admin')}
                >
                  {currentTranslations.profileButton || 'Profile'}
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger"
                  id="signin-btn"
                  onClick={() => navigate('/login')}
                >
                  {currentTranslations.loginButton || 'Login'}
                </button>
              )}
            </li>
          </ul>
        </div>

        {/* Đưa search-results-container ra ngoài container-fluid nhưng giữ vị trí tương đối với search-section */}
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
                    {`${result.title || 'No title'} - ${result.description || 'No description'}`}
                  </div>
                ))
              ) : searchTerm ? (
                <div className="search-result-item no-results">
                  Không tìm thấy kết quả nào cho "{searchTerm}"
                </div>
              ) : null}
            </div>
          </div>
        )}

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
                {currentTranslations.roadmapLink}
              </Link>
            </li>
            <li className="nav-mobile-item">
              <Link className="nav-link active" to="/about-us" onClick={() => document.getElementById('nav-mobile-input').checked = false}>
                {currentTranslations.aboutUsLink}
              </Link>
            </li>
            <li className="nav-mobile-item d-flex align-items-center">
              <a className="nav-link p-0" href="#" onClick={() => { changeLanguage('vi'); document.getElementById('nav-mobile-input').checked = false; }}>
                <img src="https://flagsapi.com/VN/flat/64.png" alt="Vietnamese" width="30" height="30" />
              </a>
              <span className="border-start mx-2" style={{ height: '24px', display: 'inline-block' }}></span>
              <a className="nav-link p-0" href="#" onClick={() => { changeLanguage('en'); document.getElementById('nav-mobile-input').checked = false; }}>
                <img src="https://flagsapi.com/GB/flat/64.png" alt="English" width="30" height="30" />
              </a>
            </li>
            <li className="nav-mobile-item">
              {isLoggedIn ? (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => { navigate('/admin'); document.getElementById('nav-mobile-input').checked = false; }}
                >
                  {currentTranslations.profileButton || 'Profile'}
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => { navigate('/login'); document.getElementById('nav-mobile-input').checked = false; }}
                >
                  {currentTranslations.loginButton || 'Login'}
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