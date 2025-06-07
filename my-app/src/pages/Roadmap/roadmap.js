import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import "./roadmap.css";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY_PREFIX = "frontend_roadmap_progress_";

const decodeHtmlEntities = (str) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

export default function Roadmap({ currentLang = 'vi' }) {
  const { id } = useParams();
  const { user, getToken, logout } = useAuth();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState({ title: "", description: "" });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // State cho dữ liệu đã dịch
  const [topicDetails, setTopicDetails] = useState(null);
  const [resources, setResources] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});

  // State cho dữ liệu gốc (chưa dịch) từ API
  const [originalTopicDetails, setOriginalTopicDetails] = useState(null);
  const [originalResources, setOriginalResources] = useState([]);
  const [originalExercises, setOriginalExercises] = useState([]);
  const [originalQuizQuestions, setOriginalQuizQuestions] = useState([]);
  const [originalQuizAnswers, setOriginalQuizAnswers] = useState({});

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [error, setError] = useState(null);

  const initialTranslations = useMemo(() => ({
    roadmapTitleDefault: "Lộ trình Front-end",
    roadmapDescriptionDefault: "Chào mừng, đây là lộ trình front-end cho các anh chị em",
    progressLabel: "Tiến độ:",
    totalTopics: "Tổng số topic:",
    descriptionLabel: "Mô tả:",
    noDescription: "Không có mô tả.",
    freeResources: "Tài nguyên miễn phí:",
    noResources: "Không có tài nguyên.",
    exercises: "Bài tập:",
    noExercises: "Không có bài tập.",
    quizSection: "Phần trắc nghiệm:",
    question: "Câu",
    correct: "Đúng",
    incorrect: "Chưa chính xác",
    noQuizQuestions: "Không có câu hỏi quiz cho bài tập này.",
    statusLabel: "Trạng thái:",
    statusPending: "Pending",
    statusSkip: "Skip",
    statusDone: "Done",
    loginRequired: "Bạn phải đăng nhập với tài khoản người dùng để thực hiện chức năng này",
    tokenExpired: "Phiên đăng nhập đã hết hạn. Đang chuyển hướng về trang đăng nhập...",
    fetchRoadmapError: "Không thể lấy roadmap",
    fetchTopicError: "Không thể lấy topic",
    fetchTopicDetailsError: "Không thể lấy chi tiết topic",
    fetchResourcesError: "Không thể lấy tài nguyên",
    fetchExercisesError: "Không thể lấy bài tập",
    fetchQuizQuestionsError: "Không thể lấy quiz questions",
    fetchQuizAnswersError: "Không thể lấy câu trả lời",
    createProgressError: "Lỗi khi tạo tiến độ:",
    updateStatusError: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    updateStatusGenericError: "Đã xảy ra lỗi khi cập nhật trạng thái.",
    checkTokenError: "Lỗi khi kiểm tra token:",
    authError: "Không tìm thấy mã thông báo xác thực. Vui lòng đăng nhập.",
  }), []);

  const [translations, setTranslations] = useState(initialTranslations);

  const translateText = useCallback(async (texts, targetLang) => {
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
  }, []);

  useEffect(() => {
    const translateStaticContent = async () => {
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
    translateStaticContent();
  }, [currentLang, initialTranslations, translateText]);

  const getStorageKey = useCallback(() => (
    user && user.id ? `${STORAGE_KEY_PREFIX}${user.id}_${id}` : `${STORAGE_KEY_PREFIX}guest_${id}`
  ), [user, id]);

  const [nodeProgress, setNodeProgress] = useState(() => {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : {};
  });

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);

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
      console.error(translations.checkTokenError, error);
      setError(translations.authError);
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      return false;
    }
  }, [logout, navigate, translations.tokenExpired, translations.checkTokenError, translations.authError]);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/roadmaps/${id}/`);
        if (!response.ok) throw new Error(translations.fetchRoadmapError);
        const result = await response.json();
        const data = result.data || {};
        const roadmapTitle = data.title || "";
        const roadmapDescription = data.description || "";

        if (currentLang !== 'vi') {
          const translated = await translateText([roadmapTitle, roadmapDescription], currentLang);
          setRoadmap({
            title: decodeHtmlEntities(translated[0] || roadmapTitle),
            description: decodeHtmlEntities(translated[1] || roadmapDescription)
          });
        } else {
          setRoadmap({ title: roadmapTitle, description: roadmapDescription });
        }
      } catch (error) {
        console.error(translations.fetchRoadmapError, error);
        setError(error.message);
      }
    };
    fetchRoadmap();
  }, [id, currentLang, translateText, translations.fetchRoadmapError]);

  useEffect(() => {
    const fetchTopics = async () => {
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/topic-roadmap/?roadmap_id=${id}`);
        if (!response.ok) throw new Error(translations.fetchTopicError);
        const result = await response.json();
        const data = Array.isArray(result.data) ? result.data : [];
        if (!Array.isArray(data)) {
          console.error("Dữ liệu trả về không phải là mảng:", data);
          setError(translations.fetchTopicError);
          return;
        }
        const filteredTopics = data.filter(topic => topic.RoadmapID === id);
        const sortedTopics = filteredTopics.sort((a, b) => a.topic_order - b.topic_order);

        const topicDetailsPromises = sortedTopics.map(async (topic) => {
          const topicResponse = await fetch(`http://localhost:8000/api/topics/${topic.TopicID}/`);
          if (!topicResponse.ok) throw new Error(`${translations.fetchTopicDetailsError} ${topic.TopicID}`);
          const topicResult = await topicResponse.json();
          const topicData = topicResult.data || {};
          return { ...topic, topic_name: topicData.title || topic.TopicID };
        });
        const topicsWithNames = await Promise.all(topicDetailsPromises);

        let nodesWithTranslatedLabels;
        if (currentLang !== 'vi') {
          const topicNames = topicsWithNames.map(topic => topic.topic_name);
          const translatedTopicNames = await translateText(topicNames, currentLang);
          nodesWithTranslatedLabels = topicsWithNames.map((topic, index) => ({
            id: topic.TopicID.toString(),
            position: { x: 100, y: 100 * index },
            data: { label: decodeHtmlEntities(translatedTopicNames[index] || topic.topic_name) },
          }));
        } else {
          nodesWithTranslatedLabels = topicsWithNames.map((topic, index) => ({
            id: topic.TopicID.toString(),
            position: { x: 100, y: 100 * index },
            data: { label: topic.topic_name },
          }));
        }

        const newEdges = topicsWithNames.slice(0, -1).map((topic, index) => ({
          id: `e${index}-${index + 1}`,
          source: topic.TopicID.toString(),
          target: topicsWithNames[index + 1].TopicID.toString(),
        }));

        setNodes(nodesWithTranslatedLabels);
        setEdges(newEdges);

        setNodeProgress(prev => {
          const updatedProgress = {};
          topicsWithNames.forEach(topic => {
            updatedProgress[topic.TopicID] = prev[topic.TopicID] || { status: "pending" };
          });
          return updatedProgress;
        });

        if (user && user.id && user.role === 'user') {
          const token = getToken();
          if (token && checkTokenExpiration(token)) {
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
        console.error(translations.fetchTopicError, error);
        setError(error.message);
        setNodes([]);
        setEdges([]);
      }
    };
    fetchTopics();
  }, [id, user, getToken, currentLang, translateText, translations.fetchTopicError, translations.fetchTopicDetailsError, checkTokenExpiration]);

  const fetchProgressPercentage = useCallback(async () => {
    if ((!user || !user.id) || (user.role && user.role.toLowerCase() !== 'user')) {
      setProgressPercentage(0);
      setTotalTopics(0);
      return;
    }

    const token = getToken();
    if (!token || !checkTokenExpiration(token)) {
      console.warn('Không tìm thấy token hoặc token hết hạn để lấy phần trăm hoàn thành.');
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
  }, [id, user, getToken, checkTokenExpiration]);

  useEffect(() => {
    fetchProgressPercentage();
  }, [fetchProgressPercentage]);

  // Hàm fetch chi tiết topic và dữ liệu gốc
  const fetchTopicDetails = useCallback(async (topicId) => {
    setError(null);
    try {
      const topicResponse = await fetch(`http://localhost:8000/api/topics/${topicId}/`);
      if (!topicResponse.ok) throw new Error(translations.fetchTopicDetailsError);
      const result = await topicResponse.json();
      const data = result.data || {};
      setOriginalTopicDetails({ title: data.title || "", description: data.description || "" });

      const resourcesResponse = await fetch(`http://localhost:8000/api/resources/?topic=${topicId}`);
      if (!resourcesResponse.ok) throw new Error(translations.fetchResourcesError);
      const resourcesResult = await resourcesResponse.json();
      const resourcesData = Array.isArray(resourcesResult.data) ? resourcesResult.data : [];
      setOriginalResources(resourcesData);

      const exercisesResponse = await fetch(`http://localhost:8000/api/exercises/?topic=${topicId}`);
      if (!exercisesResponse.ok) throw new Error(translations.fetchExercisesError);
      const exercisesResult = await exercisesResponse.json();
      const exercisesData = Array.isArray(exercisesResult.data) ? exercisesResult.data : [];
      setOriginalExercises(exercisesData);

      // Reset các state liên quan đến exercise/quiz khi chọn topic mới
      setSelectedExercise(null);
      setOriginalQuizQuestions([]);
      setOriginalQuizAnswers({});
      setSelectedAnswers({});
    } catch (error) {
      console.error(translations.fetchTopicDetailsError, error);
      setError(error.message);
      setOriginalTopicDetails(null);
      setOriginalResources([]);
      setOriginalExercises([]);
    }
  }, [translations.fetchTopicDetailsError, translations.fetchResourcesError, translations.fetchExercisesError]);

  // Hàm fetch câu hỏi quiz và câu trả lời gốc
  const fetchQuizQuestions = useCallback(async (exerciseId) => {
    setError(null);
    try {
      const quizResponse = await fetch(`http://localhost:8000/api/quizquestions/?exercise_id=${exerciseId}`);
      if (!quizResponse.ok) throw new Error(translations.fetchQuizQuestionsError);
      const quizResult = await quizResponse.json();
      const quizData = Array.isArray(quizResult.data) ? quizResult.data : [];
      setOriginalQuizQuestions(quizData);

      const answerPromises = quizData.map(async (question) => {
        const response = await fetch(`http://localhost:8000/api/quizanswers/?quiz_question=${question.id}`);
        if (!response.ok) throw new Error(translations.fetchQuizAnswersError);
        const result = await response.json();
        return { questionId: question.id, answers: Array.isArray(result.data) ? result.data : [] };
      });
      const answerResults = await Promise.all(answerPromises);
      const answersMap = answerResults.reduce((acc, { questionId, answers }) => {
        acc[questionId] = answers;
        return acc;
      }, {});
      setOriginalQuizAnswers(answersMap);
      setSelectedAnswers({}); // Reset selected answers when new quiz questions are fetched
    } catch (error) {
      console.error(translations.fetchQuizQuestionsError, error);
      setError(error.message);
      setOriginalQuizQuestions([]);
      setOriginalQuizAnswers({});
    }
  }, [translations.fetchQuizQuestionsError, translations.fetchQuizAnswersError]);

  // useEffect để dịch DỮ LIỆU GỐC khi ngôn ngữ hoặc dữ liệu gốc thay đổi
  useEffect(() => {
    const translateDynamicContent = async () => {
      // Dịch chi tiết topic
      if (originalTopicDetails) {
        if (currentLang !== 'vi') {
          const translatedDetails = await translateText([originalTopicDetails.title, originalTopicDetails.description], currentLang);
          setTopicDetails({
            title: decodeHtmlEntities(translatedDetails[0] || originalTopicDetails.title),
            description: decodeHtmlEntities(translatedDetails[1] || originalTopicDetails.description)
          });
        } else {
          setTopicDetails(originalTopicDetails);
        }
      } else {
        setTopicDetails(null);
      }

      // Dịch tài nguyên
      if (originalResources.length > 0) {
        if (currentLang !== 'vi') {
          const titles = originalResources.map(res => res.title);
          const translatedTitles = await translateText(titles, currentLang);
          const translatedResources = originalResources.map((res, index) => ({
            ...res,
            title: decodeHtmlEntities(translatedTitles[index] || res.title),
          }));
          setResources(translatedResources);
        } else {
          setResources(originalResources);
        }
      } else {
        setResources([]);
      }

      // Dịch bài tập
      if (originalExercises.length > 0) {
        if (currentLang !== 'vi') {
          const descriptions = originalExercises.map(ex => ex.description || ex.title || "");
          const translatedDescriptions = await translateText(descriptions, currentLang);
          const translatedExercises = originalExercises.map((ex, index) => ({
            ...ex,
            title: decodeHtmlEntities(translatedDescriptions[index] || ex.title || ex.description),
            description: decodeHtmlEntities(translatedDescriptions[index] || ex.description || ex.title),
          }));
          setExercises(translatedExercises);
        } else {
          setExercises(originalExercises);
        }
      } else {
        setExercises([]);
      }

      // Dịch câu hỏi quiz
      if (originalQuizQuestions.length > 0) {
        if (currentLang !== 'vi') {
          const questionTexts = originalQuizQuestions.map(q => q.question_text);
          const translatedQuestionTexts = await translateText(questionTexts, currentLang);
          const translatedQuizQuestions = originalQuizQuestions.map((q, index) => ({
            ...q,
            question_text: decodeHtmlEntities(translatedQuestionTexts[index] || q.question_text),
          }));
          setQuizQuestions(translatedQuizQuestions);

          const translatedQuizAnswersMap = {};
          for (const question of originalQuizQuestions) {
            const answers = originalQuizAnswers[question.id] || [];
            if (answers.length > 0) {
              const answerOptions = answers.map(a => a.option_text);
              const translatedAnswerOptions = await translateText(answerOptions, currentLang);
              translatedQuizAnswersMap[question.id] = answers.map((a, index) => ({
                ...a,
                option_text: decodeHtmlEntities(translatedAnswerOptions[index] || a.option_text),
              }));
            } else {
              translatedQuizAnswersMap[question.id] = [];
            }
          }
          setQuizAnswers(translatedQuizAnswersMap);
        } else {
          setQuizQuestions(originalQuizQuestions);
          setQuizAnswers(originalQuizAnswers);
        }
      } else {
        setQuizQuestions([]);
        setQuizAnswers({});
      }
    };
    translateDynamicContent();
  }, [currentLang, originalTopicDetails, originalResources, originalExercises, originalQuizQuestions, originalQuizAnswers, translateText]);

  const onNodeClick = useCallback(async (event, node) => {
    setSelectedTopic(node);
    fetchTopicDetails(node.id);

    // Automatically record progress when clicking a node
    if (!user || !user.id || user.role.toLowerCase() !== 'user') {
      alert(translations.loginRequired);
      return;
    }

    const token = getToken();
    if (!token || !checkTokenExpiration(token)) {
      return;
    }

    const topicId = node.id;
    let progressId = nodeProgress[topicId]?.id;

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
          setNodeProgress(prev => ({
            ...prev,
            [topicId]: {
              id: progressId,
              status: 'pending',
            },
          }));
          console.log('Progress created:', createResult);
          fetchProgressPercentage();
        } else {
          console.error(translations.createProgressError, await createResponse.json());
          setError(`${translations.createProgressError} ${createResponse.statusText}`);
        }
      } catch (error) {
        console.error(translations.createProgressError, error);
        setError(`${translations.createProgressError} ${error.message}`);
      }
    }
  }, [fetchTopicDetails, user, getToken, checkTokenExpiration, nodeProgress, translations.createProgressError, translations.loginRequired, fetchProgressPercentage]);

  const closePanel = useCallback(() => {
    setSelectedTopic(null);
    setTopicDetails(null);
    setOriginalTopicDetails(null);
    setResources([]);
    setOriginalResources([]);
    setExercises([]);
    setOriginalExercises([]);
    setSelectedExercise(null);
    setQuizQuestions([]);
    setOriginalQuizQuestions([]);
    setQuizAnswers({});
    setOriginalQuizAnswers({});
    setSelectedAnswers({});
    setError(null);
  }, []);

  const handleExerciseClick = useCallback((exerciseId) => {
    if (selectedExercise === exerciseId) {
      setSelectedExercise(null);
      setOriginalQuizQuestions([]);
      setOriginalQuizAnswers({});
      setSelectedAnswers({});
    } else {
      setSelectedExercise(exerciseId);
      fetchQuizQuestions(exerciseId);
    }
  }, [selectedExercise, fetchQuizQuestions]);

  const handleStatusChange = async (topicId, status) => {
    if (!user || !user.id || user.role.toLowerCase() !== 'user') {
      alert(translations.loginRequired);
      return;
    }

    const token = getToken();
    if (!token || !checkTokenExpiration(token)) {
      return;
    }

    let progressId = nodeProgress[topicId]?.id;

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
          console.error(translations.createProgressError, await createResponse.json());
          setError(`${translations.createProgressError} ${createResponse.statusText}`);
          return;
        }
      } catch (error) {
        console.error(translations.createProgressError, error);
        setError(`${translations.createProgressError} ${error.message}`);
        return;
      }
    }

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
        fetchProgressPercentage();
      } else {
        console.error('Lỗi khi cập nhật status:', await updateResponse.json());
        setError(translations.updateStatusError);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật status:", error);
      setError(translations.updateStatusGenericError);
    }
  };

  const handleAnswerSelect = useCallback((questionId, answerId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  }, []);

  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(nodeProgress));
  }, [nodeProgress, getStorageKey]);

  // Use useMemo để tạo styledNodes, đảm bảo nó chỉ re-render khi nodes (state gốc) hoặc nodeProgress thay đổi
  const styledNodes = useMemo(() => {
    return nodes.map(node => {
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
  }, [nodes, nodeProgress]);

  return (
    <>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <h1>{roadmap.title || translations.roadmapTitleDefault}</h1>
        <p>{roadmap.description || translations.roadmapDescriptionDefault}</p>
        <div className="progress-container">
          <label>{translations.progressLabel} {progressPercentage}%</label>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <p>{translations.totalTopics} {totalTopics}</p>
        </div>
      </div>

      <div className="roadmap-container-g" style={{ position: "relative", width: "100%", height: "80vh" }}>
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
          {/* <Background color="#aaa" gap={16} /> */}
        </ReactFlow>

        {selectedTopic && (
          <>
            <div className="overlay" onClick={closePanel}></div>
            <div className="info-panel">
              <div className="info-panel-header">
                <h3>{topicDetails?.title || selectedTopic.data.label}</h3>
                <button onClick={closePanel}>✕</button>
              </div>
              {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
              <div className="completion-dropdown">
                <label htmlFor={`status-${selectedTopic.id}`}>{translations.statusLabel} </label>
                <select
                  id={`status-${selectedTopic.id}`}
                  value={nodeProgress && nodeProgress[selectedTopic.id]?.status || "pending"}
                  onChange={(e) => handleStatusChange(selectedTopic.id, e.target.value)}
                >
                  <option value="pending">{translations.statusPending}</option>
                  <option value="skip">{translations.statusSkip}</option>
                  <option value="done">{translations.statusDone}</option>
                </select>
              </div>
              <h4>{translations.descriptionLabel}</h4>
              <p>{topicDetails?.description || translations.noDescription}</p>
              <h4>{translations.freeResources}</h4>
              <ul>
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <li key={resource.id || index} className={`resource-${resource.resource_type_name.toLowerCase()}`}>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        {resource.title} ({resource.resource_type_name})
                      </a>
                    </li>
                  ))
                ) : (
                  <li>{translations.noResources}</li>
                )}
              </ul>
              <h4>{translations.exercises}</h4>
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
                      {exercise.title || exercise.description || translations.noDescription}
                      {selectedExercise === exercise.id && quizQuestions.length > 0 ? (
                        <div className="quiz-section">
                          {quizQuestions.map((question, qIndex) => (
                            <div key={question.id} className="quiz-question">
                              <p>
                                {translations.question} {qIndex + 1}: {question.question_text}
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
                                      <span>{answer.is_correct ? ` ✅ ${translations.correct}` : ` ❌ ${translations.incorrect}`}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : selectedExercise === exercise.id ? (
                        <div className="quiz-section">
                          <p>{translations.noQuizQuestions}</p>
                        </div>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li>{translations.noExercises}</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}