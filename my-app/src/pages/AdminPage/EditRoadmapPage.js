import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './EditRoadmapPage.css';
import TopicModal from './TopicModal';
import TopicItemEditable from './TopicItemEditable';
import { FontAwesomeIcon } from '../../fontawesome';

function EditRoadmapPage({ currentLang = 'vi', setCurrentLang }) {
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [roadmapData, setRoadmapData] = useState({
    name: '',
    description: '',
  });
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [isTopicEditModalOpen, setIsTopicEditModalOpen] = useState(false);
  const [deleteTopicModal, setDeleteTopicModal] = useState(null);
  const token = getToken();

  const initialTranslations = useMemo(() => ({
    editRoadmapTitle: 'Chỉnh sửa lộ trình',
    saveChangesButton: 'Lưu thay đổi',
    roadmapNameLabel: 'Tên lộ trình:',
    descriptionLabel: 'Mô tả:',
    topicsSectionTitle: 'Chủ đề',
    addTopicButton: 'Thêm chủ đề',
    noTopicsTitle: 'Chưa có chủ đề nào',
    noTopicsDescription: 'Thêm chủ đề để xây dựng lộ trình của bạn',
    unnamedTopic: 'Chủ đề không tên',
    loadingMessage: 'Đang tải dữ liệu lộ trình...',
    noRoadmapIdError: 'Không cung cấp ID lộ trình để chỉnh sửa.',
    noTokenError: 'Không tìm thấy mã xác thực. Vui lòng đăng nhập.',
    successUpdateRoadmap: 'Đã cập nhật lộ trình thành công.',
    successAddTopic: 'Đã thêm chủ đề thành công.',
    successUpdateTopic: 'Đã cập nhật chủ đề thành công.',
    successUnlinkTopic: 'Đã hủy liên kết chủ đề thành công.',
    successDeleteTopic: 'Đã xóa chủ đề vĩnh viễn.',
    noTokenOrTopicError: 'Không tìm thấy mã xác thực hoặc không có chủ đề nào được chọn để chỉnh sửa.',
    editTopicModalTitle: 'Chỉnh sửa chủ đề',
    deleteTopicModalTitle: 'Xóa chủ đề: {topic_name}',
    deleteModalActionPrompt: 'Chọn một hành động:',
    unlinkTopicButton: 'Hủy liên kết chủ đề khỏi lộ trình',
    deleteTopicPermanentlyButton: 'Xóa vĩnh viễn chủ đề',
    topicTitleLabel: 'Tiêu đề:',
    topicDescriptionLabel: 'Mô tả:',
    saveButton: 'Lưu',
    tokenExpired: 'Phiên đăng nhập đã hết hạn. Đang chuyển hướng về trang đăng nhập...',
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const decodeHtmlEntities = (str) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

  const translateText = async (texts, targetLang) => {
    console.log('EditRoadmapPage translateText input:', { texts, targetLang });
    try {
      const response = await fetch('http://localhost:8000/api/translate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, target_lang: targetLang }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      console.log('EditRoadmapPage translateText response:', data);
      return data.translated || texts;
    } catch (error) {
      console.error('Lỗi dịch in EditRoadmapPage:', error);
      return texts;
    }
  };

  useEffect(() => {
    console.log('EditRoadmapPage useEffect triggered with currentLang:', currentLang);
    const translateContent = async () => {
      console.log('EditRoadmapPage initialTranslations:', initialTranslations);
      if (currentLang === 'vi') {
        setTranslations(initialTranslations);
        console.log('EditRoadmapPage setTranslations to initial (vi):', initialTranslations);
        return;
      }
      const textsToTranslate = Object.values(initialTranslations);
      console.log('EditRoadmapPage textsToTranslate:', textsToTranslate);
      const translatedTexts = await translateText(textsToTranslate, currentLang);
      console.log('EditRoadmapPage translatedTexts:', translatedTexts);
      const updatedTranslations = {};
      Object.keys(initialTranslations).forEach((key, index) => {
        updatedTranslations[key] = decodeHtmlEntities(translatedTexts[index] || initialTranslations[key]);
      });
      console.log('EditRoadmapPage updatedTranslations:', updatedTranslations);
      setTranslations(updatedTranslations);
    };
    translateContent();
  }, [currentLang, initialTranslations]);

  useEffect(() => {
    console.log('EditRoadmapPage translations state updated:', translations);
  }, [translations]);

  // Wrap checkTokenExpiration in useCallback
  const checkTokenExpiration = useCallback((token) => {
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
      setError(translations.noTokenError);
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      return false;
    }
  }, [logout, navigate, translations.tokenExpired, translations.noTokenError, setError]); // Add all external dependencies here

  useEffect(() => {
    const fetchRoadmapData = async () => {
      setIsLoading(true);
      setError(null);
      if (!token) {
        setError(translations.noTokenError);
        setIsLoading(false);
        return;
      }

      // Now checkTokenExpiration is stable
      if (!checkTokenExpiration(token)) return; 

      try {
        const roadmapResponse = await fetch(`http://localhost:8000/api/roadmaps/${roadmapId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!roadmapResponse.ok) {
          const errorData = await roadmapResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || `Không thể tải lộ trình: ${roadmapResponse.statusText}`);
        }

        const roadmapDataResponse = await roadmapResponse.json();
        console.log('Fetched roadmap data:', roadmapDataResponse);
        const roadmap = roadmapDataResponse.data || {};
        setRoadmapData({
          name: roadmap.title || '',
          description: roadmap.description || '',
        });

        const topicRoadmapResponse = await fetch('http://localhost:8000/api/topic-roadmap/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!topicRoadmapResponse.ok) {
          const errorData = await topicRoadmapResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || `Không thể tải ánh xạ chủ đề-lộ trình: ${topicRoadmapResponse.statusText}`);
        }

        const topicRoadmapData = await topicRoadmapResponse.json();
        console.log('Fetched topic-roadmap data:', topicRoadmapData);
        const topicMappings = topicRoadmapData.data || [];
        const relatedTopicMappings = topicMappings.filter(mapping => mapping.RoadmapID === roadmapId);

        const topicDetailsPromises = relatedTopicMappings.map(async (mapping) => {
          const topicResponse = await fetch(`http://localhost:8000/api/topics/${mapping.TopicID}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!topicResponse.ok) {
            console.error(`Không thể tải chủ đề ${mapping.TopicID}: ${topicResponse.statusText}`);
            return null;
          }

          const topicData = await topicResponse.json();
          console.log(`Đã tải dữ liệu chủ đề ${mapping.TopicID}:`, topicData);
          const topicDetail = topicData.data || null;
          if (topicDetail) {
            topicDetail.id = mapping.id;
            topicDetail.TopicID = mapping.TopicID;
            topicDetail.topic_order = mapping.topic_order;
            topicDetail.topic_name = mapping.topic_name || topicDetail.title;
          }
          return topicDetail;
        });

        const topicDetails = (await Promise.all(topicDetailsPromises)).filter(topic => topic !== null);
        setTopics(topicDetails);
      } catch (err) {
        console.error('Lỗi khi tải lộ trình hoặc chủ đề:', err);
        setError(err.message);
        setRoadmapData({ name: '', description: '' });
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (roadmapId) {
      fetchRoadmapData();
    } else {
      setIsLoading(false);
      setError(translations.noRoadmapIdError);
    }
  }, [roadmapId, token, translations.noTokenError, translations.noRoadmapIdError, checkTokenExpiration]); // checkTokenExpiration is now a stable dependency

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoadmapData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!token) {
      setError(translations.noTokenError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    const payload = {
      title: roadmapData.name,
      description: roadmapData.description,
    };
    console.log('Đang gửi dữ liệu để cập nhật lộ trình:', payload);

    try {
      const response = await fetch(`http://localhost:8000/api/roadmaps/${roadmapId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Phản hồi lỗi API:', errorData);
        const errorDetails = errorData.errors
          ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
          : errorData.message || errorData.detail || `Không thể cập nhật lộ trình: ${response.statusText}`;
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('Dữ liệu lộ trình đã cập nhật:', data);
      setSuccessMessage(data.message || translations.successUpdateRoadmap);

      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/admin/roadmaps-list');
      }, 3000);
    } catch (err) {
      console.error('Lỗi cập nhật lộ trình:', err);
      setError(err.message);
    }
  };

  const handleAddTopicClick = () => {
    if (!token || !checkTokenExpiration(token)) return;
    setIsTopicModalOpen(true);
  };

  const handleCloseTopicModal = () => {
    setIsTopicModalOpen(false);
  };

  const handleCreateNewTopic = (newTopicData) => {
    console.log("Đã tạo chủ đề mới trong EditRoadmapPage:", newTopicData);
    handleAddExistingTopic([newTopicData]);
  };

  const handleAddExistingTopic = async (selectedTopics) => {
    console.log("Đang cố gắng thêm các chủ đề hiện có:", selectedTopics, "vào lộ trình:", roadmapId);
    if (!token) {
      setError(translations.noTokenError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    try {
      const topicRoadmapResponse = await fetch('http://localhost:8000/api/topic-roadmap/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!topicRoadmapResponse.ok) {
        const errorData = await topicRoadmapResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể tải ánh xạ chủ đề-lộ trình hiện có: ${topicRoadmapResponse.statusText}`);
      }

      const topicRoadmapData = await topicRoadmapResponse.json();
      const topicMappings = topicRoadmapData.data || [];
      const relatedTopicMappings = topicMappings.filter(mapping => mapping.RoadmapID === roadmapId);
      const maxOrder = relatedTopicMappings.length > 0 ? Math.max(...relatedTopicMappings.map(t => t.topic_order || 0)) : 0;

      const newlyAddedTopics = [];
      for (const topic of selectedTopics) {
        const payload = {
          TopicID: topic.id,
          RoadmapID: roadmapId,
          topic_order: maxOrder + 1 + selectedTopics.indexOf(topic),
        };

        console.log('Đang gửi dữ liệu để liên kết chủ đề-lộ trình:', payload);

        const response = await fetch('http://localhost:8000/api/topic-roadmap/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log('Phản hồi lỗi API:', errorData);
          throw new Error(errorData.detail || `Không thể liên kết chủ đề-lộ trình: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dữ liệu chủ đề-lộ trình đã liên kết:', data);

        const topicResponse = await fetch(`http://localhost:8000/api/topics/${payload.TopicID}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!topicResponse.ok) {
          console.error(`Không thể tải chi tiết chủ đề sau khi liên kết ${payload.TopicID}: ${topicResponse.statusText}`);
          continue;
        }

        const topicData = await topicResponse.json();
        const topicDetail = topicData.data || null;
        if (topicDetail) {
          topicDetail.id = data.data.id;
          topicDetail.TopicID = payload.TopicID;
          topicDetail.topic_order = payload.topic_order;
          topicDetail.topic_name = data.data.topic_name || topicDetail.title;
          newlyAddedTopics.push(topicDetail);
        }
      }

      setTopics(prevTopics => [...prevTopics, ...newlyAddedTopics]);
      setSuccessMessage(translations.successAddTopic);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Lỗi khi thêm chủ đề hiện có:', err);
      setError(err.message);
    }

    handleCloseTopicModal();
  };

  const handleEditTopicClick = (topic) => {
    if (!token || !checkTokenExpiration(token)) return;
    setEditingTopic(topic);
    setIsTopicEditModalOpen(true);
  };

  const handleCloseTopicEditModal = () => {
    setIsTopicEditModalOpen(false);
    setEditingTopic(null);
  };

  const handleSaveTopic = async (topicData) => {
    if (!token || !editingTopic) {
      setError(translations.noTokenOrTopicError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/topics/${editingTopic.TopicID}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể cập nhật chủ đề: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Dữ liệu chủ đề đã cập nhật:', data);

      setTopics(prevTopics =>
        prevTopics.map(t =>
          t.TopicID === editingTopic.TopicID
            ? { ...t, title: topicData.title, description: topicData.description, topic_name: topicData.title }
            : t
        )
      );

      setSuccessMessage(translations.successUpdateTopic);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật chủ đề:', err);
      setError(err.message);
    }
    handleCloseTopicEditModal();
  };

  const handleDeleteTopicClick = (topic) => {
    if (!token || !checkTokenExpiration(token)) return;
    setDeleteTopicModal(topic);
  };

  const handleUnlinkTopic = async (topicRoadmapId) => {
    if (!token) {
      setError(translations.noTokenError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/topic-roadmap/${topicRoadmapId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể hủy liên kết chủ đề: ${response.statusText}`);
      }

      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicRoadmapId));
      setSuccessMessage(translations.successUnlinkTopic);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi hủy liên kết chủ đề:', err);
      setError(err.message);
    }
    setDeleteTopicModal(null);
  };

  const handleDeleteTopicPermanently = async (topicId) => {
    if (!token) {
      setError(translations.noTokenError);
      return;
    }

    if (!checkTokenExpiration(token)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/topics/${topicId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể xóa chủ đề: ${response.statusText}`);
      }

      setTopics(prevTopics => prevTopics.filter(topic => topic.TopicID !== topicId));
      setSuccessMessage(translations.successDeleteTopic);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa chủ đề vĩnh viễn:', err);
      setError(err.message);
    }
    setDeleteTopicModal(null);
  };

  const renderTopicList = () => {
    if (topics.length === 0) {
      return (
        <div className="no-topics">
          <div className="topic-icon">
            <FontAwesomeIcon icon="folder-open" />
          </div>
          <h3>{translations.noTopicsTitle}</h3>
          <p>{translations.noTopicsDescription}</p>
        </div>
      );
    }

    return (
      <div className="topic-list">
        {topics.map((topic, index) => (
          <TopicItemEditable
            key={topic.id || `${topic.TopicID}-${index}`}
            topic={topic}
            onEditTopic={() => handleEditTopicClick(topic)}
            onDeleteTopicClick={() => handleDeleteTopicClick(topic)}
            currentLang={currentLang}
          >
            {topic.topic_name || translations.unnamedTopic}
          </TopicItemEditable>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div>{translations.loadingMessage}</div>;
  }

  if (error) {
    return <div className="error-message" style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div className="page-content" id="edit-roadmap">
      <div className="edit-roadmap-container">
        <div className="edit-roadmap-header">
          <h1>{translations.editRoadmapTitle}</h1>
          <button
            className="save-changes-btn"
            onClick={handleSaveChanges}
          >
            {translations.saveChangesButton}
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="roadmap-name-edit">{translations.roadmapNameLabel}</label>
          <input
            type="text"
            id="roadmap-name-edit"
            name="name"
            className="form-control-us"
            value={roadmapData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="roadmap-description-edit">{translations.descriptionLabel}</label>
          <textarea
            id="roadmap-description-edit"
            name="description"
            className="form-control-us"
            rows="4"
            value={roadmapData.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="topics-section">
          <div className="topics-header">
            <h2>{translations.topicsSectionTitle}</h2>
            <button
              className="add-topic-btn"
              onClick={handleAddTopicClick}
            >
              {translations.addTopicButton}
            </button>
          </div>

          {renderTopicList()}
        </div>
      </div>

      {successMessage && <p style={{ textAlign: 'center', color: 'green' }}>{successMessage}</p>}

      <TopicModal
        isVisible={isTopicModalOpen}
        onClose={handleCloseTopicModal}
        onCreateNew={handleCreateNewTopic}
        onAddExisting={handleAddExistingTopic}
        roadmapId={roadmapId}
        currentLang={currentLang}
      />

      {isTopicEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseTopicEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{translations.editTopicModalTitle}</h2>
              <button className="modal-close-btn" onClick={handleCloseTopicEditModal}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveTopic({
                  title: e.target.title.value,
                  description: e.target.description.value,
                });
              }}>
                <div className="form-group">
                  <label>{translations.topicTitleLabel}</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingTopic?.title || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{translations.topicDescriptionLabel}</label>
                  <textarea
                    name="description"
                    defaultValue={editingTopic?.description || ''}
                  />
                </div>
                <button type="submit" className="modal-save-btn">{translations.saveButton}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTopicModal && (
        <div className="modal-overlay" onClick={() => setDeleteTopicModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{translations.deleteTopicModalTitle.replace('{topic_name}', deleteTopicModal.topic_name)}</h2>
              <button className="modal-close-btn" onClick={() => setDeleteTopicModal(null)}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="modal-body">
              <p>{translations.deleteModalActionPrompt}</p>
              <button
                className="modal-btn unlink-btn"
                onClick={() => handleUnlinkTopic(deleteTopicModal.id)}
              >
                {translations.unlinkTopicButton}
              </button>
              <button
                className="modal-btn delete-btn"
                onClick={() => handleDeleteTopicPermanently(deleteTopicModal.TopicID)}
              >
                {translations.deleteTopicPermanentlyButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditRoadmapPage;