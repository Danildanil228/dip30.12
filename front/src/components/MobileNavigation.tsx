import { useUser } from '@/hooks/useUser';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNavigation() {
    const location = useLocation();
    const { isAdmin } = useUser();
    const navItems = [
        {
            path: '/main',
            label: 'Главная',
            icon: '/home.svg', adminOnly: false
        },
        {
            path: '/materials',
            label: 'Материалы',
            icon: '/material.png', adminOnly: false

        },
        {
            path: '/add',
            label: 'Добавить',
            icon: '/add.png', adminOnly: true
        },
        {
            path: '/profile',
            label: 'Профиль',
            icon: '/profile.png', adminOnly: false
        },
        {
            path: '/notifications',
            label: 'Журнал',
            icon: '/not.png', adminOnly: true, 
        }
    ];
    const filteredNavItems = navItems.filter(item => 
        !item.adminOnly || (item.adminOnly && isAdmin)
    );

    const isActive = (path: string) => {
        if (path === '/main') {
            return location.pathname === '/' || location.pathname === '/main';
        }
        return location.pathname === path;
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0  border-t z-50 bg-background">
            <div className="flex justify-around py-2">
                {filteredNavItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center justify-center py-1 px-2 flex-1 min-w-0 relative"
                        >
                            <div className="relative mb-1">
                                <img
                                    src={item.icon}
                                    alt={item.label}
                                    className={`w-6 h-6 icon ${active
                                        ? 'filter brightness-0 invert-[30%] sepia-[90%] saturate-[3000%] hue-rotate-[220deg]'
                                        : 'filter brightness-0 opacity-60'
                                        }`}
                                />
                            </div>
                            <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}