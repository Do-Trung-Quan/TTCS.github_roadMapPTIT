import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ActivityPage.css';

function ActivityPage() {
  const navigate = useNavigate();
  const { getToken, user } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [statsData, setStatsData] = useState({ done_count: 0, pending_or_skip_count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError('Vui lòng đăng nhập để xem tiến độ của bạn.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch stats data (Topics Completed and Currently Learning)
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
          setError(`Không thể tải số liệu thống kê: ${statsErrorData.message || 'Lỗi không xác định'}`);
          return;
        }

        // Fetch progress data (Roadmap Progress)
        const progressResponse = await fetch('http://localhost:8000/api/roadmap-progress/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (progressResponse.ok) {
          const progressResult = await progressResponse.json();
          setProgressData(progressResult.data || []);
        } else {
          const progressErrorData = await progressResponse.json();
          setError(`Không thể tải tiến độ: ${progressErrorData.message || 'Lỗi không xác định'}`);
        }
      } catch (err) {
        setError('Lỗi mạng. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, getToken]);

  const handleRoadmapClick = (roadmapId) => {
    navigate(`/roadmap/${roadmapId}`);
  };

  if (isLoading) {
    return <div className="page-content" id="activity">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="page-content" id="activity">
        <div className="activity-container">
          <div className="activity-empty">
            <h2>Lỗi</h2>
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
            <h2>Vui lòng đăng nhập</h2>
            <p>
              <a href="/login" className="link-text">Đăng nhập</a> để xem tiến độ của bạn.
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
            <span className="stats-label">Chủ đề đã hoàn thành</span>
          </div>
          <div className="stats-item">
            <span className="stats-value">{statsData.pending_or_skip_count}</span>
            <span className="stats-label">Đang học</span>
          </div>
        </div>

        {progressData.length === 0 ? (
          <div className="activity-empty">
            <h2>Bắt đầu hành trình của bạn ngay bây giờ</h2>
            <p>
              <a href="/" className="link-text">Về trang chủ</a> để bắt đầu khám phá các lộ trình.
            </p>
          </div>
        ) : (
          <>
            <h3 className="continue-following">TIẾP TỤC THEO DÕI</h3>
            <div className="progress-list">
              {progressData.map((item) => (
                <div
                  key={item.roadmap_id}
                  className="progress-item"
                  onClick={() => handleRoadmapClick(item.roadmap_id)}
                >
                  <span className="progress-title">{item.roadmap_title}</span>
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