import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const DebugLogin = () => {
  const loginState = useSelector(state => state.login);
  
  useEffect(() => {
    console.log('DebugLogin: Login state changed:', loginState);
  }, [loginState]);

};

export default DebugLogin;
