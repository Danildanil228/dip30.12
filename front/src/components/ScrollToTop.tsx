import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

export const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 300);
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {isVisible && (
                <Button
                    onClick={scrollToTop}
                    className="w-12 h-12 rounded-full border-none cursor-pointer flex text-xl font-semibold mb-12 lg:mb-0"
                    aria-label="Наверх"
                >
                    ↑
                </Button>
            )}
        </div>
    );
};