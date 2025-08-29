import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationHeader = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/timer');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50">
            <div className="max-w-[1200px] mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl font-bold text-zinc-100">ScreenTime</h1>

                        <nav className="flex items-center space-x-6">
                            <button
                                onClick={() => navigate('/timer')}
                                className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                            >
                                Timer
                            </button>
                            {user && (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                                >
                                    Dashboard
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-zinc-100">
                                        {user.user_metadata?.username || user.email}
                                    </p>
                                    <p className="text-xs text-zinc-400">Signed in</p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-800 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavigationHeader;
