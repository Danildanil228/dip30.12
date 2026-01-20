import { Link } from "react-router-dom";
import DarkModeButtonToggle from "./DarkModeButtonToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useUser } from "@/hooks/useUser";

export default function Header() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { isAdmin } = useUser();
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
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline"><img src="/log.png" className="icon w-5" alt="" /></Button>
                    </AlertDialogTrigger>
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
                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger><Button variant='outline'><img src="/setting.png" alt="" className="w-5 icon" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Инструменты</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem><Link to='/backups'>Бэкапы</Link></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

            </div>
        </section>
    )
}