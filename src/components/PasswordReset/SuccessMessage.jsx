import React from 'react';
import { MdLogin, MdCheckCircle } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import { IoCheckmarkCircle } from 'react-icons/io5';

const SuccessMessage = ({ onGoToLogin }) => {
    const features = [
        {
            icon: <MdCheckCircle className="w-6 h-6" />,
            title: "Password Updated",
            description: "Your password has been successfully reset"
        },
        {
            icon: <IoCheckmarkCircle className="w-6 h-6" />,
            title: "Secure Access",
            description: "Your account is now protected with a new password"
        },
        {
            icon: <RiRobot2Fill className="w-6 h-6" />,
            title: "Ready to Continue",
            description: "Get back to your AI powered Sales Person"
        }
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Welcome & Features */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-700 p-12 text-white flex-col justify-center">
                <div className="max-w-lg">
                    <div className="flex items-center mb-8">
                        <div className="bg-white/20 p-3 rounded-full mr-4">
                            <MdCheckCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold">Success!</h1>
                    </div>
                    
                    <p className="text-green-100 text-lg mb-8">
                        Your password has been successfully updated. You can now log in to your account using your new password.
                    </p>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start">
                                <div className="bg-white/20 p-2 rounded-lg mr-4 flex-shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                    <p className="text-green-100">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Success Message */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <MdCheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
                        <p className="text-gray-600 text-lg">
                            Your password has been successfully updated. You can now log in to your account using your new password.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-600 mb-6">
                                    Ready to get back to your AI powered Sales Person?
                                </p>
                            </div>
                            
                            <button
                                onClick={onGoToLogin}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center"
                            >
                                <MdLogin className="w-5 h-5 mr-2" />
                                Go to Login
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    Having trouble?{' '}
                                    <button
                                        type="button"
                                        onClick={onGoToLogin}
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Contact Support
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessMessage;
