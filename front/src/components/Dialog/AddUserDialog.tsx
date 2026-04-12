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

interface FieldErrors {
    name?: string;
    secondname?: string;
    username?: string;
    password?: string;
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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState({
        name: false,
        secondname: false,
        username: false,
        password: false
    });

    const validateName = (value: string): string => {
        if (!value.trim()) {
            return "Имя обязательно";
        }
        const lettersRegex = /^[A-Za-zА-Яа-яЁё]+$/;
        if (!lettersRegex.test(value)) {
            return "Имя должно содержать только буквы";
        }
        if (value.length < 2) {
            return "Имя должно содержать минимум 2 символа";
        }
        return "";
    };

    const validateSecondname = (value: string): string => {
        if (!value.trim()) {
            return "Фамилия обязательна";
        }
        const lettersRegex = /^[A-Za-zА-Яа-яЁё]+$/;
        if (!lettersRegex.test(value)) {
            return "Фамилия должна содержать только буквы";
        }
        if (value.length < 3) {
            return "Фамилия должна содержать минимум 3 символа";
        }
        return "";
    };

    const validateUsername = (value: string): string => {
        if (!value.trim()) {
            return "Логин обязателен";
        }
        const latinRegex = /^[A-Za-z0-9]+$/;
        if (!latinRegex.test(value)) {
            return "Логин может содержать только латинские буквы и цифры";
        }
        if (value.length < 5) {
            return "Логин должен содержать минимум 5 символов";
        }
        return "";
    };

    const validatePassword = (value: string): string => {
        if (!value) {
            return "Пароль обязателен";
        }
        if (value.length < 6) {
            return "Пароль должен быть не менее 6 символов";
        }
        return "";
    };

    const transliterate = (text: string): string => {
        const map: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
            'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
            'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
            'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
            'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
        };
        return text.split('').map(char => map[char] || char).join('');
    };

    const handleGenerateLogin = () => {
        if (!name || !secondname) {
            setError("Сначала заполните имя и фамилию");
            return;
        }

        const firstName = transliterate(name.toLowerCase());
        const lastName = transliterate(secondname.toLowerCase());
        
        const firstLetter = firstName.charAt(0);
        const baseLogin = `${firstLetter}${lastName}`;
        const truncatedBase = baseLogin.substring(0, 15);
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const generatedLogin = `${truncatedBase}${randomNum}`;
        
        setUsername(generatedLogin);
        setError("");
        if (fieldErrors.username) {
            setFieldErrors(prev => ({ ...prev, username: undefined }));
        }
    };

    const handleGeneratePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let pass = "";
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
        if (fieldErrors.password) {
            setFieldErrors(prev => ({ ...prev, password: undefined }));
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const filtered = value.replace(/[^A-Za-z0-9]/g, '');
        setUsername(filtered);
        if (fieldErrors.username && touched.username) {
            setFieldErrors(prev => ({ ...prev, username: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};
        
        const nameError = validateName(name);
        if (nameError) errors.name = nameError;
        
        const secondnameError = validateSecondname(secondname);
        if (secondnameError) errors.secondname = secondnameError;
        
        const usernameError = validateUsername(username);
        if (usernameError) errors.username = usernameError;
        
        const passwordError = validatePassword(password);
        if (passwordError) errors.password = passwordError;
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        setTouched({
            name: true,
            secondname: true,
            username: true,
            password: true
        });
        
        if (!validateForm()) {
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
                setFieldErrors({});
                setTouched({ name: false, secondname: false, username: false, password: false });

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
            setFieldErrors({});
            setTouched({ name: false, secondname: false, username: false, password: false });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {triggerButton || <Button>Добавить</Button>}
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
                                    onBlur={() => {
                                        setTouched(prev => ({ ...prev, name: true }));
                                        if (name) {
                                            const nameError = validateName(name);
                                            setFieldErrors(prev => ({ ...prev, name: nameError }));
                                        }
                                    }}
                                    className={`px-4 py-3 text-lg ${fieldErrors.name && touched.name ? "border-red-500" : ""}`}
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
                                    onBlur={() => {
                                        setTouched(prev => ({ ...prev, secondname: true }));
                                        if (secondname) {
                                            const secondnameError = validateSecondname(secondname);
                                            setFieldErrors(prev => ({ ...prev, secondname: secondnameError }));
                                        }
                                    }}
                                    className={`px-4 py-3 text-lg ${fieldErrors.secondname && touched.secondname ? "border-red-500" : ""}`}
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
                                            onChange={handleUsernameChange}
                                            onBlur={() => {
                                                setTouched(prev => ({ ...prev, username: true }));
                                                if (username) {
                                                    const usernameError = validateUsername(username);
                                                    setFieldErrors(prev => ({ ...prev, username: usernameError }));
                                                }
                                            }}
                                            className={`px-4 py-3 text-lg ${fieldErrors.username && touched.username ? "border-red-500" : ""}`}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant='outline'
                                            onClick={handleGenerateLogin}
                                            disabled={loading || !name || !secondname}
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
                                            onBlur={() => {
                                                setTouched(prev => ({ ...prev, password: true }));
                                                if (password) {
                                                    const passwordError = validatePassword(password);
                                                    setFieldErrors(prev => ({ ...prev, password: passwordError }));
                                                }
                                            }}
                                            className={`px-4 py-3 text-lg ${fieldErrors.password && touched.password ? "border-red-500" : ""}`}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant='outline'
                                            onClick={handleGeneratePassword}
                                            disabled={loading}
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

                        {/* Блок с правилами ввода - всегда отображается */}
                        <div className="space-y-1 p-3 border rounded-md bg-muted/20">
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Имя: только буквы, минимум 2 символа</li>
                                <li>Фамилия: только буквы, минимум 3 символа</li>
                                <li>Логин: только латинские буквы и цифры, минимум 5 символов</li>
                                <li>Пароль: минимум 6 символов</li>
                            </ul>
                        </div>

                        {success && (
                            <div className="p-3 border border-green-500 rounded-md bg-green-50 dark:bg-green-900/20">
                                <p className="text-green-500 text-sm">{success}</p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading} className="text-base">Отмена</AlertDialogCancel>
                        <Button
                            type="submit"
                            className="text-base"
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