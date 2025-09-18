import React, { useState } from 'react';
import { MdArrowBack, MdSecurity } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import { IoCheckmarkCircle } from 'react-icons/io5';

const VerifyOTP = ({ email, onOTPVerified, onBackToRequest }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/verify-password-reset-otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email,
                    otp: otp 
                })
            });

            const data = await response.json();

            if (response.ok && data.details?.message === 'OTP verified successfully. You can now reset your password.') {
                onOTPVerified(otp);
            } else {
                setError(data.details?.message || 'Failed to verify OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <MdSecurity className="w-6 h-6" />,
            title: "Secure Verification",
            description: "Your identity is verified securely"
        },
        {
            icon: <IoCheckmarkCircle className="w-6 h-6" />,
            title: "Quick Process",
            description: "Verify and reset in minutes"
        },
        {
            icon: <RiRobot2Fill className="w-6 h-6" />,
            title: "Back to Chatbot",
            description: "Get back to your AI assistant"
        }
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Welcome & Features */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white flex-col justify-center">
                <div className="max-w-lg">
                    <div className="flex items-center mb-8">
                        <div className="bg-white/20 p-3 rounded-full mr-4">
                            <MdSecurity className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold">Verify Code</h1>
                    </div>
                    
                    <p className="text-blue-100 text-lg mb-8">
                        We've sent a 6-digit verification code to your email address. Enter it below to continue.
                    </p>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start">
                                <div className="bg-white/20 p-2 rounded-lg mr-4 flex-shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                    <p className="text-blue-100">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <button
                        onClick={onBackToRequest}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
                    >
                        <MdArrowBack className="w-5 h-5 mr-2" />
                        Back
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
                        <p className="text-gray-600">We've sent a 6-digit code to <span className="font-semibold">{email}</span></p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MdSecurity className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest"
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code from your email</p>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <MdSecurity className="w-5 h-5 mr-2" />
                                        Verify Code
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={onBackToRequest}
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Resend
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
