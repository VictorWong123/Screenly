import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100">
            <NavigationHeader />
            <div className="max-w-4xl mx-auto p-6 pt-20">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-zinc-100 mb-8">
                        Landing Page
                    </h1>

                    <div className="space-y-6">
                        {user ? (
                            <div className="space-y-4">
                                <p className="text-xl text-zinc-400 mb-8">
                                    Welcome back! What would you like to do today?
                                </p>
                                <div className="flex justify-center space-x-6">
                                    <button
                                        onClick={() => navigate('/timer')}
                                        className="px-8 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors text-lg"
                                    >
                                        Start Timer
                                    </button>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="px-8 py-4 bg-zinc-700 text-zinc-100 rounded-lg font-medium hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors text-lg"
                                    >
                                        View Dashboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xl text-zinc-400 mb-8">
                                    Track your productivity and manage your time effectively
                                </p>
                                <div className="flex justify-center space-x-6">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-8 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors text-lg"
                                    >
                                        Get Started
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
