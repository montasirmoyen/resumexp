import Image from 'next/image';
import { Star } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-navbar shadow-xl shadow-navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <a href="/">
                        <div className="flex items-center">
                            <Star className="p-2 text-primary" width={40} height={40} fill="currentColor" />
                            <h1 className="text-2xl font-bold">enhanceme</h1>
                        </div>
                    </a>
                </div>
            </div>
        </nav>
    );
}