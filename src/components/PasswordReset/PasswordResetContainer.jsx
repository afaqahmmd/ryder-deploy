import React, { useState } from 'react';
import RequestReset from './RequestReset';
import VerifyOTP from './VerifyOTP';
import ResetPassword from './ResetPassword';
import SuccessMessage from './SuccessMessage';

const PasswordResetContainer = ({ onBackToLogin }) => {
    const [step, setStep] = useState('request'); // request, verify, reset, success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    console.log("PasswordResetContainer")

    const handleOTPSent = (userEmail) => {
        setEmail(userEmail);
        setStep('verify');
    };

    const handleOTPVerified = (verifiedOTP) => {
        setOtp(verifiedOTP);
        setStep('reset');
    };

    const handlePasswordReset = () => {
        setStep('success');
    };

    const handleBackToRequest = () => {
        console.log("handleBackToRequest")
        setStep('request');
        setOtp('');
    };

    const handleBackToVerify = () => {
        setStep('verify');
    };

    const handleGoToLogin = () => {
        onBackToLogin();
    };

    const renderStep = () => {
        switch (step) {
            case 'request':
                return <RequestReset onOTPSent={handleOTPSent} onBackToLogin={handleGoToLogin} />;
            case 'verify':
                return <VerifyOTP email={email} onOTPVerified={handleOTPVerified} onBackToRequest={handleGoToLogin} />;
            case 'reset':
                return <ResetPassword email={email} onPasswordReset={handlePasswordReset} onBackToVerify={handleGoToLogin} />;
            case 'success':
                // in case of success, go to login
                alert("success")
                handleGoToLogin()
                return <SuccessMessage onGoToLogin={handleGoToLogin} />;
            default:
                return <RequestReset onOTPSent={handleOTPSent} onBackToLogin={handleGoToLogin} />;
        }
    };

    return (
        <div className="password-reset-container">
            {renderStep()}
        </div>
    );
};

export default PasswordResetContainer;
