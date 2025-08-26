import React, { useState } from 'react';

const AuthForm = ({ onLogin, onSignup }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (isLogin) {
                result = await onLogin(email, password);
            } else {
                result = await onSignup(email, password, username);
            }

            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!isLogin}
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </form>
    );
};

export default AuthForm;
