import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './QuizManagerModal.css';
import { FontAwesomeIcon } from '../../fontawesome';

function QuizManagerModal({ isVisible, onClose, exercise, currentLang = 'vi' }) {
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswerTexts, setNewAnswerTexts] = useState({});
  const [newAnswerIsCorrect, setNewAnswerIsCorrect] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editingAnswerText, setEditingAnswerText] = useState('');
  const [editingAnswerIsCorrect, setEditingAnswerIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialTranslations = useMemo(() => ({
    manageQuestionsHeader: 'Quản lý câu hỏi cho:',
    loadingHeader: 'Đang tải...',
    closeModalLabel: 'Đóng modal',
    loadingMessage: 'Đang tải dữ liệu câu hỏi...',
    errorMessagePrefix: 'Đã xảy ra lỗi khi',
    fetchQuestionsError: 'tải dữ liệu câu hỏi.',
    addQuestionError: 'thêm câu hỏi.',
    updateQuestionError: 'cập nhật câu hỏi.',
    deleteQuestionError: 'xóa câu hỏi.',
    addAnswerError: 'thêm câu trả lời.',
    updateAnswerError: 'cập nhật câu trả lời.',
    deleteAnswerError: 'xóa câu trả lời.',
    questionRequiredError: 'Văn bản câu hỏi và thông tin bài tập là bắt buộc.',
    answerRequiredError: 'Văn bản câu trả lời và thông tin câu hỏi là bắt buộc.',
    questionTextPlaceholder: 'Nhập nội dung câu hỏi mới',
    addQuestionButton: 'Thêm câu hỏi',
    noQuestionsMessage: 'Không có câu hỏi nào. Thêm câu hỏi để bắt đầu quản lý câu hỏi.',
    saveButton: 'Lưu',
    cancelButton: 'Hủy',
    noAnswersMessage: 'Chưa có câu trả lời nào cho câu hỏi này.',
    correctLabel: '(Đúng)',
    answerTextPlaceholder: 'Nhập lựa chọn trả lời mới',
    isCorrectLabel: 'Đúng?',
    addAnswerButton: 'Thêm câu trả lời',
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
      if (response.status === 401) {
        logout();
        navigate('/');
      }
      const data = await response.json();
      return data.translated || texts;
    } catch (error) {
      console.error('Translation error in QuizManagerModal:', error);
      if (error.message.includes('401')) {
        logout();
        navigate('/');
      }
      return texts;
    }
  }, [logout, navigate]);

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
        updatedTranslations[key] = translatedTexts[index] || initialTranslations[key];
      });
      setTranslations(updatedTranslations);
    };
    translateContent();
  }, [currentLang, initialTranslations, translateText]);

  useEffect(() => {
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
        console.error('Token validation error in QuizManagerModal:', error);
        logout();
        navigate('/');
      }
    }
  }, [getToken, logout, navigate]);

  const fetchQuestionsAndAnswers = useCallback(async () => {
    const token = getToken();
    if (!token || !exercise || !exercise.id) {
      console.warn("Token hoặc bài tập hoặc ID bài tập không có sẵn, bỏ qua việc tìm nạp. Bài tập:", exercise);
      setQuestions([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const questionsResponse = await fetch(`http://localhost:8000/api/quizquestions/?exercise_id=${exercise.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!questionsResponse.ok) {
        if (questionsResponse.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.fetchQuestionsError}`);
      }
      const questionsData = await questionsResponse.json();
      const fetchedQuestions = questionsData.data || [];

      const questionsWithAnswers = await Promise.all(fetchedQuestions.map(async (question) => {
        const answersResponse = await fetch(`http://localhost:8000/api/quizanswers/?quiz_question=${question.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!answersResponse.ok) {
          if (answersResponse.status === 401) {
            logout();
            navigate('/');
          }
          throw new Error(`Không thể tìm nạp câu trả lời cho câu hỏi ${question.id}`);
        }

        const answersData = await answersResponse.json();
        const fetchedAnswers = answersData.data || [];

        return {
          ...question,
          content: question.question_text,
          answers: fetchedAnswers.map(answer => ({
            id: answer.id,
            content: answer.option_text,
            is_correct: answer.is_correct,
          })),
        };
      }));

      setQuestions(questionsWithAnswers);
    } catch (err) {
      console.error('Lỗi khi tìm nạp câu hỏi và câu trả lời:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.fetchQuestionsError}`);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [exercise, getToken, translations, logout, navigate]);

  useEffect(() => {
    if (isVisible && exercise) {
      fetchQuestionsAndAnswers();
    } else if (!isVisible) {
      setQuestions([]);
      setNewQuestionText('');
      setNewAnswerTexts({});
      setNewAnswerIsCorrect({});
      setEditingQuestion(null);
      setEditingQuestionText('');
      setEditingAnswer(null);
      setEditingAnswerText('');
      setEditingAnswerIsCorrect(false);
      setError(null);
      setIsLoading(false);
    }
  }, [isVisible, exercise, fetchQuestionsAndAnswers]);

  const handleAddQuestion = async () => {
    const token = getToken();
    if (!token || !newQuestionText.trim() || !exercise || !exercise.id) {
      setError(translations.questionRequiredError);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        question_text: newQuestionText,
        exercise: exercise.id,
      };
      const response = await fetch('http://localhost:8000/api/quizquestions/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.addQuestionError}`);
      }

      setNewQuestionText('');
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.addQuestionError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setEditingQuestionText(question.content);
  };

  const handleUpdateQuestion = async (questionId) => {
    const token = getToken();
    if (!token || !editingQuestionText.trim()) {
      setError(translations.questionRequiredError);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        question_text: editingQuestionText,
        exercise: exercise.id,
      };
      const response = await fetch(`http://localhost:8000/api/quizquestions/${questionId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.updateQuestionError}`);
      }

      setEditingQuestion(null);
      setEditingQuestionText('');
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi cập nhật câu hỏi:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.updateQuestionError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const token = getToken();
    if (!token) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/quizquestions/${questionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.deleteQuestionError}`);
      }

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.deleteQuestionError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnswerInputChange = (questionId, text) => {
    setNewAnswerTexts(prev => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleNewAnswerIsCorrectChange = (questionId, isCorrect) => {
    setNewAnswerIsCorrect(prev => ({
      ...prev,
      [questionId]: isCorrect,
    }));
  };

  const handleAddAnswer = async (questionId) => {
    const token = getToken();
    if (!token || !newAnswerTexts[questionId]?.trim() || !questionId || !exercise || !exercise.id) {
      setError(translations.answerRequiredError);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        option_text: newAnswerTexts[questionId]?.trim(),
        is_correct: newAnswerIsCorrect[questionId] || false,
        quiz_question: questionId,
      };
      const response = await fetch('http://localhost:8000/api/quizanswers/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.addAnswerError}`);
      }

      setNewAnswerTexts(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });
      setNewAnswerIsCorrect(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi thêm câu trả lời:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.addAnswerError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer);
    setEditingAnswerText(answer.content);
    setEditingAnswerIsCorrect(answer.is_correct);
  };

  const handleUpdateAnswer = async (answerId) => {
    const token = getToken();
    if (!token || !editingAnswerText.trim()) {
      setError(translations.answerRequiredError);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        option_text: editingAnswerText,
        is_correct: editingAnswerIsCorrect,
        quiz_question: editingAnswer.quiz_question,
      };
      const response = await fetch(`http://localhost:8000/api/quizanswers/${answerId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.updateAnswerError}`);
      }

      setEditingAnswer(null);
      setEditingAnswerText('');
      setEditingAnswerIsCorrect(false);
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi cập nhật câu trả lời:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.updateAnswerError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    const token = getToken();
    if (!token) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/quizanswers/${answerId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/');
        }
        throw new Error(`${translations.errorMessagePrefix} ${translations.deleteAnswerError}`);
      }

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi xóa câu trả lời:', err);
      if (err.message.includes('401')) {
        logout();
        navigate('/');
      }
      setError(err.message || `${translations.errorMessagePrefix} ${translations.deleteAnswerError}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !exercise) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{translations.manageQuestionsHeader} {exercise?.title || translations.loadingHeader}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label={translations.closeModalLabel}>
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
        <div className="modal-body">
          {isLoading && <p className="loading-message">{translations.loadingMessage}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="add-question-section">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder={translations.questionTextPlaceholder}
              disabled={isLoading}
            />
            <button
              className="add-question-btn"
              onClick={handleAddQuestion}
              disabled={isLoading || !newQuestionText.trim()}
            >
              {translations.addQuestionButton}
            </button>
          </div>

          {questions.length === 0 && !isLoading && !error ? (
            <p className="no-questions-message">{translations.noQuestionsMessage}</p>
          ) : (
            questions.length > 0 && (
              <div className="questions-list">
                {questions.map((question) => (
                  <div key={question.id} className="question-item">
                    {editingQuestion && editingQuestion.id === question.id ? (
                      <div className="edit-question-section">
                        <input
                          type="text"
                          value={editingQuestionText}
                          onChange={(e) => setEditingQuestionText(e.target.value)}
                          placeholder={translations.questionTextPlaceholder}
                          disabled={isLoading}
                        />
                        <button
                          className="save-btn"
                          onClick={() => handleUpdateQuestion(question.id)}
                          disabled={isLoading || !editingQuestionText.trim()}
                        >
                          {translations.saveButton}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingQuestion(null)}
                          disabled={isLoading}
                        >
                          {translations.cancelButton}
                        </button>
                      </div>
                    ) : (
                      <div className="question-header">
                        <h3 className="question-text">{question.content}</h3>
                        <div className="question-actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditQuestion(question)}
                            disabled={isLoading}
                          >
                            <FontAwesomeIcon icon="pencil" />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteQuestion(question.id)}
                            disabled={isLoading}
                          >
                            <FontAwesomeIcon icon="trash" />
                          </button>
                        </div>
                      </div>
                    )}
                    <ul className="answer-list">
                      {question.answers && question.answers.length > 0 ? (
                        question.answers.map((answer) => (
                          <li key={answer.id} className={`answer-item ${answer.is_correct ? 'correct-answer' : ''}`}>
                            {editingAnswer && editingAnswer.id === answer.id ? (
                              <div className="edit-answer-section">
                                <input
                                  type="text"
                                  value={editingAnswerText}
                                  onChange={(e) => setEditingAnswerText(e.target.value)}
                                  placeholder={translations.answerTextPlaceholder}
                                  disabled={isLoading}
                                />
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={editingAnswerIsCorrect}
                                    onChange={(e) => setEditingAnswerIsCorrect(e.target.checked)}
                                    disabled={isLoading}
                                  /> {translations.isCorrectLabel}
                                </label>
                                <button
                                  className="save-btn"
                                  onClick={() => handleUpdateAnswer(answer.id)}
                                  disabled={isLoading || !editingAnswerText.trim()}
                                >
                                  {translations.saveButton}
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => setEditingAnswer(null)}
                                  disabled={isLoading}
                                >
                                  {translations.cancelButton}
                                </button>
                              </div>
                            ) : (
                              <>
                                {answer.content} {answer.is_correct && <span className="correct-label">{translations.correctLabel}</span>}
                                <div className="answer-actions">
                                  <button
                                    className="edit-btn"
                                    onClick={() => handleEditAnswer({ ...answer, quiz_question: question.id })}
                                    disabled={isLoading}
                                  >
                                    <FontAwesomeIcon icon="pencil" />
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                    disabled={isLoading}
                                  >
                                    <FontAwesomeIcon icon="trash" />
                                  </button>
                                </div>
                              </>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="no-answers-message">{translations.noAnswersMessage}</li>
                      )}
                    </ul>
                    <div className="add-answer-section">
                      <input
                        type="text"
                        value={newAnswerTexts[question.id] || ''}
                        onChange={(e) => handleNewAnswerInputChange(question.id, e.target.value)}
                        placeholder={translations.answerTextPlaceholder}
                        disabled={isLoading}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={newAnswerIsCorrect[question.id] || false}
                          onChange={(e) => handleNewAnswerIsCorrectChange(question.id, e.target.checked)}
                          disabled={isLoading}
                        /> {translations.isCorrectLabel}
                      </label>
                      <button
                        className="add-answer-btn"
                        onClick={() => handleAddAnswer(question.id)}
                        disabled={isLoading || !(newAnswerTexts[question.id]?.trim())}
                      >
                        {translations.addAnswerButton}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizManagerModal;