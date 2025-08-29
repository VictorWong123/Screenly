import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationHeader = () => {
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Brand */}
                    <Link to="/" className="text-2xl font-bold text-zinc-100 hover:text-purple-400 transition-colors">
                        Screenly
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {user && (
                            <Link
                                to="/timer"
                                className="text-zinc-300 hover:text-zinc-100 transition-colors"
                            >
                                Timer
                            </Link>
                        )}
                        {user && (
                            <Link
                                to="/dashboard"
                                className="text-zinc-300 hover:text-zinc-100 transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-zinc-300 text-sm">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-zinc-300 hover:text-zinc-100 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavigationHeader;
