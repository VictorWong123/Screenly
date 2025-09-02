import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const SettingsPage = () => {
    const { user, signOut, supabase } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [usernameData, setUsernameData] = useState({
        newUsername: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New passwords do not match');
            setIsLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage('New password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            setMessage('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsernameChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (!usernameData.newUsername.trim()) {
            setMessage('Username cannot be empty');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                data: { username: usernameData.newUsername }
            });

            if (error) throw error;

            setMessage('Username updated successfully');
            setUsernameData({ newUsername: '' });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            // Delete user data from all tables
            const { error: profileError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', user.id);

            const { error: activitiesError } = await supabase
                .from('activities')
                .delete()
                .eq('user_id', user.id);

            const { error: sessionsError } = await supabase
                .from('timer_sessions')
                .delete()
                .eq('user_id', user.id);

            const { error: timersError } = await supabase
                .from('current_timers')
                .delete()
                .eq('user_id', user.id);

            // Delete the user account
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

            if (profileError || activitiesError || sessionsError || timersError || deleteError) {
                throw new Error('Failed to delete account');
            }

            await signOut();
        } catch (error) {
            setMessage(error.message);
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2">Settings</h1>
                    <p className="text-zinc-400">Manage your account settings and preferences</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/20 text-green-300' : 'bg-red-500/20 border border-red-500/20 text-red-300'}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Change Password */}
                    <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-700/60 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-700/60 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    {/* Change Username */}
                    <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Change Username</h2>
                        <form onSubmit={handleUsernameChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">New Username</label>
                                <input
                                    type="text"
                                    value={usernameData.newUsername}
                                    onChange={(e) => setUsernameData({ newUsername: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-700/60 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60"
                                    placeholder="Enter new username"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors"
                            >
                                {isLoading ? 'Updating...' : 'Update Username'}
                            </button>
                        </form>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Delete Account</h2>
                        <p className="text-zinc-400 mb-4">This action cannot be undone. All your data will be permanently deleted.</p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Delete Account
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-red-300 font-medium">Are you sure you want to delete your account?</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SettingsPage;
