import React, { useState, useEffect } from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";
import "./roadmap.css";
import { useParams } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = "frontend_roadmap_progress";

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
  const [nodeProgress, setNodeProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [progressPercentage, setProgressPercentage] = useState(0);

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

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/topic-roadmap/?roadmap_id=${id}`);
        if (!response.ok) throw new Error("Không thể lấy topic");
        const result = await response.json();
        const data = Array.isArray(result.data) ? result.data : [];
        if (!Array.isArray(data)) {
          console.error("Dữ liệu trả về không phải là mảng:", data);
          setNodeProgress(prevNodeProgress => ({ ...prevNodeProgress }));
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

        setNodeProgress(prevNodeProgress => {
          const updatedProgress = { ...prevNodeProgress };
          topicsWithNames.forEach(topic => {
            if (updatedProgress[topic.TopicID] === undefined) {
              updatedProgress[topic.TopicID] = { status: "pending" };
            }
          });
          return updatedProgress;
        });
      } catch (error) {
        console.error("Lỗi khi lấy topic:", error);
        setNodes([]);
        setEdges([]);
        setNodeProgress(prevNodeProgress => ({ ...prevNodeProgress }));
      }
    };
    fetchTopics();
  }, [id]);

  const fetchTopicDetails = async (topicId) => {
    try {
      const topicResponse = await fetch(`http://localhost:8000/api/topics/${topicId}/`);
      if (!topicResponse.ok) throw new Error("Không thể lấy chi tiết topic");
      const result = await topicResponse.json();
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

      if (user && user.id && user.role === 'user') {
        const token = getToken();
        if (!token) {
          console.warn('Không tìm thấy token để ghi nhận học topic.');
          return;
        }
        const response = await fetch('http://localhost:8000/api/user-topic-progress/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            UserID: user.id,
            TopicID: topicId,
            status: 'pending',
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Lỗi khi ghi nhận học topic:', errorData);
          if (response.status === 400) {
            console.warn('Có thể progress đã tồn tại, thử lấy progress hiện có...');
            const existingProgress = await fetch(`http://localhost:8000/api/user-topic-progress/?UserID=${user.id}&TopicID=${topicId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (existingProgress.ok) {
              const existingData = await existingProgress.json();
              if (existingData.data && existingData.data.length > 0) {
                setNodeProgress(prev => ({
                  ...prev,
                  [topicId]: {
                    ...prev[topicId],
                    id: existingData.data[0].id,
                    status: existingData.data[0].status,
                  },
                }));
              }
            }
          }
        } else {
          const result = await response.json();
          setNodeProgress(prev => ({
            ...prev,
            [topicId]: {
              ...prev[topicId],
              id: result.data.id,
              status: 'pending',
            },
          }));
        }
      }

      setSelectedExercise(null);
      setQuizQuestions([]);
      setQuizAnswers({});
      setSelectedAnswers({});
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết topic:", error);
    }
  };

  const fetchQuizQuestions = async (exerciseId) => {
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
  };

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
    if (!user || !user.id || (user.role && user.role.toLowerCase() !== 'user')) {
      alert("Bạn phải đăng nhập với tài khoản người dùng để thực hiện chức năng này");
      return;
    }

    let progressId = nodeProgress[topicId]?.id;

    if (!progressId) {
      const token = getToken();
      if (!token) {
        console.warn('Không tìm thấy token để lấy progress.');
        return;
      }
      const response = await fetch(`http://localhost:8000/api/user-topic-progress/?UserID=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error("Lỗi khi lấy progress:", await response.json());
        return;
      }
      const result = await response.json();
      const userProgress = result.data.find(item => item.TopicID === topicId);
      if (userProgress) {
        progressId = userProgress.id;
        setNodeProgress(prev => ({
          ...prev,
          [topicId]: {
            ...prev[topicId],
            id: progressId,
            status: userProgress.status,
          },
        }));
      } else {
        console.error("Không tìm thấy progress cho topic này");
        return;
      }
    }

    const token = getToken();
    if (!token) {
      console.warn('Không tìm thấy token để cập nhật status.');
      return;
    }
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
      setNodeProgress((prev) => ({
        ...prev,
        [topicId]: {
          ...prev[topicId],
          status,
        },
      }));
      fetchProgressPercentage();
    } else {
      const errorData = await updateResponse.json();
      console.error('Lỗi khi cập nhật status:', errorData);
      if (updateResponse.status === 403) {
        alert("Phiên đăng nhập của bạn có thể đã hết hạn. Vui lòng đăng nhập lại.");
      }
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const fetchProgressPercentage = async () => {
    if (!user || !user.id || (user.role && user.role.toLowerCase() !== 'user')) {
      setProgressPercentage(0);
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('Không tìm thấy token để lấy phần trăm hoàn thành.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/user-topic-progress/roadmap-progress/?roadmap_id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Không thể lấy tiến độ roadmap");
      }
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const progressData = result.data[0];
        const percentage = progressData.percentage_complete || 0;
        setProgressPercentage(Math.round(percentage));
      } else {
        setProgressPercentage(0); // Nếu không có dữ liệu, đặt tiến độ về 0
      }
    } catch (error) {
      console.error('Lỗi khi tính tiến độ:', error);
      setProgressPercentage(0); // Đặt tiến độ về 0 nếu có lỗi
    }
  };

  useEffect(() => {
    fetchProgressPercentage();
  }, [id, user, fetchProgressPercentage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodeProgress));
  }, [nodeProgress]);

  const styledNodes = nodes.map((node) => {
    const status = nodeProgress[node.id]?.status || "pending";
    return {
      ...node,
      style: {
        ...(status === "done" && {
          backgroundColor: "green",
          border: "2px solid black",
        }),
        ...(status === "skip" && {
          textDecoration: "line-through",
        }),
      },
      data: {
        ...node.data,
        label: (
          <>
            {node.data.label}
            {status === "done" && " ✅"}
            {status === "skip" && " ⏭️"}
          </>
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
                  value={nodeProgress[selectedTopic.id]?.status || "pending"}
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