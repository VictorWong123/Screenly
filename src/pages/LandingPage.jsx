import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-10">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-zinc-100 mb-6">
                        Screenly
                    </h1>
                    <p className="text-xl text-zinc-400 mb-8">
                        Track your productivity with intelligent manual time tracking and beautiful analytics
                    </p>

                    {user ? (
                        <div className="space-y-4">
                            <a
                                href="/dashboard"
                                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Go to Dashboard
                            </a>
                            <br />
                            <a
                                href="/timer"
                                className="inline-block bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Start Timer
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <a
                                href="/login"
                                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Get Started
                            </a>
                            <br />
                            <a
                                href="/login"
                                className="inline-block bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Sign In
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default LandingPage;
