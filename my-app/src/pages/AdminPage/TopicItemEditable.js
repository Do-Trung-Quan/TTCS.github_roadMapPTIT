import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import './TopicItemEditable.css';
import ResourceFormModal from './ResourceFormModal';
import ExerciseFormModal from './ExerciseFormModal';
import QuizManagerModal from './QuizManagerModal';
import { FontAwesomeIcon } from '../../fontawesome';

// Added onEditTopic and onDeleteTopicClick props
function TopicItemEditable({ topic, onEditTopic, onDeleteTopicClick, children }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [resources, setResources] = useState([]);
  const [exercises, setExercises] = useState([]);
  const token = Cookies.get('access_token');

  const fetchResources = useCallback(async () => {
    if (!token || !topic?.TopicID) { // Added check for topic?.TopicID
      console.warn("Token or TopicID not available, skipping resource fetch.");
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/resources/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      console.log('Fetched all resources:', data); // Log all fetched resources
      console.log('Current topic.TopicID for filtering resources:', topic.TopicID); // Log the TopicID being used for filtering
      const filteredResources = (data.data || []).filter(r => r.topic === topic.TopicID);
      console.log(`Filtered resources for TopicID ${topic.TopicID}:`, filteredResources); // Log filtered resources
      setResources(filteredResources);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  }, [token, topic?.TopicID]); // Added topic?.TopicID to dependency array

  const fetchExercises = useCallback(async () => {
    if (!token || !topic?.TopicID) { // Added check for topic?.TopicID
       console.warn("Token or TopicID not available, skipping exercise fetch.");
       return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/exercises/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch exercises');
      const data = await response.json();
      console.log('Fetched all exercises:', data); // Log all fetched exercises
      console.log('Current topic.TopicID for filtering exercises:', topic.TopicID); // Log the TopicID being used for filtering
      const filteredExercises = (data.data || []).filter(e => e.topic === topic.TopicID);
       console.log(`Filtered exercises for TopicID ${topic.TopicID}:`, filteredExercises); // Log filtered exercises
      setExercises(filteredExercises);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  }, [token, topic?.TopicID]); // Added topic?.TopicID to dependency array

  useEffect(() => {
    // Fetch resources and exercises when details are open and topic.TopicID is available
    if (isDetailsOpen && topic?.TopicID) {
      fetchResources();
      fetchExercises();
    }
  }, [isDetailsOpen, topic?.TopicID, fetchResources, fetchExercises]); // Added topic?.TopicID to dependency array

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const handleAddResourceClick = () => {
    setEditingResource(null);
    setIsResourceModalOpen(true);
  };

  const handleEditResourceClick = (resource) => {
    setEditingResource(resource);
    setIsResourceModalOpen(true);
  };

  const handleCloseResourceModal = () => {
    setIsResourceModalOpen(false);
    setEditingResource(null);
  };

  const handleSaveResource = async (resourceData) => {
    console.log("Submit resource data:", resourceData, "for topic:", topic?.TopicID); // Use optional chaining
    if (!token || !topic?.TopicID) return; // Added check for topic?.TopicID
    const method = editingResource ? 'PUT' : 'POST';
    const url = editingResource
      ? `http://localhost:8000/api/resources/${editingResource.id}/`
      : 'http://localhost:8000/api/resources/';
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Ensure topic is sent as topic.TopicID
        body: JSON.stringify({ ...resourceData, topic: topic.TopicID, resource_type: resourceData.resource_type }),
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(errorData.detail || `Failed to save resource: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Saved resource data:', data);
      fetchResources(); // Refresh the list
    } catch (err) {
      console.error('Error saving resource:', err);
      // Optionally set an error state to display to the user
    }
    handleCloseResourceModal();
  };

  const handleAddExerciseClick = () => {
    setEditingExercise(null);
    setIsExerciseModalOpen(true);
  };

  const handleEditExerciseClick = (exercise) => {
    setEditingExercise(exercise);
    setIsExerciseModalOpen(true);
  };

  const handleCloseExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setEditingExercise(null);
  };

  const handleSaveExercise = async (exerciseData) => {
    console.log("Submit exercise data:", exerciseData, "for topic:", topic?.TopicID); // Use optional chaining
    if (!token || !topic?.TopicID) return; // Added check for topic?.TopicID
    const method = editingExercise ? 'PUT' : 'POST';
    const url = editingExercise
      ? `http://localhost:8000/api/exercises/${editingExercise.id}/`
      : 'http://localhost:8000/api/exercises/';
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
         // Ensure topic is sent as topic.TopicID
        body: JSON.stringify({ ...exerciseData, topic: topic.TopicID }),
      });
       if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(errorData.detail || `Failed to save exercise: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Saved exercise data:', data);
      fetchExercises(); // Refresh the list
    } catch (err) {
      console.error('Error saving exercise:', err);
       // Optionally set an error state to display to the user
    }
    handleCloseExerciseModal();
  };

  const handleDeleteResourceClick = async (resourceId) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/resources/${resourceId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           console.error('API error response:', errorData);
           throw new Error(errorData.detail || `Failed to delete resource: ${response.statusText}`);
      }
      console.log('Deleted resource:', resourceId);
      fetchResources(); // Refresh the list
    } catch (err) {
      console.error('Error deleting resource:', err);
       // Optionally set an error state to display to the user
    }
  };

  const handleDeleteExerciseClick = async (exerciseId) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/exercises/${exerciseId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(errorData.detail || `Failed to delete exercise: ${response.statusText}`);
      }
      console.log('Deleted exercise:', exerciseId);
      fetchExercises(); // Refresh the list
    } catch (err) {
      console.error('Error deleting exercise:', err);
       // Optionally set an error state to display to the user
    }
  };

  const handleManageQuizClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsQuizModalOpen(true);
  };

  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
    setSelectedExercise(null);
  };

  const getResourceTypeIcon = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'article': return 'file-alt';
      case 'video': return 'video';
      case 'tutorial': return 'graduation-cap';
      case 'book': return 'book';
      // Add more cases for other resource types if needed
      default: return 'link'; // Default icon
    }
  };

  return (
    <div className="topic-item-editable">
      {/* Topic header always visible */}
      <div className="topic-header-summary" onClick={toggleDetails}>
        {/* Children typically renders the topic name */}
        <span className="topic-name">{children}</span>
        <span className={`details-toggle-icon ${isDetailsOpen ? 'open' : ''}`}>
          <FontAwesomeIcon icon={isDetailsOpen ? 'chevron-up' : 'chevron-down'} />
        </span>
        {/* Add Edit and Delete buttons here */}
        <div className="topic-actions-within-item"> {/* Added a new class for clarity */}
             <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEditTopic(topic); }}>
                <FontAwesomeIcon icon="pencil" title="Edit Topic" /> {/* Added tooltip */}
             </button>
             <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteTopicClick(topic); }}> {/* Use the new prop name */}
                <FontAwesomeIcon icon="trash" title="Delete Topic" /> {/* Added tooltip */}
             </button>
        </div>
      </div>

      {/* Topic details section (resources and exercises) */}
      {isDetailsOpen && (
        <div className="topic-details">
          <div className="topic-resources-section">
            <h4>Resources</h4>
            <button className="add-item-btn" onClick={handleAddResourceClick}>+ Add Resource</button>
            {resources.length > 0 ? (
              <ul>
                {resources.map(resource => (
                  <li key={resource.id}>
                    <span className="resource-item-content"> {/* Added a span for content */}
                       {/* Added title attribute for tooltip */}
                      <FontAwesomeIcon icon={getResourceTypeIcon(resource.resource_type_name)} title={resource.resource_type_name || 'Resource'} />
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                        {resource.title}
                      </a>
                      {/* Removed the resource type name text */}
                    </span>
                    <span className="item-actions">
                      <button className="action-btn edit-btn" onClick={() => handleEditResourceClick(resource)}>
                        <FontAwesomeIcon icon="pencil" title="Edit Resource" /> {/* Added tooltip */}
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteResourceClick(resource.id)}>
                        <FontAwesomeIcon icon="times" title="Delete Resource" /> {/* Added tooltip */}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">No resources added yet.</p>
            )}
          </div>

          <div className="topic-exercises-section">
            <h4>Exercises</h4>
            <button className="add-item-btn" onClick={handleAddExerciseClick}>+ Add Exercise</button>
            {exercises.length > 0 ? (
              <ul>
                {exercises.map(exercise => (
                  <li key={exercise.id}>
                    <span className="exercise-item-content"> {/* Added a span for content */}
                       {/* Added title attribute for tooltip */}
                      <FontAwesomeIcon icon="laptop-code" title="Exercise" />
                      {exercise.title}
                      <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>({exercise.difficulty})</span>
                    </span>
                    <span className="item-actions">
                      <button className="action-btn manage-quiz-btn" onClick={() => handleManageQuizClick(exercise)}>
                        <FontAwesomeIcon icon="question-circle" title="Manage Quiz" /> Manage Quiz {/* Added tooltip */}
                      </button>
                      <button className="action-btn edit-btn" onClick={() => handleEditExerciseClick(exercise)}>
                        <FontAwesomeIcon icon="pencil" title="Edit Exercise" /> {/* Added tooltip */}
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteExerciseClick(exercise.id)}>
                        <FontAwesomeIcon icon="times" title="Delete Exercise" /> {/* Added tooltip */}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items-message">No exercises added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Modals for adding/editing resources, exercises, and managing quizzes */}
      <ResourceFormModal
        isVisible={isResourceModalOpen}
        onClose={handleCloseResourceModal}
        onSubmit={handleSaveResource}
        topicId={topic?.TopicID} // Pass TopicID, use optional chaining
        initialData={editingResource}
      />
      <ExerciseFormModal
        isVisible={isExerciseModalOpen}
        onClose={handleCloseExerciseModal}
        onSubmit={handleSaveExercise}
        topicId={topic?.TopicID} // Pass TopicID, use optional chaining
        initialData={editingExercise}
      />
      <QuizManagerModal
        isVisible={isQuizModalOpen}
        onClose={handleCloseQuizModal}
        exercise={selectedExercise}
      />
    </div>
  );
}

export default TopicItemEditable;