import React, { useState, useEffect, useRef } from 'react';
import chatbotIcon from '../../assets/img/chat-bot.gif';
import './chatbot.css';
import { FontAwesomeIcon } from '../../fontawesome';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { user, getToken } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, messages.length]); // Đã thêm messages.length để fix lỗi ESLint

  // Reset chatbot khi token thay đổi hoặc hết hạn
  useEffect(() => {
    const token = getToken();
    const shouldReset = () => {
      if (!token) {
        // Người dùng khách (không có token), không thay đổi
        return false;
      }
      // Người dùng đã đăng nhập (có token), kiểm tra role
      if (user && user.role) {
        if (user.role === 'user' || user.role === 'admin') {
          // Nếu token hết hạn (401) hoặc không hợp lệ, reset chatbot
          return true;
        }
      }
      return false;
    };

    if (shouldReset()) {
      setMessages([{ sender: 'bot', text: 'Xin chào, mình là ROADMAP PTIT, mình có thể giúp gì cho bạn?' }]);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: 'Xin chào, mình là ROADMAP PTIT, mình có thể giúp gì cho bạn?' }]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, { sender: 'bot', sections: data.response }]);
    } catch (error) {
      if (error.message.includes('401')) {
        // Token hết hạn, chỉ reset chatbot
        setMessages([{ sender: 'bot', text: 'Xin chào, mình là ROADMAP PTIT, mình có thể giúp gì cho bạn?' }]);
      } else {
        setMessages([
          ...newMessages,
          { sender: 'bot', text: 'Có lỗi xảy ra. Vui lòng thử lại!' },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <img
          src={chatbotIcon}
          alt="Chatbot Icon"
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
        />
      )}

      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <span>Giải đáp thắc mắc cùng ROADMAP PTIT</span>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                {msg.text && <div>{msg.text}</div>}
                {msg.sections && msg.sections.map((section, secIndex) => (
                  <div key={secIndex} className="chatbot-section">
                    <h3 className="chatbot-section-title">{section.title}</h3>
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="chatbot-item">
                        {item.subsection && (
                          <h4 className="chatbot-subsection">{item.subsection}</h4>
                        )}
                        {item.items && (
                          <ul className="chatbot-items-list">
                            {item.items.map((subItem, subIndex) => (
                              <li key={subIndex} className="chatbot-item-text">
                                {subItem}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.text && <p className="chatbot-item-text">{item.text}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message bot">
                <span className="loading-indicator">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Bạn muốn hỏi gì?"
              className="chatbot-input-field"
            />
            <button className="chatbot-send" onClick={handleSendMessage}>
              <FontAwesomeIcon icon="paper-plane" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;