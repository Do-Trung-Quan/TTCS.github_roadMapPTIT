import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './EditRoadmapPage.css';
import TopicModal from './TopicModal';
import TopicItemEditable from './TopicItemEditable';
import { FontAwesomeIcon } from '../../fontawesome';

function EditRoadmapPage({ roadmapId, onSave, onCancelEdit, onTopicAdded }) {
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
  const token = Cookies.get('access_token');

  useEffect(() => {
    const fetchRoadmapData = async () => {
      setIsLoading(true);
      setError(null);
      if (!token) {
        setError("Authentication token not found. Please login.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch roadmap details
        const roadmapResponse = await fetch(`http://localhost:8000/api/roadmaps/${roadmapId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!roadmapResponse.ok) {
          const errorData = await roadmapResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch roadmap: ${roadmapResponse.statusText}`);
        }

        const roadmapDataResponse = await roadmapResponse.json();
        console.log('Fetched roadmap data:', roadmapDataResponse);
        const roadmap = roadmapDataResponse.data || {};
        setRoadmapData({
          name: roadmap.title || '',
          description: roadmap.description || '',
        });

        // Fetch topic-roadmap mappings
        const topicRoadmapResponse = await fetch('http://localhost:8000/api/topic-roadmap/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!topicRoadmapResponse.ok) {
          const errorData = await topicRoadmapResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch topic-roadmap mappings: ${topicRoadmapResponse.statusText}`);
        }

        const topicRoadmapData = await topicRoadmapResponse.json();
        console.log('Fetched topic-roadmap data:', topicRoadmapData);
        const topicMappings = topicRoadmapData.data || [];

        // Lọc các topic liên quan đến roadmap hiện tại
        const relatedTopicMappings = topicMappings.filter(mapping => mapping.RoadmapID === roadmapId);

        // Fetch chi tiết các topic liên quan và gộp với mapping
        const topicDetailsPromises = relatedTopicMappings.map(async (mapping) => {
          const topicResponse = await fetch(`http://localhost:8000/api/topics/${mapping.TopicID}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!topicResponse.ok) {
            console.error(`Failed to fetch topic ${mapping.TopicID}: ${topicResponse.statusText}`);
            return null;
          }

          const topicData = await topicResponse.json();
          console.log(`Workspaceed topic ${mapping.TopicID} data:`, topicData);
          const topicDetail = topicData.data || null;
          if (topicDetail) {
            // Ensure the 'id' property stores the topic-roadmap mapping ID
            topicDetail.id = mapping.id; // Use the mapping ID for unlinking
            topicDetail.TopicID = mapping.TopicID; // Keep TopicID for fetching resources/exercises
            topicDetail.topic_order = mapping.topic_order;
            topicDetail.topic_name = mapping.topic_name || topicDetail.title; // Sử dụng topic_name từ mapping hoặc title từ topic
          }
          return topicDetail;
        });

        const topicDetails = (await Promise.all(topicDetailsPromises)).filter(topic => topic !== null);
        setTopics(topicDetails);
      } catch (err) {
        console.error('Error fetching roadmap or topics:', err);
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
      setError("No roadmap ID provided for editing.");
    }
  }, [roadmapId, token]); // Added token to dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoadmapData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!token) {
      setError("Authentication token not found. Please login.");
      return;
    }

    const payload = {
      title: roadmapData.name,
      description: roadmapData.description,
    };
    console.log('Sending payload to update roadmap:', payload);

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
        console.log('API error response:', errorData);
        const errorDetails = errorData.errors
          ? Object.entries(errorData.errors).map(([key, value]) => `${key}: ${value}`).join(', ')
          : errorData.message || errorData.detail || `Failed to update roadmap: ${response.statusText}`;
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('Updated roadmap data:', data);
      setSuccessMessage(data.message || "Roadmap updated successfully.");

      setTimeout(() => {
        setSuccessMessage(null);
        if (onSave) {
          onSave(roadmapId, roadmapData);
        }
        if (onCancelEdit) {
          onCancelEdit();
        }
      }, 3000);
    } catch (err) {
      console.error('Update roadmap error:', err);
      setError(err.message);
    }
  };

  const handleAddTopicClick = () => {
    setIsTopicModalOpen(true);
  };

  const handleCloseTopicModal = () => {
    setIsTopicModalOpen(false);
  };

  const handleCreateNewTopic = (newTopicData) => {
    console.log("Created new topic in EditRoadmapPage:", newTopicData);
    // Assuming newTopicData contains the created topic's details including its ID
    // We then treat this as adding an existing topic to the roadmap
    handleAddExistingTopic([newTopicData]);
  };

  const handleAddExistingTopic = async (selectedTopics) => {
    console.log("Attempting to add existing topics:", selectedTopics, "to roadmap:", roadmapId);
    if (!token) {
      setError("Authentication token not found. Please login.");
      return;
    }

    try {
      // Fetch current topics to determine the correct order
      const topicRoadmapResponse = await fetch('http://localhost:8000/api/topic-roadmap/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!topicRoadmapResponse.ok) {
        const errorData = await topicRoadmapResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch existing topic-roadmap mappings: ${topicRoadmapResponse.statusText}`);
      }

      const topicRoadmapData = await topicRoadmapResponse.json();
      const topicMappings = topicRoadmapData.data || [];
      const relatedTopicMappings = topicMappings.filter(mapping => mapping.RoadmapID === roadmapId);
      const maxOrder = relatedTopicMappings.length > 0 ? Math.max(...relatedTopicMappings.map(t => t.topic_order || 0)) : 0;


      const newlyAddedTopics = [];
      for (const topic of selectedTopics) {
        const payload = {
          TopicID: topic.id, // Use the ID of the selected topic
          RoadmapID: roadmapId,
          topic_order: maxOrder + 1 + selectedTopics.indexOf(topic), // Assign sequential order
        };

        console.log('Sending payload to link topic-roadmap:', payload);

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
          console.log('API error response:', errorData);
          throw new Error(errorData.detail || `Failed to link topic-roadmap: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Linked topic-roadmap data:', data);

        // Fetch the full topic details to add to the state
        const topicResponse = await fetch(`http://localhost:8000/api/topics/${payload.TopicID}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!topicResponse.ok) {
          console.error(`Failed to fetch topic details after linking ${payload.TopicID}: ${topicResponse.statusText}`);
          continue; // Skip this topic if details can't be fetched
        }

        const topicData = await topicResponse.json();
        const topicDetail = topicData.data || null;
        if (topicDetail) {
           // Ensure the 'id' property stores the topic-roadmap mapping ID from the POST response
          topicDetail.id = data.data.id;
          topicDetail.TopicID = payload.TopicID; // Keep TopicID
          topicDetail.topic_order = payload.topic_order;
          topicDetail.topic_name = data.data.topic_name || topicDetail.title;
          newlyAddedTopics.push(topicDetail);
        }
      }

       // Update state with all newly added topics
      setTopics(prevTopics => [...prevTopics, ...newlyAddedTopics]);

      setSuccessMessage("Topic(s) added successfully.");

      setTimeout(() => {
        setSuccessMessage(null);
        if (onTopicAdded) {
          onTopicAdded(); // Notify parent component if needed
        }
      }, 3000);
    } catch (err) {
      console.error('Add existing topic error:', err);
      setError(err.message);
    }

    handleCloseTopicModal();
  };


  const handleEditTopicClick = (topic) => {
    setEditingTopic(topic);
    setIsTopicEditModalOpen(true);
  };

  const handleCloseTopicEditModal = () => {
    setIsTopicEditModalOpen(false);
    setEditingTopic(null);
  };

  const handleSaveTopic = async (topicData) => {
     if (!token || !editingTopic) {
        setError("Authentication token not found or no topic selected for editing.");
        return;
     }
    try {
      // Use editingTopic.TopicID to update the actual topic details
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
        throw new Error(errorData.detail || `Failed to update topic: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Updated topic data:', data);

      // Cập nhật danh sách topics trong state
      setTopics(prevTopics =>
        prevTopics.map(t =>
          // Find the topic by its TopicID
          t.TopicID === editingTopic.TopicID
            ? { ...t, title: topicData.title, description: topicData.description, topic_name: topicData.title }
            : t
        )
      );

      setSuccessMessage("Topic updated successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating topic:', err);
      setError(err.message);
    }
    handleCloseTopicEditModal();
  };

  const handleDeleteTopicClick = (topic) => {
    setDeleteTopicModal(topic);
  };

  const handleUnlinkTopic = async (topicRoadmapId) => {
     if (!token) {
        setError("Authentication token not found. Please login.");
        return;
     }
    try {
      // Use the topicRoadmapId to delete the specific link
      const response = await fetch(`http://localhost:8000/api/topic-roadmap/${topicRoadmapId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to unlink topic: ${response.statusText}`);
      }

      // Remove the topic with the matching topicRoadmapId from the state
      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicRoadmapId));
      setSuccessMessage("Topic unlinked successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
      if (onTopicAdded) onTopicAdded();
    } catch (err) {
      console.error('Error unlinking topic:', err);
      setError(err.message);
    }
    setDeleteTopicModal(null);
  };

  const handleDeleteTopicPermanently = async (topicId) => {
     if (!token) {
        setError("Authentication token not found. Please login.");
        return;
     }
    try {
      // Use the TopicId to delete the topic permanently
      const response = await fetch(`http://localhost:8000/api/topics/${topicId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete topic: ${response.statusText}`);
      }

      // Remove all instances of this TopicID from the state (in case it was linked multiple times)
      setTopics(prevTopics => prevTopics.filter(topic => topic.TopicID !== topicId));
      setSuccessMessage("Topic deleted permanently.");
      setTimeout(() => setSuccessMessage(null), 3000);
      if (onTopicAdded) onTopicAdded();
    } catch (err) {
      console.error('Error deleting topic permanently:', err);
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
          <h3>No topics yet</h3>
          <p>Add topics to build your roadmap</p>
        </div>
      );
    }

    return (
      <div className="topic-list">
        {topics.map((topic, index) => (
          // Use topic.id (the topic-roadmap ID) as the key for list rendering
          // Removed the outer topic-header div and buttons
          <TopicItemEditable
            key={topic.id || `${topic.TopicID}-${index}`}
            topic={topic}
            // Pass the handler functions down to TopicItemEditable
            onEditTopic={() => handleEditTopicClick(topic)}
            onDeleteTopicClick={() => handleDeleteTopicClick(topic)} // Use a different prop name
          >
            {/* Pass the topic name as children to TopicItemEditable */}
            {topic.topic_name || 'Unnamed Topic'}
          </TopicItemEditable>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading roadmap data...</div>;
  }

  if (error) {
    return <div className="error-message" style={{textAlign: 'center', color: 'red'}}>{error}</div>;
  }

  return (
    <div className="page-content" id="edit-roadmap">
      <div className="edit-roadmap-container">
        <div className="edit-roadmap-header">
          <h1>Edit roadmap</h1>
          <button
            className="save-changes-btn"
            onClick={handleSaveChanges}
          >
            Save changes
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="roadmap-name-edit">Roadmap name:</label>
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
          <label htmlFor="roadmap-description-edit">Description:</label>
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
            <h2>Topics</h2>
            <button
              className="add-topic-btn"
              onClick={handleAddTopicClick}
            >
              Add topic
            </button>
          </div>

          {renderTopicList()}
        </div>
      </div>

      {successMessage && <p style={{textAlign: 'center', color: 'green'}}>{successMessage}</p>}

      <TopicModal
        isVisible={isTopicModalOpen}
        onClose={handleCloseTopicModal}
        onCreateNew={handleCreateNewTopic}
        onAddExisting={handleAddExistingTopic}
        roadmapId={roadmapId}
      />

      {isTopicEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseTopicEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Topic</h2>
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
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingTopic?.title || ''} // Use optional chaining
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    defaultValue={editingTopic?.description || ''} // Use optional chaining
                  />
                </div>
                <button type="submit" className="modal-save-btn">Save</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTopicModal && (
        <div className="modal-overlay" onClick={() => setDeleteTopicModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Topic: {deleteTopicModal.topic_name}</h2>
              <button className="modal-close-btn" onClick={() => setDeleteTopicModal(null)}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="modal-body">
              <p>Choose an action:</p>
              <button
                className="modal-btn unlink-btn"
                // Pass the topic-roadmap ID (topic.id) to handleUnlinkTopic
                onClick={() => handleUnlinkTopic(deleteTopicModal.id)}
              >
                Unlink Topic from Roadmap
              </button>
              <button
                className="modal-btn delete-btn"
                 // Pass the TopicID to handleDeleteTopicPermanently
                onClick={() => handleDeleteTopicPermanently(deleteTopicModal.TopicID)}
              >
                Delete Topic Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditRoadmapPage;