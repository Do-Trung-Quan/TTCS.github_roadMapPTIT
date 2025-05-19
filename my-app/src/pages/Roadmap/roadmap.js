import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";
import "./roadmap.css";
import { useParams } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

// Sử dụng STORAGE_KEY với prefix để tạo key riêng cho từng user
const STORAGE_KEY_PREFIX = "frontend_roadmap_progress_";

export default function Roadmap() {
  const { id } = useParams();
  const { user, getToken } = useAuth();
  const [roadmap, setRoadmap] = useState({ title: "", description: "" });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicDetails, setTopicDetails] = useState(null);
  const [resources, setResources] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Memoize getStorageKey to prevent useEffect dependency changes
  const getStorageKey = useCallback(() => (
    user && user.id ? `${STORAGE_KEY_PREFIX}${user.id}_${id}` : `${STORAGE_KEY_PREFIX}guest_${id}`
  ), [user, id]);

  const [nodeProgress, setNodeProgress] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : {};
  });

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);

  // Reset nodeProgress when user changes
  useEffect(() => {
    const resetProgress = () => {
      setNodeProgress({}); // Reset before refetch
    };
    resetProgress();
  }, [user]);

  // Fetch roadmap details
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/roadmaps/${id}/`);
        if (!response.ok) throw new Error("Không thể lấy roadmap");
        const result = await response.json();
        const data = result.data || {};
        setRoadmap({ title: data.title || "", description: data.description || "" });
      } catch (error) {
        console.error("Lỗi khi lấy roadmap:", error);
      }
    };
    fetchRoadmap();
  }, [id]);

  // Fetch topics and initialize nodes, edges, and progress
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/topic-roadmap/?roadmap_id=${id}`);
        if (!response.ok) throw new Error("Không thể lấy topic");
        const result = await response.json();
        const data = Array.isArray(result.data) ? result.data : [];
        if (!Array.isArray(data)) {
          console.error("Dữ liệu trả về không phải là mảng:", data);
          return;
        }
        const filteredTopics = data.filter(topic => topic.RoadmapID === id);
        const sortedTopics = filteredTopics.sort((a, b) => a.topic_order - b.topic_order);

        const topicDetailsPromises = sortedTopics.map(async (topic) => {
          const topicResponse = await fetch(`http://localhost:8000/api/topics/${topic.TopicID}/`);
          if (!topicResponse.ok) throw new Error(`Không thể lấy chi tiết topic ${topic.TopicID}`);
          const topicResult = await topicResponse.json();
          const topicData = topicResult.data || {};
          return { ...topic, topic_name: topicData.title || topic.TopicID };
        });
        const topicsWithNames = await Promise.all(topicDetailsPromises);

        const newNodes = topicsWithNames.map((topic, index) => ({
          id: topic.TopicID.toString(),
          position: { x: 300 * index, y: 0 },
          data: { label: topic.topic_name },
        }));

        const newEdges = topicsWithNames.slice(0, -1).map((topic, index) => ({
          id: `e${index}-${index + 1}`,
          source: topic.TopicID.toString(),
          target: topicsWithNames[index + 1].TopicID.toString(),
        }));

        setNodes(newNodes);
        setEdges(newEdges);

        // Reset and initialize nodeProgress for the current roadmap
        setNodeProgress(prev => {
          const updatedProgress = {};
          topicsWithNames.forEach(topic => {
            updatedProgress[topic.TopicID] = prev[topic.TopicID] || { status: "pending" };
          });
          return updatedProgress;
        });

        // Fetch user progress if authenticated
        if (user && user.id && user.role === 'user') {
          const token = getToken();
          if (token) {
            try {
              const progressResponse = await fetch(`http://localhost:8000/api/user-topic-progress/?user_id=${user.id}&roadmap_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (progressResponse.ok) {
                const progressResult = await progressResponse.json();
                const progressData = Array.isArray(progressResult.data) ? progressResult.data : [];
                setNodeProgress(prev => {
                  const updatedProgress = { ...prev };
                  progressData.forEach(item => {
                    if (updatedProgress[item.TopicID]) {
                      updatedProgress[item.TopicID] = {
                        id: item.id,
                        status: item.status,
                      };
                    }
                  });
                  return updatedProgress;
                });
              } else {
                console.error("Lỗi khi lấy user progress:", await progressResponse.json());
              }
            } catch (error) {
              console.error("Lỗi khi lấy user progress:", error);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy topic:", error);
        setNodes([]);
        setEdges([]);
      }
    };
    fetchTopics();
  }, [id, user, getToken]);

  // Fetch progress percentage and total topics from API
  const fetchProgressPercentage = useCallback(async () => {
    if ((!user || !user.id) || (user.role && user.role.toLowerCase() !== 'user')) {
      setProgressPercentage(0);
      setTotalTopics(0);
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('Không tìm thấy token để lấy phần trăm hoàn thành.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/roadmap-progress/?roadmap_id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể lấy tiến độ roadmap");
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const percentage = result.data[0].percentage_complete || 0;
        const totalTopicsCount = result.data[0].total_topics || 0;
        setProgressPercentage(Math.round(percentage));
        setTotalTopics(totalTopicsCount);
      } else {
        setProgressPercentage(0);
        setTotalTopics(0);
      }
    } catch (error) {
      console.error('Lỗi khi lấy tiến độ và tổng số topic:', error);
      setProgressPercentage(0);
      setTotalTopics(0);
    }
  }, [id, user, getToken]);

  // Update progress percentage and total topics when roadmap or user changes
  useEffect(() => {
    fetchProgressPercentage();
  }, [fetchProgressPercentage]);

  // Fetch topic details
  const fetchTopicDetails = useCallback(async (topicId) => {
    try {
      const topicResponse = await fetch(`http://localhost:8000/api/topics/${topicId}/`);
      if (!topicResponse.ok) throw new Error("Không thể lấy chi tiết topic");
      const result = await topicResponse.json(); // Fixed: Changed 'response' to 'topicResponse'
      const data = result.data || {};
      setTopicDetails({ title: data.title || "", description: data.description || "" });

      const resourcesResponse = await fetch(`http://localhost:8000/api/resources/?topic=${topicId}`);
      if (!resourcesResponse.ok) throw new Error("Không thể lấy tài nguyên");
      const resourcesResult = await resourcesResponse.json();
      const resourcesData = Array.isArray(resourcesResult.data) ? resourcesResult.data : [];
      setResources(resourcesData);

      const exercisesResponse = await fetch(`http://localhost:8000/api/exercises/?topic=${topicId}`);
      if (!exercisesResponse.ok) throw new Error("Không thể lấy bài tập");
      const exercisesResult = await exercisesResponse.json();
      const exercisesData = Array.isArray(exercisesResult.data) ? exercisesResult.data : [];
      setExercises(exercisesData);

      setSelectedExercise(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setSelectedAnswers({});
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết topic:", error);
    }
  }, []);

  // Fetch quiz questions
  const fetchQuizQuestions = useCallback(async (exerciseId) => {
    try {
      const quizResponse = await fetch(`http://localhost:8000/api/quizquestions/?exercise_id=${exerciseId}`);
      if (!quizResponse.ok) throw new Error("Không thể lấy quiz questions");
      const quizResult = await quizResponse.json();
      const quizData = Array.isArray(quizResult.data) ? quizResult.data : [];
      setQuizQuestions(quizData);

      const answerPromises = quizData.map(async (question) => {
        const response = await fetch(`http://localhost:8000/api/quizanswers/?quiz_question=${question.id}`);
        if (!response.ok) throw new Error("Không thể lấy câu trả lời");
        const result = await response.json();
        return { questionId: question.id, answers: Array.isArray(result.data) ? result.data : [] };
      });
      const answerResults = await Promise.all(answerPromises);
      const answersMap = answerResults.reduce((acc, { questionId, answers }) => {
        acc[questionId] = answers;
        return acc;
      }, {});
      setQuizAnswers(answersMap);
      setSelectedAnswers({});
    } catch (error) {
      console.error("Lỗi khi lấy quiz:", error);
    }
  }, []);

  const onNodeClick = (event, node) => {
    setSelectedTopic(node);
    fetchTopicDetails(node.id);
  };

  const closePanel = () => {
    setSelectedTopic(null);
    setTopicDetails(null);
    setResources([]);
    setExercises([]);
    setSelectedExercise(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setSelectedAnswers({});
  };

  const handleExerciseClick = (exerciseId) => {
    if (selectedExercise === exerciseId) {
      setSelectedExercise(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setSelectedAnswers({});
    } else {
      setSelectedExercise(exerciseId);
      fetchQuizQuestions(exerciseId);
    }
  };

  const handleStatusChange = async (topicId, status) => {
    if ((!user || !user.id) || (user.role && user.role.toLowerCase() !== 'user')) {
      alert("Bạn phải đăng nhập với tài khoản người dùng để thực hiện chức năng này");
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('Không tìm thấy token để cập nhật status.');
      return;
    }

    let progressId = nodeProgress[topicId]?.id;

    // If no progress ID in nodeProgress, create a new progress record (POST)
    if (!progressId) {
      try {
        const createResponse = await fetch('http://localhost:8000/api/user-topic-progress/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            TopicID: topicId,
            status: 'pending',
          }),
        });
        if (createResponse.ok) {
          const createResult = await createResponse.json();
          progressId = createResult.data.id;
          console.log('Progress created:', createResult);
        } else {
          console.error("Lỗi khi tạo progress:", await createResponse.json());
          return;
        }
      } catch (error) {
        console.error("Lỗi khi tạo progress:", error);
        return;
      }
    }

    // Update status (PUT)
    try {
      const updateResponse = await fetch(`http://localhost:8000/api/user-topic-progress/${progressId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          TopicID: topicId,
          status,
        }),
      });

      if (updateResponse.ok) {
        setNodeProgress(prev => ({
          ...prev,
          [topicId]: {
            id: progressId,
            status,
          },
        }));
        console.log('Status updated successfully');
      } else {
        console.error('Lỗi khi cập nhật status:', await updateResponse.json());
        alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật status:", error);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái.");
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(nodeProgress));
  }, [nodeProgress, getStorageKey]);

  const styledNodes = nodes.map(node => {
    const status = nodeProgress && nodeProgress[node.id]?.status || "pending";
    return {
      ...node,
      style: {
        backgroundColor: status === "done" ? "#28a745" : status === "skip" ? "#ffc107" : "#dc3545",
        border: status === "done" ? "2px solid #155724" : status === "skip" ? "2px solid #856404" : "2px solid #721c24",
        color: status === "pending" ? "#fff" : status === "skip" ? "#6c757d" : "#212529",
        textDecoration: status === "skip" ? "line-through" : "none",
        padding: "10px",
        borderRadius: "5px",
        cursor: "pointer",
      },
      data: {
        ...node.data,
        label: (
          <span>
            {node.data.label}
            {status === "done" && " ✅"}
            {status === "skip" && " ⏭️"}
          </span>
        ),
      },
    };
  });

  return (
    <>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <h1>{roadmap.title || "Front-end Roadmap"}</h1>
        <p>{roadmap.description || "Chào mừng, đây là lộ trình front-end cho các anh chị em"}</p>
        <div className="progress-container">
          <label>Tiến độ: {progressPercentage}%</label>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <p>Tổng số topic: {totalTopics}</p>
        </div>
      </div>

      <div className="roadmap-container" style={{ position: "relative", width: "100%", height: "80vh" }}>
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
          panOnDrag={false}
          zoomOnScroll={false}
          panOnScroll={false}
          zoomOnPinch={false}
          nodesDraggable={false}
          preventScrolling={false}
          style={{ cursor: "default" }}
        >
          <Background color="#aaa" gap={16} />
        </ReactFlow>

        {selectedTopic && (
          <>
            <div className="overlay" onClick={closePanel}></div>
            <div className="info-panel">
              <div className="info-panel-header">
                <h3>{topicDetails?.title || selectedTopic.data.label}</h3>
                <button onClick={closePanel}>✕</button>
              </div>
              <div className="completion-dropdown">
                <label htmlFor={`status-${selectedTopic.id}`}>Trạng thái: </label>
                <select
                  id={`status-${selectedTopic.id}`}
                  value={nodeProgress && nodeProgress[selectedTopic.id]?.status || "pending"}
                  onChange={(e) => handleStatusChange(selectedTopic.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="skip">Skip</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <h4>Mô tả:</h4>
              <p>{topicDetails?.description || "Không có mô tả."}</p>
              <h4>Free Resources:</h4>
              <ul>
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <li key={index} className={`resource-${resource.resource_type_name.toLowerCase()}`}>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        {resource.title} ({resource.resource_type_name})
                      </a>
                    </li>
                  ))
                ) : (
                  <li>Không có tài nguyên.</li>
                )}
              </ul>
              <h4>Bài tập:</h4>
              <ul>
                {exercises.length > 0 ? (
                  exercises.map((exercise, index) => (
                    <li
                      key={exercise.id || index}
                      onClick={() => handleExerciseClick(exercise.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedExercise === exercise.id ? "#e9ecef" : "transparent",
                        padding: "8px",
                        borderRadius: "5px",
                      }}
                    >
                      {exercise.title || exercise.description || "Không có tiêu đề"}
                      {selectedExercise === exercise.id && quizQuestions.length > 0 ? (
                        <div className="quiz-section">
                          {quizQuestions.map((question, index) => (
                            <div key={question.id} className="quiz-question">
                              <p>
                                Câu {index + 1}: {question.question_text}
                              </p>
                              <ul>
                                {quizAnswers[question.id]?.map((answer) => (
                                  <li
                                    key={answer.id}
                                    className={
                                      selectedAnswers[question.id] === answer.id
                                        ? answer.is_correct
                                          ? "correct"
                                          : "incorrect"
                                        : ""
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAnswerSelect(question.id, answer.id);
                                    }}
                                  >
                                    {answer.option_text}
                                    {selectedAnswers[question.id] === answer.id && (
                                      <span>{answer.is_correct ? " ✅ Đúng" : " ❌ Sai"}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : selectedExercise === exercise.id ? (
                        <div className="quiz-section">
                          <p>Không có câu hỏi quiz cho bài tập này.</p>
                        </div>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li>Không có bài tập.</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}