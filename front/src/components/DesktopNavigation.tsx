import { useUser } from '@/hooks/useUser';
import { Link, useLocation, useNavigate, } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"

export default function DesktopNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin } = useUser();
    const navItems = [
        { path: '/main', label: 'Главная', adminOnly: false },
        { path: '/materials', label: 'Материалы', adminOnly: false, hasDrop: true },
        { path: '/allusers', label: 'Все пользователи', adminOnly: true },
        { path: '/add', label: 'Добавить пользователя', adminOnly: true },
        { path: '/profile', label: 'Профиль', adminOnly: false },
        { path: '/notifications', label: 'Журнал', adminOnly: true },
    ];
    const materialItem = [
        { path: '/materials', label: 'Материалы', adminOnly: false },
        { path: '/category', label: 'Категории', adminOnly: false }
    ]
    const filItems = navItems.filter(item => !item.adminOnly || (item.adminOnly && isAdmin))
    

    return (
        <div className="container hidden lg:block border rounded-2xl my-4!">
            <div className="">
                <div className="flex justify-between py-4">
                    {filItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        if (item.path === '/materials' && item.hasDrop) {
                            return (
                                <DropdownMenu key={item.path}>
                                    <DropdownMenuTrigger className={`text-lg ${isActive ? 'opacity-50' : 'hover:opacity-50'}`}>
                                        {item.label}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {materialItem.map((material) => (
                                            <DropdownMenuItem
                                                key={material.path}
                                                onClick={() => navigate(material.path)}
                                                className={`cursor-pointer ${location.pathname === material.path ? '' : ''
                                                    }`}
                                            >
                                                {material.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-lg relative ${isActive
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

