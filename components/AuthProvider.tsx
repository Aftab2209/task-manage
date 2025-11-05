// components/AuthProvider.tsx
"use client"

import { useEffect, useState } from 'react';
import LoginDrawer from './login';
interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = () => {
            try {
                const userStr = localStorage.getItem('user');

                if (userStr) {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setShowLogin(true); // Show login drawer
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setIsAuthenticated(false);
                setShowLogin(true);
            }
        };

        checkAuth();
    }, []);

    const handleLoginSuccess = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData)); // Make sure to update localStorage
        setUser(userData);
        setIsAuthenticated(true);
        setShowLogin(false);
        // Dispatch event to notify useAuth hook
        window.dispatchEvent(new CustomEvent('storage-update', { detail: { key: 'user' } }));
    };

    // Show loading while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Always render children, but show login drawer if not authenticated */}
            {children}

            <LoginDrawer
                isOpen={showLogin}
                onClose={() => { }} // Prevent closing when not authenticated
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
}