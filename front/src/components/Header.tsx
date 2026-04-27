import { Link } from "react-router-dom";
import DarkModeButtonToggle from "./DarkModeButtonToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";

export default function Header() {
    const { user, isAdmin } = useUser();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        const handleProfileUpdate = () => {
            setUpdateKey((prev) => prev + 1);
        };

        window.addEventListener("profile-updated", handleProfileUpdate);
        return () => {
            window.removeEventListener("profile-updated", handleProfileUpdate);
        };
    }, []);

    if (!user) return null;

    return (
        <section className="container flex flex-wrap justify-between lg:border-none border-b py-4! sm:mb-0! mb-4!">
            <Link to="/profile">{user.role === "admin" ? "Администратор" : user.role === "storekeeper" ? "Работник склада" : user.role === "accountant" ? "Бухгалтер" : "Неизвестная роль"}</Link>
            <Link to="/profile" className="lg:flex hidden">
                {user.name} {user.secondname}
            </Link>

            <div className="items-center flex gap-2 ">
                <DarkModeButtonToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="outline" className="px-3">
                            <img src="/setting.png" alt="" className="w-5 icon" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Инструменты</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isAdmin && (
                            <DropdownMenuItem>
                                <Link to="/backups">Бэкапы</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                            <Link to="/profile">Профиль</Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                            <DropdownMenuItem className="lg:hidden">
                                <Link to="/allusers">Все пользователи</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                            <Link to="/inventories">Инвентаризация</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link to="/dashboard">Дашборд</Link>
                        </DropdownMenuItem>
                        {user?.role !== "storekeeper" && (
                            <DropdownMenuItem>
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
                            <AlertDialogAction
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user");
                                    window.location.href = "/login";
                                }}
                            >
                                Выйти
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </section>
    );
}
