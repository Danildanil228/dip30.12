import { useUser } from "@/hooks/useUser";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Package, ClipboardList, Users, User, Bell, Tag, Trash2 } from "lucide-react";

export default function DesktopNavigation() {
    const location = useLocation();
    const { isAdmin } = useUser();

    const mainItems = [
        { path: "/main", label: "Главная", icon: Home, adminOnly: false },
        { path: "/materials", label: "Материалы", icon: Package, adminOnly: false },
        { path: "/category", label: "Категории", icon: Tag, adminOnly: false },
        { path: "/requests", label: "Заявки", icon: ClipboardList, adminOnly: false },
        { path: "/allusers", label: "Пользователи", icon: Users, adminOnly: true },
        { path: "/profile", label: "Профиль", icon: User, adminOnly: false },
        { path: "/notifications", label: "Журнал", icon: Bell, adminOnly: true },
        { path: "/trash", label: "Корзина", icon: Trash2, adminOnly: true }
    ];

    const visibleItems = mainItems.filter((item) => !item.adminOnly || isAdmin);

    return (
        <nav className="hidden lg:block container my-4!">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between bg-background/80 backdrop-blur border rounded-2xl px-6 py-3 shadow-sm"
            >
                {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent ${
                                isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="desktop-active-tab"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </motion.div>
        </nav>
    );
}
