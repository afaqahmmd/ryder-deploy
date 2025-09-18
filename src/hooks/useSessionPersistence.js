import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCookie } from 'cookies-next';
import { restoreSession } from '../store/login/loginSlice';

/**
 * Custom hook to handle session persistence during browser navigation
 */
export const useSessionPersistence = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Ensure session data is saved before page unload
      const userSession = localStorage.getItem('user_session');
      if (userSession) {
        // Session is already saved, no action needed
        console.log('Session persistence: Session data preserved');
      }
    };

    const handlePopState = () => {
      // Handle back/forward navigation
      console.log('Session persistence: Browser navigation detected');
      
      // Check if we have valid session data
      const userSession = localStorage.getItem('user_session');
      const token = getCookie('token');
      
      if (userSession && token) {
        try {
          const sessionData = JSON.parse(userSession);
          console.log('Session persistence: Restoring session after navigation');
          
          // Restore session in Redux
          dispatch(restoreSession({
            user: sessionData.user,
            tokens: { access_token: token },
            expiresAt: sessionData.expiresAt
          }));
        } catch (error) {
          console.error('Session persistence: Error restoring session:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [dispatch, location.pathname]);
};
