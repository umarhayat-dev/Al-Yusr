import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, Bell, Settings, LogOut, User, Trash2 } from "lucide-react";
import { notificationService, type Notification } from "@/lib/notificationService";

import logoImage from "@assets/logo_w_1748522480431.jpg";

interface NavigationProps {
  onBookDemoClick: () => void;
  onConsultationClick: () => void;
  onLoginClick?: () => void;
  user?: {
    name: string;
    email: string;
    initials: string;
    role: 'student' | 'teacher' | 'admin' | 'finance';
  } | null;
  onLogout?: () => void;
  isLoading?: boolean;
}

export default function Navigation({ onBookDemoClick, onConsultationClick, onLoginClick, user, onLogout, isLoading }: NavigationProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/donate", label: "Donate" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact Us" },
  ];

  // Fetch user notifications when user is logged in
  useEffect(() => {
    if (user?.email) {
      const fetchNotifications = () => {
        try {
          const userNotifications = notificationService.getUserNotifications(user.email);
          const unreadCount = notificationService.getUnreadCount(user.email);
          setNotifications(userNotifications);
          setUnreadCount(unreadCount);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.email]);

  const handleLogout = () => {
    onLogout?.();
    window.location.href = '/';
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && user?.email) {
      await notificationService.markAsRead(user.email, notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  };

  const handleClearAllNotifications = async () => {
    if (user?.email) {
      const result = await notificationService.clearAllNotifications(user.email);
      if (result.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  const NavItems = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={`${
              mobile
                ? "block px-3 py-2 text-base font-medium cursor-pointer"
                : "text-sm font-medium cursor-pointer"
            } hover:text-green-200 transition-colors ${
              location === item.href ? "text-green-200" : "text-white"
            }`}
            onClick={onItemClick}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </>
  );

  const UserSection = ({ mobile = false }) => {
    if (!user) {
      return (
        <div className={`${mobile ? 'flex flex-col space-y-3' : 'flex items-center space-x-4'}`}>
          <Button
            variant="outline"
            onClick={onBookDemoClick}
            className={`${mobile ? 'w-full' : ''} text-reseda-green border-reseda-green hover:bg-champagne-pink rounded-2xl button-hover`}
          >
            Book a Demo
          </Button>
          <Button
            variant="outline"
            onClick={onConsultationClick}
            className={`${mobile ? 'w-full' : ''} text-sage border-sage hover:bg-champagne-pink rounded-2xl button-hover`}
          >
            Free Consultation
          </Button>
          <Link href="/login">
            <Button
              className={`${mobile ? 'w-full' : ''} bg-reseda-green hover:bg-black-olive text-champagne-pink rounded-2xl button-hover`}
            >
              Login
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className={`${mobile ? 'flex flex-col space-y-3' : 'flex items-center space-x-4'}`}>
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <p className="font-medium">Notifications</p>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllNotifications}
                  className="h-6 px-2 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex flex-col space-y-1 w-full">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-10 h-10 rounded-full bg-reseda-green text-champagne-pink font-medium hover:bg-sage">
              {user.initials}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            <DropdownMenuItem onClick={() => window.location.href = `/${user.role}`}>
              <User className="mr-2 h-4 w-4" />
              {user.role === 'admin' ? 'Admin Dashboard' : 
               user.role === 'teacher' ? 'Teacher Dashboard' : 
               user.role === 'student' ? 'Student Dashboard' :
               user.role === 'finance' ? 'Finance Dashboard' : 'Dashboard'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <nav className="bg-black-olive shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <img src={logoImage} alt="AlYusr Institute Logo" className="w-8 h-8 rounded object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-sans font-bold text-white">AlYusr Institute</h1>
                <p className="text-xs text-green-200 leading-none font-sans">Excellence in Islamic Education</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItems />
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex">
            <UserSection />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-2 mb-8">
                    <div className="w-8 h-8 rounded flex items-center justify-center">
                      <img src={logoImage} alt="AlYusr Institute Logo" className="w-8 h-8 rounded object-contain" />
                    </div>
                    <div>
                      <h1 className="text-lg font-heading font-bold text-gray-900">AlYusr Institute</h1>
                      <p className="text-xs text-gray-600 leading-none font-sans">Excellence in Islamic Education</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col space-y-4 mb-8">
                    <NavItems mobile onItemClick={() => setIsOpen(false)} />
                  </div>

                  {/* Mobile User Section */}
                  <div className="mt-auto mb-6">
                    <UserSection mobile />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}