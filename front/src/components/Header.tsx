import { Link } from "react-router-dom";
import DarkModeButtonToggle from "./DarkModeButtonToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

export default function Header() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { isAdmin } = useUser();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    return (
        <section className="container flex flex-wrap justify-between lg:border-none border-b py-4! sm:mb-0! mb-4!">
            <Link to='/profile'>
                {user.role === 'admin' ? 'Администратор' :
                    user.role === 'storekeeper' ? 'Работник склада' :
                        user.role === 'accountant' ? 'Бухгалтер' :
                            'Неизвестная роль'}
            </Link>
            <Link to='/profile' className="lg:flex hidden">{user.name + ' ' + user.secondname}</Link>

            <div className="items-center flex gap-2 ">
                <DarkModeButtonToggle />


                <DropdownMenu>
                    <DropdownMenuTrigger><Button variant='outline' className="px-3"><img src="/setting.png" alt="" className="w-5 icon" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Инструменты</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isAdmin && (
                            <DropdownMenuItem><Link to='/backups'>Бэкапы</Link></DropdownMenuItem>
                        )}
                        <DropdownMenuItem><Link to='/profile'>Профиль</Link></DropdownMenuItem>
                        <DropdownMenuItem><Link to='/inventories'>Инвентаризация</Link></DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onSelect={(e) => {
                            e.preventDefault();
                            setIsLogoutDialogOpen(true);
                        }}>
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
                            <AlertDialogAction onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.href = '/login';
                            }}>Выйти</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </section>
    )
}