// Simple notification service using localStorage for demo purposes
export interface Notification {
  id: string;
  userId: string;
  type: 'form_submitted' | 'review_approved' | 'consultation_scheduled' | 'enrollment_confirmed' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export class NotificationService {
  private static getStorageKey(userId: string) {
    return `notifications_${userId}`;
  }

  static async createNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>) {
    try {
      const newNotification: Notification = {
        id: Date.now().toString(),
        userId,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      };

      const existing = this.getUserNotifications(userId);
      const updated = [newNotification, ...existing];
      
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
      return { success: true, id: newNotification.id };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }
  }

  static getUserNotifications(userId: string): Notification[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId));
      if (!stored) return [];
      
      const notifications = JSON.parse(stored);
      return notifications.sort((a: Notification, b: Notification) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markAsRead(userId: string, notificationId: string) {
    try {
      const notifications = this.getUserNotifications(userId);
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }

  static async clearAllNotifications(userId: string) {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
      return { success: true };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error };
    }
  }

  static getUnreadCount(userId: string): number {
    try {
      const notifications = this.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Form submission notifications
  static async notifyFormSubmission(userId: string, formType: string, formData: any) {
    const notifications = {
      'contact': {
        title: 'Contact Form Submitted',
        message: 'Your message has been sent successfully. We\'ll get back to you soon.',
        type: 'form_submitted' as const
      },
      'reviews': {
        title: 'Review Submitted',
        message: 'Thank you for your review! It\'s pending approval.',
        type: 'form_submitted' as const
      },
      'consultations': {
        title: 'Consultation Requested',
        message: 'Your consultation request has been submitted. Our counselor will reach out within 24 hours.',
        type: 'consultation_scheduled' as const
      },
      'bookdemo': {
        title: 'Demo Booking Confirmed',
        message: 'Your demo booking has been submitted. We\'ll contact you to confirm your session.',
        type: 'form_submitted' as const
      },
      'newsletter': {
        title: 'Newsletter Subscription',
        message: 'Successfully subscribed to our newsletter!',
        type: 'form_submitted' as const
      }
    };

    const notificationConfig = notifications[formType as keyof typeof notifications];
    if (notificationConfig) {
      return await this.createNotification(userId, {
        ...notificationConfig,
        data: { formType, submissionData: formData }
      });
    }
  }

  // Review approval notifications
  static async notifyReviewApproved(userId: string, reviewData: any) {
    return await this.createNotification(userId, {
      title: 'Review Approved!',
      message: 'Your review has been approved and is now visible on our website.',
      type: 'review_approved',
      data: reviewData
    });
  }
}

export const notificationService = NotificationService;