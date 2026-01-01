import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react"

export default function Profile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    return (
        <section className="grid gap-3">
            <h1>Ваш профиль</h1>
            <div className="flex gap-4 flex-wrap">
                <p>{user.name + ' ' + user.secondname}</p>
                <p>{user.role === 'admin' ? 'Администратор' :
                    user.role === 'storekeeper' ? 'Работник склада' :
                        user.role === 'accountant' ? 'Бухгалтер' :
                            'Неизвестная роль'}</p>
            </div>
            <h1>Ваши данные</h1>
            <div>
                <p>email: {user.email}</p>
                <p>телефон: {user.phone}</p>
                <p>дата рождения {user.birthday}</p>
                <p>последнее обновление профиля {user.updated_at}</p>
                <p>аккаунт создан {user.created_at}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="w-fit " variant='outline'>
                        Изменить данные <img src="/edit.png" className="icon w-5" alt="" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">Изменить данные</AlertDialogTitle>
                        <AlertDialogDescription className="grid gap-4">


                            {/* Может менять только админ и водно только админу */}
                            <Input
                                type="username"
                                placeholder="username"
                            // изначальные данные получаются из user.username
                            //в этом же поле можно изменить как и один симвлол так и все целиком
                            />
                            {/* Может менять только админ и водно только админу */}
                            <Select>
                                <SelectTrigger className="w-full" >
                                    <SelectValue placeholder="Роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* ДЕФОЛТНОЕ ЗНАЧЕНИ ЭТО УЖЕ ИМЕЮЩАЯСЯ РОЛЬ user.role */}
                                    <SelectItem value="admin">Администратор</SelectItem>
                                    <SelectItem value="accountant">Бухгалтер</SelectItem>
                                    <SelectItem value="storekeeper">Кладовщик</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="text"
                                placeholder="Имя"
                            // изначальные данные получаются из user.name
                            //в этом же поле можно изменить как и один симвлол так и все целиком
                            />
                            <Input
                                type="text"
                                placeholder="Фамилия"
                            // изначальные данные получаются из user.secondname
                            //в этом же поле можно изменить как и один симвлол так и все целиком
                            />
                            <Input
                                type="email"
                                placeholder="Почта"
                            // изначальные данные получаются из user.email
                            //в этом же поле можно изменить как и один симвлол так и все целиком
                            />
                            <Input
                                type="phone"
                                placeholder="Телефон"
                            // изначальные данные получаются из user.email
                            //в этом же поле можно изменить как и один симвлол так и все целиком
                            />

                            {/* Должна быть проверка на >=18 лет, дефолтное значение {текущий год - 19 лет}*/}
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="w-full justify-between font-normal"
                                    >
                                        {date ? date.toLocaleDateString() : "Дата рождения"}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setDate(date)
                                            setOpen(false)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Закрыть</AlertDialogCancel>
                        <Button>Сохранить</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="w-fit " variant='outline'>
                        Сменить пароль <img src="/edit.png" className="icon w-5" alt="" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">Сменить пароль</AlertDialogTitle>
                        <AlertDialogDescription className="grid gap-4">
                            <Input
                                type="password"
                                placeholder="Текущий пароль"
                            />
                            <Input
                                type="password"
                                placeholder="Новый пароль"
                            />
                            <Input
                                type="password"
                                placeholder="Подтвердите новый пароль"
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Закрыть</AlertDialogCancel>
                        <Button>Сменить пароль</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}