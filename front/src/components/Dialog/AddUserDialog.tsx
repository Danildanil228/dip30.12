import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

interface AddUserDialogProps {
    onUserCreated?: () => void;
    triggerButton?: React.ReactNode;
}

export default function AddUserDialog({
    onUserCreated,
    triggerButton
}: AddUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [secondname, setSecondname] = useState("");
    const [role, setRole] = useState("storekeeper");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Генерация логина
    const handleGenerateLogin = () => {
        if (!name || !secondname) {
            setError("Введите имя и фамилию");
            return;
        }
        const firstLetter = name.charAt(0).toLowerCase();
        const lastName = secondname.toLowerCase();
        const randomNum = Math.floor(Math.random() * 90) + 10;
        setUsername(`${firstLetter}${lastName}${randomNum}`);
    };

    // Генерация пароля
    const handleGeneratePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let pass = "";
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !secondname || !username || !password) {
            setError("Заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/createUser`, {
                username, password, name, secondname, role
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess(`Пользователь ${username} создан`);

            setTimeout(() => {
                setName("");
                setSecondname("");
                setUsername("");
                setPassword("");
                setRole("storekeeper");
                setOpen(false);
                setSuccess("");

                if (onUserCreated) {
                    onUserCreated();
                }
            }, 2000);

        } catch (error: any) {
            setError(error.response?.data?.error || "Ошибка создания пользователя");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setName("");
            setSecondname("");
            setUsername("");
            setPassword("");
            setRole("storekeeper");
            setError("");
            setSuccess("");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {triggerButton || <Button>Добавить пользователя</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl">Добавить нового пользователя</AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="add-user-name" className="text-lg">Имя</Label>
                                <Input
                                    id="add-user-name"
                                    placeholder="Имя"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="px-4 py-3 text-lg"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="add-user-secondname" className="text-lg">Фамилия</Label>
                                <Input
                                    id="add-user-secondname"
                                    placeholder="Фамилия"
                                    value={secondname}
                                    onChange={(e) => setSecondname(e.target.value)}
                                    className="px-4 py-3 text-lg"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 grid gap-2">
                                    <Label htmlFor="add-user-username" className="text-lg">Логин</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            id="add-user-username"
                                            placeholder="Логин"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="px-4 py-3 text-lg"
                                            required
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant='outline'
                                            onClick={handleGenerateLogin}
                                            disabled={loading || !name || !secondname}
                                            className=""
                                        >
                                            <img src="/dice.png" className="icon w-5" alt="Сгенерировать" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 grid gap-2">
                                    <Label htmlFor="add-user-password" className="text-lg">Пароль</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            id="add-user-password"
                                            type="text"
                                            placeholder="Пароль"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="px-4 py-3 text-lg"
                                            required
                                            minLength={6}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant='outline'
                                            onClick={handleGeneratePassword}
                                            disabled={loading}
                                            className=""
                                        >
                                            <img src="/dice.png" className="icon w-5" alt="Сгенерировать" />
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="add-user-role" className="text-lg">Роль</Label>
                            <Select value={role} onValueChange={setRole} disabled={loading}>
                                <SelectTrigger className="text-lg py-3">
                                    <SelectValue placeholder="Роль" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                    <SelectItem value="accountant">Бухгалтер</SelectItem>
                                    <SelectItem value="storekeeper">Кладовщик</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && (
                            <div className="">{error}</div>
                        )}

                        {success && (
                            <div className="">{success}</div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading} className="text-base">Отмена</AlertDialogCancel>
                        <Button
                            type="submit"
                            className=" text-base"
                            disabled={loading || !!success}
                        >
                            {loading ? "Создание..." : "Создать пользователя"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}