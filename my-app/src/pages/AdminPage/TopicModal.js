import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './TopicModal.css';

function TopicModal({ isVisible, onClose, onCreateNew, onAddExisting, roadmapId }) {
  const [newTopicData, setNewTopicData] = useState({
    name: '',
    description: '',
  });
  const [existingTopicsList, setExistingTopicsList] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [existingError, setExistingError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isVisible) {
      const fetchExistingTopics = async () => {
        setIsLoadingExisting(true);
        setExistingError(null);
        const token = Cookies.get('access_token');
        if (!token) {
          setExistingError("Authentication token not found. Please login.");
          setIsLoadingExisting(false);
          return;
        }

        try {
          // Fetch danh sách topic-roadmap để biết topic nào đã được gán
          const topicRoadmapResponse = await fetch('http://localhost:8000/api/topic-roadmap/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!topicRoadmapResponse.ok) {
            throw new Error('Failed to fetch topic-roadmap mappings');
          }

          const topicRoadmapData = await topicRoadmapResponse.json();
          const mappings = topicRoadmapData.data || [];
          const assigned = mappings
            .filter(mapping => mapping.RoadmapID === roadmapId)
            .map(mapping => mapping.TopicID);

          // Fetch danh sách tất cả topic
          const response = await fetch('http://localhost:8000/api/topics/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch topics: ${response.statusText}`);
          }

          const responseData = await response.json();
          console.log('Fetched topics:', responseData);
          const topics = responseData.data || [];
          // Loại bỏ các topic đã được gán
          const availableTopics = topics.filter(topic => !assigned.includes(topic.id));
          setExistingTopicsList(availableTopics);
        } catch (err) {
          console.error('Error fetching existing topics:', err);
          setExistingError(err.message);
          setExistingTopicsList([]);
        } finally {
          setIsLoadingExisting(false);
        }
      };
      fetchExistingTopics();
    } else {
      setExistingTopicsList([]);
      setSelectedTopics([]);
    }
  }, [isVisible, roadmapId]);

  if (!isVisible) {
    return null;
  }

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopicData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCreateFormSubmit = async (event) => {
    event.preventDefault();

    if (!newTopicData.name.trim()) {
      setCreateError("Topic name is required.");
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      setCreateError("Authentication token not found. Please login.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setSuccessMessage(null);

    const payload = {
      title: newTopicData.name,
      description: newTopicData.description,
    };
    console.log('Sending payload to create topic:', payload);

    try {
      const response = await fetch('http://localhost:8000/api/topics/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('API error response:', errorData);
        throw new Error(errorData.detail || errorData.message || `Failed to create topic: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Created topic data:', data);
      const createdTopic = data.data;
      setSuccessMessage(data.message || "Topic created successfully.");

      setTimeout(() => {
        if (onCreateNew) {
          onCreateNew(createdTopic);
        }
        setNewTopicData({ name: '', description: '' });
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Create topic error:', err);
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTopicSelection = (topicId) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  const handleAddExistingSubmit = () => {
    if (selectedTopics.length === 0) {
      setExistingError("Please select at least one topic to add.");
      return;
    }

    const topicsToAdd = existingTopicsList.filter(topic => selectedTopics.includes(topic.id));
    console.log("Adding selected existing topics:", topicsToAdd);

    if (onAddExisting) {
      onAddExisting(topicsToAdd);
    }
  };

  const handleCancelOrClose = () => {
    setNewTopicData({ name: '', description: '' });
    setSelectedTopics([]);
    setCreateError(null);
    setSuccessMessage(null);
    setExistingError(null);
    onClose();
  };

  const renderExistingTopicsTable = () => {
    const topicsToDisplay = existingTopicsList.length > 0 ? existingTopicsList : [];

    if (isLoadingExisting) {
      return <p style={{textAlign: 'center'}}>Loading existing topics...</p>;
    }
    if (existingError) {
      return <p style={{textAlign: 'center', color: 'red'}}>{existingError}</p>;
    }
    if (topicsToDisplay.length === 0) {
      return <p style={{textAlign: 'center'}}>No available topics to add.</p>;
    }

    return (
      <div className="topic-table-container">
        <table className="topic-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {topicsToDisplay.map((topic, index) => (
              <tr key={topic.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic.id)}
                    onChange={() => handleTopicSelection(topic.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{topic.title}</td>
                <td>{topic.description || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create Topic</h3>
          <button className="modal-close-btn" onClick={handleCancelOrClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="topic-creation-section">
            <h4>Create new topic</h4>
            {createError && <p style={{color: 'red', textAlign: 'center'}}>{createError}</p>}
            {successMessage && <p style={{color: 'green', textAlign: 'center'}}>{successMessage}</p>}
            <form onSubmit={handleCreateFormSubmit}>
              <div className="form-group">
                <label htmlFor="new-topic-name">Topic name:</label>
                <input
                  type="text"
                  className="form-control-us"
                  id="new-topic-name"
                  name="name"
                  placeholder="Enter topic name"
                  required
                  value={newTopicData.name}
                  onChange={handleNewInputChange}
                  disabled={isCreating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-topic-desc">Description:</label>
                <textarea
                  className="form-control-us"
                  id="new-topic-desc"
                  name="description"
                  placeholder="Enter description"
                  rows="4"
                  value={newTopicData.description}
                  onChange={handleNewInputChange}
                  disabled={isCreating}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelOrClose} disabled={isCreating}>Cancel</button>
                <button type="submit" className="create-btn" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Add topic'}
                </button>
              </div>
            </form>
          </div>
          <div className="topic-divider"></div>
          <div className="topic-existing-section">
            <h4>Add existing topic</h4>
            <p className="section-instruction">Select topics from the list below:</p>
            {renderExistingTopicsTable()}
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelOrClose}>Cancel</button>
              <button type="button" className="create-btn" onClick={handleAddExistingSubmit}>Add selected topics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicModal;