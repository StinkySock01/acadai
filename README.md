# AcadAI

AI-powered academic advisor system for students to track grades, calculate GWA, and get personalized recommendations.

## Features

- **Grade Management**: Track subjects with Philippine GWA grading system
- **GWA Calculator**: Automatic weighted average calculation
- **AI Recommendations**: Subject and career suggestions based on performance
- **Dark Mode**: Light/Dark theme toggle
- **Progress Tracking**: Dashboard with best/worst subjects and performance metrics

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js
- **Storage**: Browser LocalStorage
- **Icons**: FontAwesome 6.0

## Getting Started

### Setup
```bash
npm install
node server.js
```

Open: `http://localhost:3000` (do NOT double-click index.html)

### Demo Account
- **Email**: maria.santos@uni.edu
- **Password**: password123

## Key Functions

### Authentication
- `doLogin()` - Validates credentials and launches app
- `doRegister()` - Handles user registration with validation
- `logout()` - Clears session and returns to login

### Grade Management
- `pctToGWA(pct)` - Converts percentage (0-100) to GWA (1.0-5.0) using Philippine grading scale
- `computeGWA(subjects)` - Calculates weighted GWA across all subjects
- `updateGrade(index, value)` - Updates subject percentage and syncs data
- `deleteSubject(index)` - Removes subject from list
- `renderDashboard()` - Displays grades, GWA, and performance metrics

### Subject Management
- `openAddSubjectModal()` - Opens dialog to add new subject
- `confirmAddSubject()` - Validates and saves new subject
- `getSubjects()` / `saveSubjects()` - Retrieves/saves subject data from storage

### UI & Theme
- `initTheme()` - Loads theme preference on startup
- `setTheme(theme)` - Applies light/dark theme
- `toggleTheme()` - Switches between themes
- `showToast(message, type)` - Displays notification toasts

### Storage
- `getAccounts()` / `saveAccounts()` - Manage user accounts
- `getSession()` / `setSession()` - Manage user session
- `getUserData()` / `setUserData()` - Per-user data storage

### Navigation
- `showPage(name, btn)` - Switches between pages
- `launchApp(user)` - Initializes dashboard after login

## Data Persistence

LocalStorage keys:
- `acadai_accounts` - All user accounts
- `acadai_session` - Current logged-in user
- `acadai_theme` - Theme preference
- `acadai_{email}_subjects` - User's subjects and grades

---

**Version:** 1.0.0
