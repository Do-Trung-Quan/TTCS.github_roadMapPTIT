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
        setError('Please log in to view your progress.');
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
          setError(`Failed to fetch stats: ${statsErrorData.message || 'Unknown error'}`);
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
          setError(`Failed to fetch progress: ${progressErrorData.message || 'Unknown error'}`);
        }
      } catch (err) {
        setError('Network error. Please try again later.');
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
    return <div className="page-content" id="activity">Loading...</div>;
  }

  if (error) {
    return (
      <div className="page-content" id="activity">
        <div className="activity-container">
          <div className="activity-empty">
            <h2>Error</h2>
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
            <h2>Please Log In</h2>
            <p>
              <a href="/login" className="link-text">Log in</a> to view your progress.
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
            <span className="stats-label">Topics Completed</span>
          </div>
          <div className="stats-item">
            <span className="stats-value">{statsData.pending_or_skip_count}</span>
            <span className="stats-label">Currently Learning</span>
          </div>
        </div>

        {progressData.length === 0 ? (
          <div className="activity-empty">
            <h2>Start your progress now</h2>
            <p>
              <a href="/" className="link-text">Go to Home</a> to start exploring roadmaps.
            </p>
          </div>
        ) : (
          <>
            <h3 className="continue-following">CONTINUE FOLLOWING</h3>
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