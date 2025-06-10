import { useState, useEffect } from 'react';
import { Bell, X, Eye, MessageSquare, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { ref, onValue, off, push, update, remove } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

interface Notification {
  id: string;
  type: 'review' | 'inquiry' | 'demo' | 'message' | 'calendar';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationSystem({ onNotificationClick }: NotificationSystemProps) {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const notificationsRef = ref(rtdb, 'notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationList = Object.entries(data)
          .map(([id, notif]: [string, any]) => ({
            id,
            ...notif
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20); // Keep last 20 notifications

        setNotifications(notificationList);
        setUnreadCount(notificationList.filter(n => !n.isRead).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => off(notificationsRef, 'value', unsubscribe);
  }, [user, isAdmin]);

  const markAsRead = async (notificationId: string) => {
    try {
      await update(ref(rtdb, `notifications/${notificationId}`), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const notificationsRef = ref(rtdb, 'notifications');
      await remove(notificationsRef);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const notificationRef = ref(rtdb, `notifications/${notificationId}`);
      await remove(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    onNotificationClick?.(notification);
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review': return <FileText className="w-4 h-4" />;
      case 'inquiry': return <MessageSquare className="w-4 h-4" />;
      case 'demo': return <Calendar className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDropdown(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Helper function to create notifications
export const createNotification = async (
  type: 'review' | 'inquiry' | 'demo' | 'message' | 'calendar',
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  actionUrl?: string
) => {
  try {
    const notificationData = {
      type,
      title,
      message,
      timestamp: Date.now(),
      isRead: false,
      priority,
      actionUrl
    };

    await push(ref(rtdb, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};