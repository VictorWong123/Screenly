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
            client.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user || null);
                setLoading(false);
            });

            // Listen for auth changes
            client.auth.onAuthStateChange((event, session) => {
                setUser(session?.user || null);
            });
        } else {
            console.log('Missing environment variables');
            setLoading(false);
        }
    }, []);

    const signIn = async (email, password) => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    };

    const signUp = async (email, password, username) => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) throw error;
        return data;
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
