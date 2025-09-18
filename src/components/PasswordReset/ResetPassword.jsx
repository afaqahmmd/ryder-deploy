import React, { useState } from 'react';
import { MdArrowBack, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import { IoCheckmarkCircle } from 'react-icons/io5';

const ResetPassword = ({ email, otp, onPasswordReset, onBackToVerify }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/reset-password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp,
                    new_password: newPassword,
                    new_password_confirm: confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.details?.message === 'Password reset successfully') {
                onPasswordReset();
            } else {
                setError(data.details?.message || 'Failed to reset password');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <MdLock className="w-6 h-6" />,
            title: "Secure Password",
            description: "Create a strong, secure password"
        },
        {
            icon: <IoCheckmarkCircle className="w-6 h-6" />,
            title: "Quick Access",
            description: "Get back to your account instantly"
        },
        {
            icon: <RiRobot2Fill className="w-6 h-6" />,
            title: "Back to Chatbot",
            description: "Continue with your AI assistant"
        }
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Welcome & Features */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white flex-col justify-center">
                <div className="max-w-lg">
                    <div className="flex items-center mb-8">
                        <div className="bg-white/20 p-3 rounded-full mr-4">
                            <MdLock className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold">Set New Password</h1>
                    </div>
                    
                    <p className="text-blue-100 text-lg mb-8">
                        Create a new secure password for your account. Make sure it's strong and memorable.
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
                        onClick={onBackToVerify}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
                    >
                        <MdArrowBack className="w-5 h-5 mr-2" />
                        Back
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
                        <p className="text-gray-600">Enter your new password below.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MdLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <MdVisibilityOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <MdVisibility className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Must be at least 8 characters long</p>
                            </div>
                            
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MdLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Confirm new password"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <MdVisibilityOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <MdVisibility className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading || !newPassword || !confirmPassword || newPassword.length < 8}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <MdLock className="w-5 h-5 mr-2" />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
