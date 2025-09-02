import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NavigationHeader from '../components/NavigationHeader';

const LoginPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                await signUp(email, password, username);
            } else {
                await signIn(email, password);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100">
            <NavigationHeader />
            <div className="flex items-center justify-center pt-20">
                <div className="max-w-md w-full mx-6">
                    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-zinc-100 mb-2">
                                {isSignUp ? 'Screenly - Create Account' : 'Screenly - Welcome Back'}
                            </h1>
                            <p className="text-zinc-400">
                                {isSignUp ? 'Start tracking your productivity today' : 'Sign in to continue'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isSignUp && (
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
