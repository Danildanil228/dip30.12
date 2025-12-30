import DarkModeButtonToggle from "./DarkModeButtonToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Button } from "./ui/button";

export default function Header() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <section className="container flex flex-wrap justify-between sm:border-none border-b py-4! sm:mb-0! mb-4!">
            <p>
                {user.role === 'admin' ? 'Администратор' : 
                user.role === 'storekeeper' ? 'Работник склада' : 
                user.role === 'accountant' ? 'Бухгалтер' : 
                'Неизвестная роль'}
            </p>
            <p>{user.name + ' ' + user.secondname}</p>
            <div className="items-center gap-2 flex">
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
            </div>
        </section>
    )
}