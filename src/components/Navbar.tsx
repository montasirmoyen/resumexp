"use client";

import { Star, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-navbar shadow-xl shadow-navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <a href="/">
                        <div className="flex items-center">
                            <Star className="p-2 text-primary" width={40} height={40} fill="currentColor" />
                            <h1 className="text-2xl font-bold">ResumeXP</h1>
                        </div>
                    </a>
                    
                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                {user.email}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}