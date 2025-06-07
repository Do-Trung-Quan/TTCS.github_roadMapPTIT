import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ActivityPage.css';

// Hàm giải mã HTML entity
const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

// Hàm định dạng ngày tháng
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Ho_Chi_Minh'
  }).replace(',', '');
};

function ActivityPage({ currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, user, logout, isLoggedIn } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [statsData, setStatsData] = useState({ done_count: 0, pending_or_skip_count: 0 });
  const [latestStreak, setLatestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialTranslations = useMemo(() => ({
    loading: "Đang tải...",
    errorTitle: "Lỗi",
    loginPrompt: "Vui lòng đăng nhập",
    loginToView: "Đăng nhập để xem tiến độ của bạn.",
    loginLink: "Đăng nhập",
    topicsCompleted: "Chủ đề đã hoàn thành",
    currentlyLearning: "Đang trong quá trình học",
    currentStreak: "Số ngày đăng nhập liên tiếp", 
    startJourney: "Bắt đầu hành trình của bạn ngay bây giờ",
    goHome: "để bắt đầu khám phá các lộ trình",
    goHomeLink: "Về trang chủ",
    continueFollowing: "TIẾP TỤC THEO DÕI",
    loginRequiredError: "Vui lòng đăng nhập để xem tiến độ của bạn.",
    statsError: "Không thể tải số liệu thống kê: ",
    progressError: "Không thể tải tiến độ: ",
    visitLogsError: "Không thể tải nhật ký truy cập: ", 
    enrollError: "Không thể tải thông tin đăng ký: ",
    unknownError: "Lỗi không xác định",
    networkError: "Lỗi mạng. Vui lòng thử lại sau.",
    completedOn: "Hoàn thành vào",
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

    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError(translations.loginRequiredError);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch stats data
        const statsResponse = await fetch('http://localhost:8000/api/status-count-by-user/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          setStatsData(statsResult.data || { done_count: 0, pending_or_skip_count: 0 });
        } else {
          const statsErrorData = await statsResponse.json();
          setError(`${translations.statsError}${statsErrorData.message || translations.unknownError}`);
          return;
        }

        // Fetch visit logs data
        const visitLogsResponse = await fetch('http://localhost:8000/api/visit-logs/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (visitLogsResponse.ok) {
          const visitLogsResult = await visitLogsResponse.json();
          const visitLogsData = visitLogsResult.data || [];
          const recentStreak = visitLogsData.length > 0 ? visitLogsData[0].login_streak : 0;
          setLatestStreak(recentStreak);
        } else {
          const visitLogsErrorData = await visitLogsResponse.json();
          setError(`${translations.visitLogsError}${visitLogsErrorData.message || translations.unknownError}`);
          return;
        }

        // Fetch progress data
        const progressResponse = await fetch('http://localhost:8000/api/roadmap-progress/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (progressResponse.ok) {
          const progressResult = await progressResponse.json();
          let rawProgressData = progressResult.data || [];
          const titlesToTranslate = rawProgressData.map(item => item.roadmap_title);
          const translatedTitles = await translateText(titlesToTranslate, currentLang);
          const translatedProgressData = rawProgressData.map((item, index) => ({
            ...item,
            roadmap_title: decodeHtmlEntities(translatedTitles[index] || item.roadmap_title),
          }));

          // Fetch all enrolls for the user
          const enrollResponse = await fetch('http://localhost:8000/api/enrolls/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          let enrollMap = new Map();
          if (enrollResponse.ok) {
            const enrollResult = await enrollResponse.json();
            const enrollData = enrollResult.data || [];
            // Create a map of RoadmapID to completed_at
            enrollData.forEach(enroll => {
              if (enroll.completed_at) {
                enrollMap.set(enroll.RoadmapID, enroll.completed_at);
              }
            });
          } else {
            const enrollErrorData = await enrollResponse.json();
            console.error(`${translations.enrollError}${enrollErrorData.message || translations.unknownError}`);
          }

          // Update progress data with completed_at for 100% completed roadmaps
          rawProgressData = translatedProgressData.map(item => ({
            ...item,
            completed_at: item.percentage_complete === 100.0 ? enrollMap.get(item.roadmap_id) || null : null,
          }));

          setProgressData(rawProgressData);
        } else {
          const progressErrorData = await progressResponse.json();
          setError(`${translations.progressError}${progressErrorData.message || translations.unknownError}`);
        }
      } catch (err) {
        setError(translations.networkError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, getToken, translations, currentLang, isLoggedIn, logout, navigate]);

  const handleRoadmapClick = (roadmapId) => {
    navigate(`/roadmap/${roadmapId}`);
  };

  if (isLoading) {
    return <div className="page-content" id="activity">{translations.loading}</div>;
  }

  if (error) {
    return (
      <div className="page-content" id="activity">
        <div className="activity-container">
          <div className="activity-empty">
            <h2>{translations.errorTitle}</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-content" id="activity">
        <div className="activity-container">
          <div className="activity-empty">
            <h2>{translations.loginPrompt}</h2>
            <p>
              <a href="/login" className="link-text">{translations.loginLink}</a> {decodeHtmlEntities(translations.loginToView)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" id="activity">
      <div className="activity-container">
        <div className="activity-stats">
          <div className="stats-item">
            <span className="stats-value">{statsData.done_count}</span>
            <span className="stats-label">{translations.topicsCompleted}</span>
          </div>
          <div className="stats-item">
            <span className="stats-value">{statsData.pending_or_skip_count}</span>
            <span className="stats-label">{translations.currentlyLearning}</span>
          </div>
          <div className="stats-item">
            <span className="stats-value">{latestStreak}</span>
            <span className="stats-label">{translations.currentStreak}</span>
          </div>
        </div>

        {progressData.length === 0 ? (
          <div className="activity-empty">
            <h2>{translations.startJourney}</h2>
            <p>
              <a href="/" className="link-text">{translations.goHomeLink}</a> {decodeHtmlEntities(translations.goHome)}.
            </p>
          </div>
        ) : (
          <>
            <h3 className="continue-following">{translations.continueFollowing}</h3>
            <div className="progress-list">
              {progressData.map((item) => (
                <div
                  key={item.roadmap_id}
                  className="progress-item"
                  onClick={() => handleRoadmapClick(item.roadmap_id)}
                >
                  <div className="progress-title-container">
                    <span className="progress-title">{item.roadmap_title}</span>
                    {item.percentage_complete === 100.0 && item.completed_at && (
                      <div className="progress-completed">
                        {translations.completedOn} {formatDate(item.completed_at)}
                      </div>
                    )}
                  </div>
                  <span className="progress-percentage">{item.percentage_complete}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ActivityPage;