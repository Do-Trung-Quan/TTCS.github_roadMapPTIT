import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RoadmapsPage.css';
import RoadmapModal from './RoadmapModal';
import Pagination from '../../components/Pagination/Pagination';

function RoadmapsPage({ currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [originalRoadmaps, setOriginalRoadmaps] = useState([]); // Lưu dữ liệu gốc từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalRoadmaps, setTotalRoadmaps] = useState(0);

  const initialTranslations = useMemo(() => ({
    pageTitle: 'Quản lý lộ trình',
    createButton: '+ Tạo Lộ trình',
    loadingMessage: 'Đang tải lộ trình...',
    authError: 'Không tìm thấy mã thông báo xác thực. Vui lòng đăng nhập.',
    noRoadmapsTitle: 'Chưa có lộ trình nào',
    noRoadmapsDescription: 'Tạo một lộ trình để bắt đầu',
    noDescription: 'Không có mô tả',
    editButton: 'Sửa',
    deleteButton: 'Xóa',
    tokenExpired: 'Phiên đăng nhập đã hết hạn. Đang chuyển hướng về trang đăng nhập...',
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const decodeHtmlEntities = (str) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

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

  const checkTokenExpiration = (token) => {
    if (!token) return false;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const exp = decoded.exp;
      const now = Date.now() / 1000;
      if (exp && exp < now) {
        setError(translations.tokenExpired);
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Lỗi khi kiểm tra token:', error);
      setError(translations.authError);
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      return false;
    }
  };

  const fetchRoadmaps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError(translations.authError);
      setIsLoading(false);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/roadmaps/?page=${currentPage}&page_size=${itemsPerPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể tìm nạp lộ trình: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Phản hồi API:', data);

      const roadmapData = data.results && data.results.data ? data.results.data : [];
      setOriginalRoadmaps(roadmapData); // Lưu dữ liệu gốc
      setTotalRoadmaps(data.count || 0);

      // Dịch dữ liệu nếu không phải tiếng Việt
      if (currentLang !== 'vi') {
        const titles = roadmapData.map(item => item.title);
        const descriptions = roadmapData.map(item => item.description || '');
        const translatedTitles = await translateText(titles, currentLang);
        const translatedDescriptions = await translateText(descriptions, currentLang);

        const translatedRoadmaps = roadmapData.map((item, index) => ({
          ...item,
          title: decodeHtmlEntities(translatedTitles[index] || item.title),
          description: translatedDescriptions[index] ? decodeHtmlEntities(translatedDescriptions[index]) : item.description,
        }));
        setRoadmaps(translatedRoadmaps);
      } else {
        setRoadmaps(roadmapData);
      }
    } catch (err) {
      console.error('Lỗi khi tìm nạp lộ trình:', err);
      setError(err.message);
      setOriginalRoadmaps([]);
      setRoadmaps([]);
      setTotalRoadmaps(0);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, currentLang, translations.authError, translations.tokenExpired, getToken, logout, navigate]);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    const translateContent = async () => {
      // Dịch chuỗi tĩnh
      let updatedTranslations = initialTranslations;
      if (currentLang !== 'vi') {
        const textsToTranslate = Object.values(initialTranslations);
        const translatedTexts = await translateText(textsToTranslate, currentLang);
        updatedTranslations = {};
        Object.keys(initialTranslations).forEach((key, index) => {
          updatedTranslations[key] = decodeHtmlEntities(translatedTexts[index] || initialTranslations[key]);
        });
      }
      setTranslations(updatedTranslations);

      // Dịch dữ liệu động
      if (originalRoadmaps.length > 0) {
        if (currentLang === 'vi') {
          setRoadmaps(originalRoadmaps);
        } else {
          const titles = originalRoadmaps.map(item => item.title);
          const descriptions = originalRoadmaps.map(item => item.description || '');
          const translatedTitles = await translateText(titles, currentLang);
          const translatedDescriptions = await translateText(descriptions, currentLang);

          const translatedRoadmaps = originalRoadmaps.map((item, index) => ({
            ...item,
            title: decodeHtmlEntities(translatedTitles[index] || item.title),
            description: translatedDescriptions[index] ? decodeHtmlEntities(translatedDescriptions[index]) : item.description,
          }));
          setRoadmaps(translatedRoadmaps);
        }
      }
    };
    translateContent();
  }, [currentLang, originalRoadmaps, initialTranslations]);

  const handlePageChange = (pageNumber) => {
    const lastPage = Math.ceil(totalRoadmaps / itemsPerPage);
    if (pageNumber > 0 && pageNumber <= lastPage && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    } else if (pageNumber > lastPage && lastPage >= 1) {
      setCurrentPage(lastPage);
    } else if (lastPage === 0 && pageNumber === 1) {
      setCurrentPage(1);
    }
  };

  const handleCreateButtonClick = () => {
    const token = getToken();
    if (!token || !checkTokenExpiration(token)) return;
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleRoadmapCreated = (newRoadmap) => {
    setOriginalRoadmaps(prevRoadmaps => [...prevRoadmaps, newRoadmap]); // Cập nhật dữ liệu gốc
    setTotalRoadmaps(prevTotal => prevTotal + 1);
    setIsCreateModalOpen(false);
    // Dữ liệu mới sẽ được dịch trong useEffect của translateContent
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    const token = getToken();
    if (!token) {
      setError(translations.authError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/roadmaps/${roadmapId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể xóa lộ trình: ${response.statusText}`);
      }

      setOriginalRoadmaps(prevRoadmaps => prevRoadmaps.filter(roadmap => roadmap.id !== roadmapId));
      setRoadmaps(prevRoadmaps => prevRoadmaps.filter(roadmap => roadmap.id !== roadmapId));
      setTotalRoadmaps(prevTotal => prevTotal - 1);
    } catch (err) {
      console.error('Lỗi khi xóa lộ trình:', err);
      setError(err.message);
    }
  };

  const handleEditClick = (roadmapId) => {
    const token = getToken();
    if (!token || !checkTokenExpiration(token)) return;
    navigate(`/admin/edit-roadmap/${roadmapId}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ textAlign: 'center' }}>{translations.loadingMessage}</div>;
    }

    if (error) {
      return <div className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    if (roadmaps.length === 0) {
      return (
        <div className="no-roadmaps">
          <div className="roadmap-icon">
            <i className="fa-solid fa-signs-post"></i>
          </div>
          <h2>{translations.noRoadmapsTitle}</h2>
          <p>{translations.noRoadmapsDescription}</p>
        </div>
      );
    }

    return (
      <div className="roadmap-list">
        {roadmaps.map((roadmap) => (
          <div key={roadmap.id} className="roadmap-list-item">
            <div className="item-details">
              <span className="item-title">{roadmap.title}</span>
              <span className="item-stats">{roadmap.description || translations.noDescription}</span>
            </div>
            <div className="item-actions">
              <button
                className="action-btn edit-btn"
                onClick={() => handleEditClick(roadmap.id)}
              >
                {translations.editButton}
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDeleteRoadmap(roadmap.id)}
              >
                {translations.deleteButton}
              </button>
            </div>
          </div>
        ))}
        {totalRoadmaps > itemsPerPage && (
          <Pagination
            totalItems={totalRoadmaps}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className="page-content" id="roadmaps">
      <div className="roadmap-container">
        <div className="roadmap-tabs">
          <h2>{translations.pageTitle}</h2>
          <button
            className="create-roadmap-btn"
            onClick={handleCreateButtonClick}
          >
            {translations.createButton}
          </button>
        </div>

        {renderContent()}

        <RoadmapModal
          isVisible={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onRoadmapCreated={handleRoadmapCreated}
          currentLang={currentLang}
        />
      </div>
    </div>
  );
}

export default RoadmapsPage;