import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import './QuizManagerModal.css';
import { FontAwesomeIcon } from '../../fontawesome';

function QuizManagerModal({ isVisible, onClose, exercise }) {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswerTexts, setNewAnswerTexts] = useState({}); // Map: { questionId: 'input text' }
  const [newAnswerIsCorrect, setNewAnswerIsCorrect] = useState({}); // Map: { questionId: boolean }
  const [editingQuestion, setEditingQuestion] = useState(null); // State để theo dõi câu hỏi đang chỉnh sửa
  const [editingQuestionText, setEditingQuestionText] = useState(''); // Nội dung câu hỏi đang chỉnh sửa
  const [editingAnswer, setEditingAnswer] = useState(null); // State để theo dõi câu trả lời đang chỉnh sửa
  const [editingAnswerText, setEditingAnswerText] = useState(''); // Nội dung câu trả lời đang chỉnh sửa
  const [editingAnswerIsCorrect, setEditingAnswerIsCorrect] = useState(false); // Trạng thái đúng/sai của câu trả lời đang chỉnh sửa
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = Cookies.get('access_token');

  const fetchQuestionsAndAnswers = useCallback(async () => {
    if (!exercise || !exercise.id) {
      console.warn("Bài tập hoặc ID bài tập không có sẵn, bỏ qua việc tìm nạp. Bài tập:", exercise);
      setQuestions([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      console.log('Đang tìm nạp câu hỏi cho exercise_id:', exercise.id);
      const questionsResponse = await fetch(`http://localhost:8000/api/quizquestions/?exercise_id=${exercise.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!questionsResponse.ok) {
        const errorData = await questionsResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể tìm nạp câu hỏi: ${questionsResponse.statusText}`);
      }
      const questionsData = await questionsResponse.json();
      const fetchedQuestions = questionsData.data || [];
      console.log('Phản hồi câu hỏi đã tìm nạp:', questionsData);

      const questionsWithAnswers = await Promise.all(fetchedQuestions.map(async (question) => {
        const answersResponse = await fetch(`http://localhost:8000/api/quizanswers/?quiz_question=${question.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!answersResponse.ok) {
          const errorData = await answersResponse.json().catch(() => ({}));
          console.warn(`Không thể tìm nạp câu trả lời cho câu hỏi ${question.id}: ${errorData.detail || answersResponse.statusText}`);
          return { ...question, content: question.question_text, answers: [] };
        }

        const answersData = await answersResponse.json();
        const fetchedAnswers = answersData.data || [];
        console.log(`Câu trả lời đã tìm nạp cho câu hỏi ${question.id}:`, fetchedAnswers);

        const formattedAnswers = fetchedAnswers.map(answer => ({
          id: answer.id,
          content: answer.option_text,
          is_correct: answer.is_correct,
        }));

        return {
          ...question,
          content: question.question_text,
          answers: formattedAnswers,
        };
      }));

      setQuestions(questionsWithAnswers);
    } catch (err) {
      console.error('Lỗi khi tìm nạp câu hỏi và câu trả lời:', err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu câu hỏi.");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [exercise, token]);

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
    if (!newQuestionText.trim() || !exercise || !exercise.id) {
      setError("Văn bản câu hỏi và thông tin bài tập là bắt buộc.");
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể thêm câu hỏi: ${response.statusText}`);
      }

      setNewQuestionText('');
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      setError(err.message || "Đã xảy ra lỗi khi thêm câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setEditingQuestionText(question.content);
  };

  const handleUpdateQuestion = async (questionId) => {
    if (!editingQuestionText.trim()) {
      setError("Văn bản câu hỏi là bắt buộc.");
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể cập nhật câu hỏi: ${response.statusText}`);
      }

      setEditingQuestion(null);
      setEditingQuestionText('');
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi cập nhật câu hỏi:', err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể xóa câu hỏi: ${response.statusText}`);
      }

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err);
      setError(err.message || "Đã xảy ra lỗi khi xóa câu hỏi.");
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
    const answerText = newAnswerTexts[questionId]?.trim();
    const isCorrect = newAnswerIsCorrect[questionId] || false;

    if (!answerText || !questionId || !exercise || !exercise.id) {
      setError("Văn bản câu trả lời và thông tin câu hỏi là bắt buộc.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        option_text: answerText,
        is_correct: isCorrect,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể thêm câu trả lời: ${response.statusText}`);
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
      setError(err.message || "Đã xảy ra lỗi khi thêm câu trả lời.");
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
    if (!editingAnswerText.trim()) {
      setError("Văn bản câu trả lời là bắt buộc.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        option_text: editingAnswerText,
        is_correct: editingAnswerIsCorrect,
        quiz_question: editingAnswer.quiz_question, // Giữ nguyên liên kết với câu hỏi
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể cập nhật câu trả lời: ${response.statusText}`);
      }

      setEditingAnswer(null);
      setEditingAnswerText('');
      setEditingAnswerIsCorrect(false);
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi cập nhật câu trả lời:', err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật câu trả lời.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Không thể xóa câu trả lời: ${response.statusText}`);
      }

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Lỗi khi xóa câu trả lời:', err);
      setError(err.message || "Đã xảy ra lỗi khi xóa câu trả lời.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !exercise) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quản lý câu hỏi cho: {exercise?.title || 'Đang tải...'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng modal">
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
        <div className="modal-body">
          {isLoading && <p className="loading-message">Đang tải dữ liệu câu hỏi...</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="add-question-section">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Nhập nội dung câu hỏi mới"
              disabled={isLoading}
            />
            <button
              className="add-question-btn"
              onClick={handleAddQuestion}
              disabled={isLoading || !newQuestionText.trim()}
            >
              Thêm câu hỏi
            </button>
          </div>

          {questions.length === 0 && !isLoading && !error ? (
            <p className="no-questions-message">Không có câu hỏi nào. Thêm câu hỏi để bắt đầu quản lý câu hỏi.</p>
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
                          placeholder="Nhập nội dung câu hỏi"
                          disabled={isLoading}
                        />
                        <button
                          className="save-btn"
                          onClick={() => handleUpdateQuestion(question.id)}
                          disabled={isLoading || !editingQuestionText.trim()}
                        >
                          Lưu
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingQuestion(null)}
                          disabled={isLoading}
                        >
                          Hủy
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
                                  placeholder="Nhập nội dung câu trả lời"
                                  disabled={isLoading}
                                />
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={editingAnswerIsCorrect}
                                    onChange={(e) => setEditingAnswerIsCorrect(e.target.checked)}
                                    disabled={isLoading}
                                  /> Đúng?
                                </label>
                                <button
                                  className="save-btn"
                                  onClick={() => handleUpdateAnswer(answer.id)}
                                  disabled={isLoading || !editingAnswerText.trim()}
                                >
                                  Lưu
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => setEditingAnswer(null)}
                                  disabled={isLoading}
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <>
                                {answer.content} {answer.is_correct && <span className="correct-label">(Đúng)</span>}
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
                        <li className="no-answers-message">Chưa có câu trả lời nào cho câu hỏi này.</li>
                      )}
                    </ul>
                    <div className="add-answer-section">
                      <input
                        type="text"
                        value={newAnswerTexts[question.id] || ''}
                        onChange={(e) => handleNewAnswerInputChange(question.id, e.target.value)}
                        placeholder="Nhập lựa chọn trả lời mới"
                        disabled={isLoading}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={newAnswerIsCorrect[question.id] || false}
                          onChange={(e) => handleNewAnswerIsCorrectChange(question.id, e.target.checked)}
                          disabled={isLoading}
                        /> Đúng?
                      </label>
                      <button
                        className="add-answer-btn"
                        onClick={() => handleAddAnswer(question.id)}
                        disabled={isLoading || !(newAnswerTexts[question.id]?.trim())}
                      >
                        Thêm câu trả lời
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