import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCookie } from 'cookies-next';
import { checkTokenValidity } from '../utils/tokenManager';

export const useAuth = () => {
  const dispatch = useDispatch();
  const signupState = useSelector(state => state.signup);
  const loginState = useSelector(state => state.login);
  console.log(loginState);
  const authState = loginState.isAuthenticated ? loginState : signupState;
  const { user, tokens, expiresAt, isEmailVerified } = authState;

  useEffect(() => {
    const accessToken = getCookie('token');

    if (accessToken && expiresAt) {
      checkTokenValidity(dispatch, expiresAt);
    }
  }, [dispatch, expiresAt]);

  const checkAuthenticated = () => {
    return !!(user && tokens && (isEmailVerified || loginState.isAuthenticated));
  };

  const getAuthToken = () => {
    return getCookie('token');
  };

  return {
    user,
    tokens,
    isAuthenticated: checkAuthenticated(),
    getAuthToken,
    expiresAt
  };
}; 