# 🎓 AcadAI - AI-Powered Academic Advisor System

An intelligent academic advisor platform designed for students to track their grades, calculate GWA (General Weighted Average), get personalized subject recommendations, and plan their academic career path.

---

## ✨ Features

### 📊 **Grade Management & GWA Calculator**
- Track grades across multiple subjects with Philippine grading system (4.0 scale)
- Automatic GWA calculation based on weighted average
- Color-coded grade remarks (Excellent, Good, Average, Fair, Poor, Failed)
- Real-time grade updates with visual feedback

### 🤖 **AI-Powered Recommendations**
- Intelligent subject recommendations based on academic performance
- Thesis topic suggestions tailored to your course
- Career path matching based on grades and program

### 📈 **Academic Progress Tracking**
- Dashboard overview of best and worst performing subjects
- Progress reports and analytics
- Performance milestones and achievements
- Dean's List eligibility indicators

### 🌙 **User Experience Features**
- Light/Dark mode toggle with persistent preference
- Toast notifications for user actions
- Responsive design for all devices
- Smooth animations and micro-interactions

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js with Express |
| Storage | Browser LocalStorage (client-side) |
| API Integration | AI service integration for recommendations |
| Icons | FontAwesome 6.0 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open in browser
http://localhost:3000
```

⚠️ **IMPORTANT:** Do NOT open `index.html` by double-clicking. Always access the application through `http://localhost:3000` to ensure proper API connections and localStorage functionality.

### Stopping the Server
```bash
# Press Ctrl+C in the terminal
```

---

## 👤 Demo Account

Use these credentials to test the application:

| Field | Value |
|-------|-------|
| **Email** | maria.santos@uni.edu |
| **Password** | password123 |

This demo account comes pre-loaded with sample data for testing purposes.

---

## 📝 Function Reference

### 🔐 **Authentication Functions**

#### `doLogin()`
Validates user credentials (email/Student ID and password) against stored accounts. Displays error messages for invalid credentials and launches the main app on successful login.

#### `doRegister()`
Handles new user registration with full validation including:
- Full name and Student ID validation
- Email format verification
- Password strength requirements (min 8 characters)
- Password confirmation matching
- Duplicate account prevention
- Terms & Conditions acceptance

#### `logout()`
Clears the current session, resets the UI to login screen, and clears form fields and alerts.

#### `togglePw(inputId, btn)`
Toggles password field visibility between text and masked password view.

#### `checkPwStrength(pw)`
Real-time password strength indicator showing: Weak (red) → Fair (orange) → Good (yellow) → Strong (green) based on length, uppercase, numbers, and special characters.

---

### 📊 **Grade Management Functions**

#### `pctToGWA(pct)`
Converts percentage score (0-100) to Philippine GWA grading system (1.0-5.0 scale):
- 99%+ → 1.0 (Excellent)
- 90-98% → 1.75-1.25 (Very Good)
- 75-89% → 3.0-2.0 (Passing)
- <75% → 5.0 (Failed)

#### `computeGWA(subjects)`
Calculates weighted GWA across all subjects using the formula: (∑ GWA × units) / ∑ units. Returns null if no valid grades exist.

#### `gradeColor(gwa)` & `gradeRemark(gwa)`
- `gradeColor()` returns appropriate color codes (green/blue/yellow/red) for visual grade representation
- `gradeRemark()` returns HTML badges indicating performance level (Excellent, Good, Average, Fair, Poor, Failed)

#### `updateGrade(index, value)`
Updates a subject's percentage score, recalculates GWA, saves to storage, syncs with advisor, and displays confirmation toast.

#### `deleteSubject(index)`
Removes a subject from the grade list, updates storage, and refreshes dashboard display.

#### `renderDashboard()`
Main dashboard renderer that displays:
- All tracked subjects in a sortable table
- Current GWA and performance indicators
- Best performing subject
- Worst performing subject (if attention needed)
- Empty state message when no grades exist

---

### ➕ **Subject Management Functions**

#### `openAddSubjectModal()`
Opens a modal dialog for adding new subjects with fields for name, units (1-5), and optional percentage score.

#### `confirmAddSubject()`
Validates and saves new subject data to LocalStorage with error handling for duplicate names.

#### `getSubjects()` & `saveSubjects(s)`
- Getter: Retrieves all subjects from user's LocalStorage
- Setter: Saves subject array to LocalStorage with current user session prefix

---

### 🌙 **Theme & UI Functions**

#### `initTheme()`
Initializes theme preference on page load from LocalStorage.

#### `setTheme(theme)`
Applies light or dark theme to the entire application and updates toggle icon. Persists preference to LocalStorage.

#### `toggleTheme()`
Switches between light and dark modes with toast notification feedback.

#### `showToast(message, type)`
Displays a dismissible notification toast with types: 'success' (green), 'error' (red), 'info' (blue). Auto-dismisses after 4 seconds.

#### `animateCounter(element, target, duration)`
Animates a numeric counter from 0 to target value over specified duration (default 800ms). Used for stat animations.

---

### 🗂 **Storage Functions**

#### `getAccounts()` & `saveAccounts(a)`
Retrieve and save all user accounts. Automatically includes demo account on first load.

#### `getSession()` & `setSession(u)`
Manage current logged-in user session data in LocalStorage.

#### `getUserData(key, def)` & `setUserData(key, val)`
Per-user data storage helpers that automatically prefix keys with user email for data isolation.

#### `dataKey(key)`
Generates user-specific storage key format: `acadai_{email}_{key}`.

---

### 📱 **Navigation & Page Functions**

#### `showPage(name, btn)`
Switches between app pages (dashboard, reports, progress, etc.) with active state management. Triggers page-specific renderers.

#### `launchApp(user)`
Initializes main application interface after login:
- Hides auth screens and shows dashboard
- Displays user name, avatar, and greeting
- Triggers initial dashboard render
- Shows welcome toast

---

### 🎯 **Alert & Error Handling**

#### `showAlert(id, msg, type)` & `clearAlerts()`
- `showAlert()`: Displays validation/confirmation messages with icon indicators
- `clearAlerts()`: Clears all active alert messages

---

## 💾 Data Storage

The application uses **Browser LocalStorage** for data persistence:
- `acadai_accounts`: All registered user accounts
- `acadai_session`: Current logged-in user
- `acadai_theme`: User's theme preference (light/dark)
- `acadai_{email}_subjects`: Per-user subjects and grades

All data is stored locally and persists between sessions.

---

## 📧 Support & Contact

For issues or feature requests, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**License:** All Rights Reserved
