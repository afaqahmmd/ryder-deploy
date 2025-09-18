# Dark Mode Implementation Guide

## 🌓 Overview

The Ryder Partners application now features a complete dark mode implementation that allows users to switch between light, dark, and auto (system preference) themes. The dark mode is fully integrated into all components with proper styling and state persistence.

## ✨ Features

- **Three Theme Options**: Light, Dark, and Auto (follows system preference)
- **Persistent Settings**: Theme choice is saved in localStorage
- **System Preference Detection**: Auto mode respects user's OS theme
- **Real-time Switching**: Instant theme changes without page reload
- **Comprehensive Coverage**: All components support dark mode
- **Mobile Support**: Theme color meta tag for mobile browsers
- **Accessible Design**: Proper contrast ratios in both themes

## 🎯 How to Use

### 1. Settings Page (Primary Method)
1. Navigate to **Dashboard > Settings**
2. In the **General Settings** section, you'll see **Application Theme**
3. Choose from three options:
   - **Light**: Always use light mode
   - **Dark**: Always use dark mode  
   - **Auto**: Follow system preference

### 2. Sidebar Toggle (Quick Access)
- Click the **Dark Mode** / **Light Mode** button in the sidebar
- This toggles between light and dark modes (doesn't affect auto mode)

### 3. Programmatic Access
```javascript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, effectiveTheme, changeTheme, toggleTheme, isDark } = useTheme();
  
  // Change to specific theme
  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme); // 'light', 'dark', or 'auto'
  };
  
  // Toggle between light and dark
  const handleToggle = () => {
    toggleTheme();
  };
  
  return (
    <div className={`p-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <p>Current theme: {theme}</p>
      <p>Effective theme: {effectiveTheme}</p>
    </div>
  );
};
```

## 🏗️ Architecture

### Theme Context (`src/contexts/ThemeContext.jsx`)
The core of the dark mode system is a React Context that provides:
- **State Management**: Tracks user's theme preference and effective theme
- **Persistence**: Saves preferences to localStorage
- **System Detection**: Listens for OS theme changes
- **DOM Manipulation**: Applies theme classes to document root

### Theme Hook (`useTheme`)
A custom hook that provides easy access to theme functionality:
```javascript
const {
  theme,          // User's selected theme: 'light', 'dark', 'auto'
  effectiveTheme, // Actual applied theme: 'light' or 'dark'
  changeTheme,    // Function to change theme
  toggleTheme,    // Function to toggle between light/dark
  isDark,         // Boolean: is current theme dark?
  isLight,        // Boolean: is current theme light?
  isAuto          // Boolean: is auto mode enabled?
} = useTheme();
```

### Tailwind Configuration
The project uses Tailwind's dark mode with class strategy:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // Enables dark mode via class
  // ... rest of config
}
```

## 🎨 Styling Guidelines

### Using Dark Mode Classes
Apply dark mode styles using Tailwind's `dark:` prefix:

```jsx
// Basic example
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content that changes with theme
</div>

// Complex example with borders, buttons, etc.
<button className="
  bg-blue-600 hover:bg-blue-700 
  dark:bg-blue-700 dark:hover:bg-blue-800 
  text-white px-4 py-2 rounded-lg 
  border border-blue-600 dark:border-blue-700
">
  Themed Button
</button>
```

### Color Palette
The implementation uses a consistent color palette:

#### Light Mode
- **Background**: `bg-white`, `bg-gray-50`, `bg-gray-100`
- **Text**: `text-gray-900`, `text-gray-700`, `text-gray-600`
- **Borders**: `border-gray-200`, `border-gray-300`
- **Accent**: `bg-blue-600`, `text-blue-700`

#### Dark Mode
- **Background**: `dark:bg-gray-800`, `dark:bg-gray-700`, `dark:bg-gray-900`
- **Text**: `dark:text-white`, `dark:text-gray-300`, `dark:text-gray-400`
- **Borders**: `dark:border-gray-700`, `dark:border-gray-600`
- **Accent**: `dark:bg-blue-700`, `dark:text-blue-300`

## 🔧 Technical Implementation

### 1. Theme Provider Setup
The app is wrapped with `ThemeProvider` in `App.jsx`:
```jsx
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
```

### 2. Component Integration
Major components updated with dark mode support:
- ✅ **Dashboard**: Complete dark mode styling
- ✅ **Settings**: Functional theme selector with visual feedback
- ✅ **Sidebar**: Dark mode styles + quick theme toggle
- ✅ **Auth Components**: Login, signup pages (inherited from App background)
- ✅ **Toast Notifications**: Dynamic theme based on current mode

### 3. Persistence Layer
Theme preferences are automatically saved to localStorage:
```javascript
// Key: 'app-theme'
// Values: 'light', 'dark', 'auto'
localStorage.setItem('app-theme', 'dark');
```

### 4. System Integration
- **OS Theme Detection**: Listens to `prefers-color-scheme` media query
- **Mobile Support**: Updates `theme-color` meta tag dynamically
- **Class Application**: Adds/removes `dark` class on document root

## 🧪 Testing

### Test Component
A test component is available at `src/components/ThemeTestComponent.jsx` that shows:
- Current theme state
- All available controls
- Visual feedback for theme changes

To use the test component, import and render it in any page:
```jsx
import ThemeTestComponent from './components/ThemeTestComponent';

// Render anywhere to test theme functionality
<ThemeTestComponent />
```

### Manual Testing Checklist
- [ ] Theme selector in Settings works
- [ ] Sidebar toggle switches themes
- [ ] Auto mode follows system preference
- [ ] Theme persists after page reload
- [ ] All components display properly in both themes
- [ ] Toast notifications match current theme
- [ ] Mobile browsers show correct theme color

## 🎯 Best Practices

### For Developers
1. **Always use dark mode classes** for new components
2. **Test in both themes** during development
3. **Use the color palette** defined in this guide
4. **Prefer semantic colors** over hardcoded ones
5. **Test auto mode** with system theme changes

### For Users
1. **Use Auto mode** for best system integration
2. **Settings page** for permanent theme changes
3. **Sidebar toggle** for quick switching
4. **Theme persists** across browser sessions

## 🐛 Troubleshooting

### Common Issues

**Theme not applying:**
- Check if ThemeProvider wraps the component
- Verify Tailwind's dark mode is configured
- Ensure `dark` class is on document root

**Theme not persisting:**
- Check localStorage permissions
- Verify no console errors during theme changes

**Auto mode not working:**
- Check browser's `prefers-color-scheme` support
- Test with manual OS theme changes

### Debug Tools
```javascript
// Check current theme state in console
console.log('Theme:', localStorage.getItem('app-theme'));
console.log('Has dark class:', document.documentElement.classList.contains('dark'));
console.log('System prefers dark:', window.matchMedia('(prefers-color-scheme: dark)').matches);
```

## 🚀 Future Enhancements

Possible improvements for the dark mode system:
- **Custom theme colors**: Allow users to customize accent colors
- **High contrast mode**: For accessibility
- **Scheduled themes**: Auto-switch based on time of day
- **Per-component themes**: Different themes for different sections

---

## 📝 Summary

The dark mode implementation provides a comprehensive theming solution that:
- ✅ Works across all application components
- ✅ Persists user preferences
- ✅ Supports system integration
- ✅ Provides multiple access methods
- ✅ Follows accessibility best practices
- ✅ Is easy to extend and maintain

Users can now enjoy a personalized visual experience that matches their preferences and system settings! 