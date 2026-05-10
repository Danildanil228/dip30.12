import { Link } from "react-router-dom";
import DarkModeButtonToggle from "./DarkModeButtonToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { motion } from "framer-motion";

export default function Header() {
    const { user, isAdmin } = useUser();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [_, setUpdateKey] = useState(0);

    useEffect(() => {
        const handleProfileUpdate = () => setUpdateKey((prev) => prev + 1);
        window.addEventListener("profile-updated", handleProfileUpdate);
        return () => window.removeEventListener("profile-updated", handleProfileUpdate);
    }, []);

    if (!user) return null;

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = "/login";
    };

    const roleName =
        {
            admin: "Администратор",
            storekeeper: "Кладовщик",
            accountant: "Бухгалтер",
        }[user.role] || "Неизвестная роль";

    return (
        <header className="sticky top-0 z-40 w-full mb-4">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="container flex items-center justify-between py-4! backdrop-blur-lg bg-background/70 border-b border-border/40 rounded-b-2xl shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary/20 transition-colors">
                            {user.name?.charAt(0)}
                            {user.secondname?.charAt(0)}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold leading-none">
                                {user.name} {user.secondname}
                            </p>
                            <p className="text-xs text-muted-foreground">{roleName}</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <DarkModeButtonToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="relative">
                                <img src="/setting.png" alt="" className="w-5 icon" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Инструменты</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isAdmin && (
                                <DropdownMenuItem asChild>
                                    <Link to="/backups">Бэкапы</Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link to="/profile">Профиль</Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem asChild className="lg:hidden">
                                    <Link to="/allusers">Все пользователи</Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link to="/inventories">Инвентаризация</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard">Дашборд</Link>
                            </DropdownMenuItem>
                            {user?.role !== "storekeeper" && (
                                <DropdownMenuItem asChild>
                                    <Link to="/reports">Отчеты</Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setIsLogoutDialogOpen(true);
                                }}
                            >
                                Выйти
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout}>Выйти</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </motion.div>
        </header>
    );
}
