# AlYusr Institute - Islamic Education Platform

A comprehensive React-based educational platform for AlYusr Institute, offering robust and scalable solutions for Islamic education management.

## 🌟 Features

### **User Management System**
- **Admin Dashboard**: Complete control over teachers, students, and admin accounts
- **Role-based Authentication**: Secure login system with role-specific dashboards
- **User Creation**: Admin can create teacher and student accounts with custom passwords

### **Educational Features**
- **Course Management**: Browse and enroll in various Islamic courses
- **Interactive Dashboards**: Specialized interfaces for students, teachers, and administrators
- **Replacement Class System**: Request and manage replacement classes for missed sessions
- **Real-time Notifications**: Stay updated with course activities and announcements

### **Modern Design**
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Islamic Aesthetics**: Clean, professional interface with Islamic design principles
- **Dark Green Theme**: Professional color scheme (#013626 primary, #681616 accents)

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **State Management**: React hooks and context
- **Authentication**: Role-based authentication system
- **Icons**: Lucide React icons
- **Fonts**: Poppins (primary), Inter (headings)

## 📱 Mobile Optimization

- Touch-friendly interface with minimum 44px touch targets
- Responsive navigation with mobile hamburger menu
- Optimized typography and spacing for mobile screens
- Smooth scrolling and animations
- Mobile-first responsive design approach

## 🎯 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd alyusr-institute

# Install dependencies
npm install

# Start development server
npm run dev
```

### Default Login Credentials
- **Admin**: admin@alyusr.com / admin123
- **Teacher**: hassan@alyusr.com / teacher123
- **Student**: sarah@student.com / student123

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   └── dashboards/ # Role-specific dashboards
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express server
├── shared/                 # Shared types and schemas
└── README.md
```

## 🎨 Design System

### Colors
- **Primary Green**: #013626 (navigation, headers)
- **Accent Red**: #681616 (buttons, highlights)
- **Text**: Professional grays and blacks
- **Backgrounds**: Clean whites and light grays

### Typography
- **Headings**: Inter font family
- **Body**: Poppins font family
- **Mobile**: 16px base font size for readability

## 🔐 User Management

### Admin Capabilities
- Create and manage teacher accounts
- Create and manage student accounts
- Add additional admin users
- View comprehensive analytics and reports
- Manage course enrollments and payments

### Authentication Flow
1. User enters email and password
2. System validates against admin-managed user database
3. Automatic redirect to role-appropriate dashboard
4. Session management with logout functionality

## 📊 Dashboard Features

### Student Dashboard
- Course enrollment and progress tracking
- Schedule management and class calendar
- Request replacement classes for missed sessions
- Direct communication with teachers
- Payment and subscription management

### Teacher Dashboard
- Student management and progress tracking
- Class scheduling and attendance
- Course material management
- Communication tools
- Performance analytics

### Admin Dashboard
- Comprehensive user management
- Financial reporting and analytics
- Course and curriculum management
- System settings and configuration
- Replacement class approval system

## 🌐 Deployment

The application is optimized for deployment on modern hosting platforms:

- **Responsive Design**: Works seamlessly across all devices
- **Performance Optimized**: Fast loading times and smooth interactions
- **SEO Ready**: Proper meta tags and semantic HTML structure
- **Production Ready**: Optimized build process and asset management

## 📞 Support

For technical support or feature requests, contact the development team or submit an issue through the project repository.

## 📄 License

This project is proprietary software developed for AlYusr Institute.

---

**Built with ❤️ for Islamic Education**