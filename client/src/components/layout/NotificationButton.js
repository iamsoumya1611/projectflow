import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { apiFetch } from '../../utils/apiHelper';
import { decryptMessage } from '../../utils/encryption';
import io from 'socket.io-client';

const NotificationButton = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      if (!user || !user.id) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await apiFetch('/api/messages/unread', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    // Only initialize if user exists
    if (user && user.id) {
      // Initialize socket connection
      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      socketRef.current = io(socketUrl, {
        transports: ['websocket'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      // Join user-specific room for notifications
      socketRef.current.emit('joinUserRoom', user.id);
      
      // Listen for new notifications
      socketRef.current.on('messageReceived', (data) => {
        // Decrypt message if it's encrypted
        let decryptedText = data.text;
        if (data.isEncrypted && data.encryptedText) {
          try {
            decryptedText = decryptMessage(data.encryptedText) || data.text;
          } catch (err) {
            console.error('Decryption error:', err);
          }
        }
        
        const notification = {
          ...data,
          text: decryptedText
        };
        
        setUnreadCount(prevCount => prevCount + 1);
        setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only last 10 notifications
      });
      
      fetchUnreadCount();
      
      // Set up interval to periodically check for new messages
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      
      // Add click outside listener
      const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
          setShowNotifications(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      
      // Cleanup on component unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [user]); // Add user as dependency

  const handleNotificationClick = () => {
    setUnreadCount(0);
    // Clear notifications when chat is opened
    setNotifications([]);
    setShowNotifications(false);
    // Navigate to the chat page
    navigate('/chat');
  };

  const handleBellClick = (e) => {
    e.stopPropagation();
    // Only toggle if user exists
    if (!user || !user.id) return;
    
    // Toggle notifications visibility
    setShowNotifications(!showNotifications);
  };

  // Don't render if user doesn't exist
  if (!user || !user.id) {
    return (
      <div className="relative">
        <button className="relative p-2 text-white hover:text-[#50E3C2] focus:outline-none">
          <i className="fas fa-bell text-xl"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={handleBellClick}
        className="relative text-white hover:text-[#50E3C2] focus:outline-none"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 left-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown for recent notifications */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1F1F2E] rounded-lg shadow-xl z-50 border border-[#2D2D44]">
          <div className="p-3 border-b border-[#2D2D44] flex justify-between items-center">
            <h3 className="text-white font-bold">Recent Messages</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          {notifications.length > 0 ? (
            <>
              <div className="max-h-60 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-3 border-b border-[#2D2D44] hover:bg-[#14141D]">
                    <div className="flex justify-between">
                      <span className="text-[#4A90E2] font-semibold">{notification.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-400">
                        {notification.date ? new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-white text-sm mt-1 truncate">{notification.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button 
                  onClick={handleNotificationClick}
                  className="text-[#4A90E2] hover:text-[#50E3C2] text-sm"
                >
                  Open Chat
                </button>
              </div>
            </>
          ) : (
            <div className="p-3 text-center">
              {/* <p className="text-[#A0A0B0]">No messages yet</p> */}
              <button 
                onClick={handleNotificationClick}
                className="text-[#4A90E2] hover:text-[#50E3C2] text-sm mt-2"
              >
                Open Chat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;