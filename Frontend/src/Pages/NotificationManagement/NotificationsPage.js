import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SideBar from '../../Components/SideBar/SideBar';
import { 
  Check, Trash2, Bell, BellOff, RefreshCw, Clock, 
  Mail, AlertTriangle, CheckCircle, Info, Sparkles,
  MessageSquare, BookOpen, TrendingUp, Zap, Star,
  Award, Gift, Heart, ThumbsUp, Share2
} from 'lucide-react';
import './Notifications.css';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userID');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:8080/notifications/markAllAsRead/${userId}`);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (notification) => {
    const message = notification.message.toLowerCase();
    
    if (message.includes('alert') || message.includes('warning')) {
      return <AlertTriangle size={20} />;
    } else if (message.includes('success') || message.includes('completed')) {
      return <CheckCircle size={20} />;
    } else if (message.includes('info')) {
      return <Info size={20} />;
    } else if (message.includes('message') || message.includes('comment')) {
      return <MessageSquare size={20} />;
    } else if (message.includes('learning') || message.includes('course')) {
      return <BookOpen size={20} />;
    } else if (message.includes('progress') || message.includes('achievement')) {
      return <TrendingUp size={20} />;
    } else if (message.includes('like') || message.includes('favorite')) {
      return <Heart size={20} />;
    } else if (message.includes('share') || message.includes('forward')) {
      return <Share2 size={20} />;
    } else if (message.includes('award') || message.includes('badge')) {
      return <Award size={20} />;
    } else if (message.includes('gift') || message.includes('reward')) {
      return <Gift size={20} />;
    } else {
      return <Bell size={20} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notif-container">
      <SideBar />
      <main>
        <div className="notif-header">
          <div className="notif-header-title">
            <Bell size={24} />
            <h1>Notifications</h1>
          </div>
          <div className="notif-actions">
            {notifications.filter(n => !n.read).length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="notif-btn notif-btn-secondary"
                title="Mark all as read"
              >
                <Check size={16} />
                Mark all as read
              </button>
            )}
            <button 
              onClick={fetchNotifications}
              className="notif-btn notif-btn-primary"
              title="Refresh notifications"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <Clock size={32} />
            </div>
            <h3>Loading notifications...</h3>
            <p>Please wait while we fetch your notifications.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <BellOff size={32} />
            </div>
            <h3>No notifications yet</h3>
            <p>When you get notifications, they'll appear here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(notification => {
              let typeClass = "";
              const message = notification.message.toLowerCase();
              
              if (message.includes('alert') || message.includes('warning')) {
                typeClass = "alert";
              } else if (message.includes('success') || message.includes('completed')) {
                typeClass = "success";
              } else if (message.includes('info')) {
                typeClass = "info";
              }

              return (
                <div 
                  key={notification.id} 
                  className={`notif-card ${notification.read ? '' : 'unread'} ${typeClass}`}
                >
                  <div className="notif-card-content">
                    <div className="notif-icon">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="notif-details">
                      <p className="notif-message">{notification.message}</p>
                      <time className="notif-time">{formatDate(notification.createdAt)}</time>
                    </div>
                  </div>
                  <div className="notif-card-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="notif-btn-icon read"
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="notif-btn-icon delete"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationsPage;