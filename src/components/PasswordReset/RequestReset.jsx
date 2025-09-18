import React, { useState } from 'react';
import { MdEmail, MdArrowBack } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import { IoCheckmarkCircle } from 'react-icons/io5';

const RequestReset = ({ onOTPSent, onBackToLogin }) => {
    console.log("RequestReset")
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    console.log("here i am")


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/request-password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok && data.details?.message === 'Password reset OTP sent successfully') {
                onOTPSent(email);
            } else {
                setError(data.details?.message || 'Failed to send OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <RiRobot2Fill className="w-6 h-6" />,
            title: "Reset Password",
            description: "Get back to your AI-powered Sales Person"
        },
        {
            icon: <IoCheckmarkCircle className="w-6 h-6" />,
            title: "Secure Process",
            description: "Your account security is our priority"
        },
        {
            icon: <MdEmail className="w-6 h-6" />,
            title: "Quick Recovery",
            description: "Reset your password in minutes"
        }
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Welcome & Features */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white flex-col justify-center">
                <div className="max-w-lg">
                    <div className="flex items-center mb-8">
                        <div className="bg-white/20 p-3 rounded-full mr-4">
                            <RiRobot2Fill className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold">Reset Password</h1>
                    </div>
                    
                    <p className="text-blue-100 text-lg mb-8">
                        Enter your email address and we'll send you a verification code to reset your password.
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
                    {/* Back to Login Button */}
                    <button
                        onClick={onBackToLogin}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
                    >
                        <MdArrowBack className="w-5 h-5 mr-2" />
                        Back to Login
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                        <p className="text-gray-600">Enter your email address to receive a password reset code.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MdEmail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            
                            <button
                                // type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <MdEmail className="w-5 h-5 mr-2" />
                                        Send Reset Code
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

export default RequestReset;
