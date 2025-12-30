import { Link, useLocation, } from 'react-router-dom';

export default function DesktopNavigation() {
    const location = useLocation();
    const navItems = [
        { path: '/main', label: 'Главная' },
        { path: '/materials', label: 'Материалы' },
        { path: '/allusers', label: 'Все пользователи' },
        { path: '/add', label: 'Добавить пользователя' },
        { path: '/profile', label: 'Профиль' },
        { path: '/notifications', label: 'Уведомления' },
    ];

    return (
        <div className="container hidden lg:block border rounded-2xl my-4!">
            <div className="">
                <div className="flex justify-between py-4">
                    {navItems.map((item) => {
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-lg relative ${location.pathname === item.path
                                    ? 'opacity-50'
                                    : 'hover:opacity-50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}