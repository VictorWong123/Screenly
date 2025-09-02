import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState(null);

    useEffect(() => {
        // Create Supabase client
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('Environment variables:', {
            url: supabaseUrl,
            hasKey: !!supabaseKey,
            keyLength: supabaseKey?.length
        });

        if (supabaseUrl && supabaseKey) {
            console.log('Creating Supabase client...');
            const client = createClient(supabaseUrl, supabaseKey);
            setSupabase(client);
            console.log('Supabase client created');

            // Check current session
            client.auth.getSession().then(async ({ data: { session } }) => {
                if (session?.user) {
                    // Ensure user profile exists
                    await ensureUserProfile(session.user);
                }
                setUser(session?.user || null);
                setLoading(false);
            });

            // Listen for auth changes
            client.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state change:', event, session?.user?.email);

                if (event === 'SIGNED_IN' && session?.user) {
                    // Ensure user profile exists
                    await ensureUserProfile(session.user);
                }

                setUser(session?.user || null);
            });
        } else {
            console.log('Missing environment variables');
            setLoading(false);
        }
    }, []);

    const signIn = async (email, password) => {
        if (!supabase) throw new Error('Supabase not configured');

        console.log('Attempting sign in for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Sign in error:', error);
            throw error;
        }

        console.log('Sign in successful:', data.user?.email);
        console.log('User data:', data.user);
        console.log('Email confirmed at:', data.user?.email_confirmed_at);

        return data;
    };

    const signUp = async (email, password, username) => {
        if (!supabase) throw new Error('Supabase not configured');

        console.log('Attempting sign up for:', email, username);

        // Sign up with email confirmation disabled
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            console.error('Sign up error:', error);
            throw error;
        }

        // Create user profile immediately since email confirmation is disabled
        if (data.user) {
            console.log('User created, creating profile...');

            // Create user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: data.user.id,
                    username: username,
                    email: email
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't throw error here, just log it
            } else {
                console.log('User profile created successfully');
            }
        }

        console.log('Sign up successful:', data.user?.email);
        return data;
    };

    const ensureUserProfile = async (user) => {
        if (!supabase || !user) return;

        try {
            // Check if profile exists
            const { data: existingProfile, error: checkError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking profile:', checkError);
                return;
            }

            // If profile doesn't exist, create it
            if (!existingProfile) {
                console.log('Creating missing user profile for:', user.email);

                const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';

                const { error: createError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: user.id,
                        username: username
                    });

                if (createError) {
                    console.error('Error creating profile:', createError);
                } else {
                    console.log('User profile created successfully');
                }
            }
        } catch (error) {
            console.error('Error in ensureUserProfile:', error);
        }
    };

    const signOut = async () => {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            supabase,
            signIn,
            signUp,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};
