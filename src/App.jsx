import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SignupPage from './components/SignupPage'
import AuthLoginPage from './components/AuthLoginPage'
import Dashboard from './components/Dashboard'
import PasswordResetContainer from './components/PasswordReset/PasswordResetContainer'
import LandingPage from './components/LandingPage'

import AuthWrapper from './components/AuthWrapper'
import { clearSignupState } from './store/signup/signupSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useTokenManager } from './hooks/useTokenManager'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import DebugLogin from './components/DebugLogin'
import { getCookie } from 'cookies-next'
import { restoreSession } from './store/login/loginSlice'
import ProtectedRoute from './components/ProtectedRoute'
import { useSessionPersistence } from './hooks/useSessionPersistence'

const SignupRoute = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(state => state.login)
  const { isEmailVerified } = useSelector(state => state.signup)
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated || isEmailVerified) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isEmailVerified, navigate])
  
  const handleSuccessfulSignup = (data) => {
    // After successful signup, redirect to dashboard
    navigate('/dashboard')
  }

  const switchToLogin = () => {
    navigate('/login')
  }

  return <SignupPage onSuccessfulSignup={handleSuccessfulSignup} onSwitchToLogin={switchToLogin} />
}

const LoginRoute = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(state => state.login)
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])
  
  const handleSuccessfulLogin = (data) => {
    // After successful login, redirect to dashboard
    navigate('/dashboard')
  }

  const switchToSignup = () => {
    navigate('/signup')
  }

  const handleForgotPassword = () => {
    navigate('/password-reset')
  }

  return <AuthLoginPage onSuccessfulLogin={handleSuccessfulLogin} onSwitchToSignup={switchToSignup} onForgotPassword={handleForgotPassword} />
}

const PasswordResetRoute = () => {
  const navigate = useNavigate()
  
  const handleBackToLogin = () => {
    navigate('/login')
  }

  return <PasswordResetContainer onBackToLogin={handleBackToLogin} />
}

// Inner App component that uses the token manager hook
const AppContent = () => {
  const dispatch = useDispatch();
  // Initialize token management system
  const tokenManager = useTokenManager();
  const { isDark } = useTheme();

  // Initialize session persistence
  useSessionPersistence();

  // Restore session on app initialization
  useEffect(() => {
    const restoreSessionData = () => {
      try {
        const userSession = localStorage.getItem('user_session');
        const token = getCookie('token');
        
        if (userSession && token) {
          const sessionData = JSON.parse(userSession);
          console.log("App: Restoring session from localStorage:", sessionData);
          
          // Restore auth state in Redux
          dispatch(restoreSession({
            user: sessionData.user,
            tokens: { access_token: token },
            expiresAt: sessionData.expiresAt
          }));
        }
      } catch (error) {
        console.error("App: Error restoring session:", error);
      }
    };

    restoreSessionData();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* <DebugLogin /> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/password-reset" element={<PasswordResetRoute />} />
        <Route path="/dashboard" element={
          <AuthWrapper>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </AuthWrapper>
        } />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
