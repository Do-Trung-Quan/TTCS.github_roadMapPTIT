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
      console.warn("Exercise or exercise ID is not available, skipping fetch. Exercise:", exercise);
      setQuestions([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching questions for exercise_id:', exercise.id);
      const questionsResponse = await fetch(`http://localhost:8000/api/quizquestions/?exercise_id=${exercise.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!questionsResponse.ok) {
        const errorData = await questionsResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch questions: ${questionsResponse.statusText}`);
      }
      const questionsData = await questionsResponse.json();
      const fetchedQuestions = questionsData.data || [];
      console.log('Fetched questions response:', questionsData);

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
          console.warn(`Failed to fetch answers for question ${question.id}: ${errorData.detail || answersResponse.statusText}`);
          return { ...question, content: question.question_text, answers: [] };
        }

        const answersData = await answersResponse.json();
        const fetchedAnswers = answersData.data || [];
        console.log(`Fetched answers for question ${question.id}:`, fetchedAnswers);

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
      console.error('Error fetching questions and answers:', err);
      setError(err.message || "An error occurred while loading quiz data.");
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
      setError("Question text and exercise information are required.");
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
        throw new Error(errorData.detail || `Failed to add question: ${response.statusText}`);
      }

      setNewQuestionText('');
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Error adding question:', err);
      setError(err.message || "An error occurred while adding the question.");
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
      setError("Question text is required.");
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
        throw new Error(errorData.detail || `Failed to update question: ${response.statusText}`);
      }

      setEditingQuestion(null);
      setEditingQuestionText('');
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err.message || "An error occurred while updating the question.");
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
        throw new Error(errorData.detail || `Failed to delete question: ${response.statusText}`);
      }

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err.message || "An error occurred while deleting the question.");
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
      setError("Answer text and question information are required.");
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
        throw new Error(errorData.detail || `Failed to add answer: ${response.statusText}`);
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
      console.error('Error adding answer:', err);
      setError(err.message || "An error occurred while adding the answer.");
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
      setError("Answer text is required.");
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
        throw new Error(errorData.detail || `Failed to update answer: ${response.statusText}`);
      }

      setEditingAnswer(null);
      setEditingAnswerText('');
      setEditingAnswerIsCorrect(false);
      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Error updating answer:', err);
      setError(err.message || "An error occurred while updating the answer.");
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
        throw new Error(errorData.detail || `Failed to delete answer: ${response.statusText}`);
      }

      fetchQuestionsAndAnswers();
    } catch (err) {
      console.error('Error deleting answer:', err);
      setError(err.message || "An error occurred while deleting the answer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !exercise) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Quiz for: {exercise?.title || 'Loading...'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
        <div className="modal-body">
          {isLoading && <p className="loading-message">Loading quiz data...</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="add-question-section">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Enter new question text"
              disabled={isLoading}
            />
            <button
              className="add-question-btn"
              onClick={handleAddQuestion}
              disabled={isLoading || !newQuestionText.trim()}
            >
              Add Question
            </button>
          </div>

          {questions.length === 0 && !isLoading && !error ? (
            <p className="no-questions-message">No questions available. Add questions to start managing quizzes.</p>
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
                          placeholder="Enter question text"
                          disabled={isLoading}
                        />
                        <button
                          className="save-btn"
                          onClick={() => handleUpdateQuestion(question.id)}
                          disabled={isLoading || !editingQuestionText.trim()}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingQuestion(null)}
                          disabled={isLoading}
                        >
                          Cancel
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
                                  placeholder="Enter answer text"
                                  disabled={isLoading}
                                />
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={editingAnswerIsCorrect}
                                    onChange={(e) => setEditingAnswerIsCorrect(e.target.checked)}
                                    disabled={isLoading}
                                  /> Correct?
                                </label>
                                <button
                                  className="save-btn"
                                  onClick={() => handleUpdateAnswer(answer.id)}
                                  disabled={isLoading || !editingAnswerText.trim()}
                                >
                                  Save
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => setEditingAnswer(null)}
                                  disabled={isLoading}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                {answer.content} {answer.is_correct && <span className="correct-label">(Correct)</span>}
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
                        <li className="no-answers-message">No answers yet for this question.</li>
                      )}
                    </ul>
                    <div className="add-answer-section">
                      <input
                        type="text"
                        value={newAnswerTexts[question.id] || ''}
                        onChange={(e) => handleNewAnswerInputChange(question.id, e.target.value)}
                        placeholder="Enter new answer option"
                        disabled={isLoading}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={newAnswerIsCorrect[question.id] || false}
                          onChange={(e) => handleNewAnswerIsCorrectChange(question.id, e.target.checked)}
                          disabled={isLoading}
                        /> Correct?
                      </label>
                      <button
                        className="add-answer-btn"
                        onClick={() => handleAddAnswer(question.id)}
                        disabled={isLoading || !(newAnswerTexts[question.id]?.trim())}
                      >
                        Add Answer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
        <div className="modal-footer">
          <button className="modal-save-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizManagerModal;