import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { apiFetch } from '../../utils/apiHelper';
import io from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/api/messages', {
          headers: {
            'x-auth-token': token
          }
        });
        const data = await res.json();

        if (res.ok) {
          setMessages(data.reverse()); // Show newest first
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    // Redirect to login if user is not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Join global chat room
    socketRef.current.emit('joinGlobalChat');

    // Listen for new messages
    socketRef.current.on('messageReceived', (message) => {
      // Ensure message has required properties
      if (message && message.text) {
        // Add default user if missing
        if (!message.user) {
          message.user = { name: 'Unknown User' };
        }
        // Add current date if missing
        if (!message.date) {
          message.date = new Date().toISOString();
        }
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });

    // Get initial messages
    fetchMessages();

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim() === '') return;

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Always send message through API to ensure persistence
      const token = localStorage.getItem('token');
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ text: message })
      });

      if (res.ok) {
        setMessage('');
      } else {
        const data = await res.json();
        console.error('Failed to send message:', data.msg || 'Server error');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // For older dates, return formatted date
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Redirect to login if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Chat</h1>
        <p className="text-gray-400 mt-2">Connect with your team in real-time</p>
      </div>

      <div className="flex flex-col h-[calc(100vh-200px)] bg-[#1F1F2E] rounded-xl shadow-lg border border-[#2D2D44]">
        <div className="px-6 py-4 border-b border-[#2D2D44]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Team Chat</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#2D2D44]">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">No messages yet</h3>
              <p className="mt-2">Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg._id} className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full bg-[#4A90E2] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {msg.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2D2D44] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{msg.user?.name || 'Unknown User'}</span>
                        <div className="text-xs text-gray-400">
                          <span className="mr-2">{formatDate(msg.date)}</span>
                          <span>{formatTime(msg.date)}</span>
                        </div>
                      </div>
                      <p className="text-gray-200">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-[#2D2D44] p-4">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-[#14141D] text-white border border-[#2D2D44] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#4A90E2] text-white rounded-r-lg hover:bg-[#3a7bc8] focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:ring-offset-2 focus:ring-offset-[#1F1F2E] transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;