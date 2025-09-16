import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import '../styles/NotificationPanel.css';

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // 주기적으로 알림을 가져오는 로직
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!localStorage.getItem('token')) return;
      try {
        const response = await getNotifications();
        if (response && response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('알림을 가져오는데 실패했습니다:', error);
        setNotifications([]);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [isOpen]);

  // 외부 클릭 시 패널 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        if (!event.target.closest('.notification-icon')) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelRef]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // 개별 알림 읽음 처리 핸들러
  const handleMarkOneRead = async (e, id) => {
    e.preventDefault(); // 링크 이동 방지
    e.stopPropagation(); // 이벤트 버블링 방지

    try {
      await markNotificationAsRead(id);
      // 화면 즉시 반영 (Optimistic Update)
      setNotifications(currentNotifications =>
        currentNotifications.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('알림 읽음 처리에 실패했습니다:', error);
    }
  };

  // 모든 알림 읽음 처리 핸들러
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // 화면 즉시 반영
      setNotifications(currentNotifications =>
        currentNotifications.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리에 실패했습니다:', error);
    }
  };

  return (
    <div className="notification-panel-container" ref={panelRef}>
      <button className="notification-icon" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span>알림</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-read-btn">
                모두 읽음
              </button>
            )}
          </div>
          {notifications.length > 0 ? (
            <ul>
              {notifications.map(notif => (
                <li key={notif.id} className={notif.is_read ? 'read' : 'unread'}>
                  <Link to={notif.link} onClick={() => setIsOpen(false)} className="notification-link">
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true, locale: ko })}
                      </span>
                      {!notif.is_read && (
                         <button onClick={(e) => handleMarkOneRead(e, notif.id)} className="mark-one-read-btn">
                           읽음
                         </button>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-notifications">새로운 알림이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;