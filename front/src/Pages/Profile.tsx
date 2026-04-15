import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ArrowLeft, Mail, Phone, Calendar as CalendarIcon, User, Shield, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/components/api";
import axios from "axios";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { ScrollToTop } from "@/components/ScrollToTop";

interface UserProfile {
    id: number;
    username: string;
    role: string;
    name: string;
    secondname: string;
    email: string;
    phone: string;
    birthday: string | null;
    created_at: string;
    updated_at: string;
}

interface FieldErrors {
    username?: string;
    name?: string;
    secondname?: string;
    email?: string;
    phone?: string;
}

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = currentUser.role === "admin";
    const isOwnProfile = !id || parseInt(id) === currentUser.id;
    const targetUserId = id ? parseInt(id) : currentUser.id;
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editData, setEditData] = useState({
        username: "",
        name: "",
        secondname: "",
        email: "",
        phone: "",
        role: ""
    });
    const [birthday, setBirthday] = useState<Date | undefined>();
    const [editOpen, setEditOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState({
        username: false,
        name: false,
        secondname: false,
        email: false,
        phone: false
    });

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

    const validateEmail = (value: string): string => {
        if (!value.trim()) {
            return ""; 
        }
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "Введите корректный email (пример: user@example.com)";
        }
        return "";
    };

    const validatePhone = (value: string): string => {
        if (!value.trim()) {
            return ""; 
        }
       
        const phoneRegex = /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
        const phoneRegexClean = /^(\+7|8)?[0-9]{10}$/;

        if (!phoneRegex.test(value) && !phoneRegexClean.test(cleanPhone)) {
            return "Введите корректный номер телефона (10 цифр)";
        }
        return "";
    };

    const formatPhoneNumber = (value: string): string => {
        const clean = value.replace(/[^\d+]/g, "");
        if (clean.startsWith("+")) {
            const numbers = clean.slice(1);
            if (numbers.length <= 1) return "+" + numbers;
            if (numbers.length <= 4) return "+" + numbers;
            if (numbers.length <= 7) return "+" + numbers.slice(0, 1) + " " + numbers.slice(1);
            if (numbers.length <= 9) return "+" + numbers.slice(0, 1) + " " + numbers.slice(1, 4) + " " + numbers.slice(4);
            return "+" + numbers.slice(0, 1) + " " + numbers.slice(1, 4) + " " + numbers.slice(4, 7) + " " + numbers.slice(7, 9) + " " + numbers.slice(9, 11);
        }
        if (clean.length <= 1) return clean;
        if (clean.length <= 4) return clean;
        if (clean.length <= 7) return clean.slice(0, 1) + " " + clean.slice(1, 4) + " " + clean.slice(4);
        if (clean.length <= 9) return clean.slice(0, 1) + " " + clean.slice(1, 4) + " " + clean.slice(4, 7) + " " + clean.slice(7);
        return clean.slice(0, 1) + " " + clean.slice(1, 4) + " " + clean.slice(4, 7) + " " + clean.slice(7, 9) + " " + clean.slice(9, 11);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setEditData({ ...editData, phone: formatted });
        if (fieldErrors.phone && touched.phone) {
            setFieldErrors((prev) => ({ ...prev, phone: undefined }));
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const filtered = value.replace(/[^A-Za-z0-9]/g, "");
        setEditData({ ...editData, username: filtered });
        if (fieldErrors.username && touched.username) {
            setFieldErrors((prev) => ({ ...prev, username: undefined }));
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditData({ ...editData, name: value });
        if (fieldErrors.name && touched.name) {
            setFieldErrors((prev) => ({ ...prev, name: undefined }));
        }
    };

    const handleSecondnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditData({ ...editData, secondname: value });
        if (fieldErrors.secondname && touched.secondname) {
            setFieldErrors((prev) => ({ ...prev, secondname: undefined }));
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditData({ ...editData, email: value });
        if (fieldErrors.email && touched.email) {
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data.user;
            setUser(userData);

            setEditData({
                username: userData.username,
                name: userData.name,
                secondname: userData.secondname,
                email: userData.email || "",
                phone: userData.phone || "",
                role: userData.role
            });

            if (userData.birthday) {
                setBirthday(new Date(userData.birthday));
            }
        } catch (error: any) {
            console.error("Ошибка загрузки профиля:", error);
            setError("Не удалось загрузить профиль");
            if (error.response?.status === 404) {
                navigate("/not-found");
            }
        } finally {
            setLoading(false);
        }
    };

    const validateEditForm = (): boolean => {
        const errors: FieldErrors = {};

        if (isAdmin) {
            const usernameError = validateUsername(editData.username);
            if (usernameError) errors.username = usernameError;
        }

        const nameError = validateName(editData.name);
        if (nameError) errors.name = nameError;

        const secondnameError = validateSecondname(editData.secondname);
        if (secondnameError) errors.secondname = secondnameError;

        const emailError = validateEmail(editData.email);
        if (emailError) errors.email = emailError;

        const phoneError = validatePhone(editData.phone);
        if (phoneError) errors.phone = phoneError;

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveData = async () => {
        setTouched({
            username: true,
            name: true,
            secondname: true,
            email: true,
            phone: true
        });

        if (!validateEditForm()) {
            return;
        }

        try {
            setError(null);
            const token = localStorage.getItem("token");

            const currentData = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const currentUserData = currentData.data.user;

            const formattedBirthday = birthday ? format(birthday, "yyyy-MM-dd") : null;

            let currentBirthdayFormatted = null;
            if (currentUserData.birthday) {
                const currentDate = new Date(currentUserData.birthday);
                currentBirthdayFormatted = format(currentDate, "yyyy-MM-dd");
            }
            const updateData: any = {};

            if (editData.name !== currentUserData.name) updateData.name = editData.name;
            if (editData.secondname !== currentUserData.secondname) updateData.secondname = editData.secondname;
            if (editData.email !== (currentUserData.email || "")) updateData.email = editData.email;
            if (editData.phone !== (currentUserData.phone || "")) updateData.phone = editData.phone;

            if (formattedBirthday !== currentBirthdayFormatted) {
                updateData.birthday = formattedBirthday;
            }

            if (isAdmin) {
                if (editData.username !== currentUserData.username) {
                    updateData.username = editData.username;
                }
                if (!isOwnProfile && editData.role !== currentUserData.role) {
                    updateData.role = editData.role;
                }
            }

            if (Object.keys(updateData).length === 0) {
                setEditOpen(false);
                return;
            }

            const response = await axios.put(`${API_BASE_URL}/users/${targetUserId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchUserProfile();

            if (isOwnProfile) {
                const updatedUser = {
                    ...currentUser,
                    ...response.data.user
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            setEditOpen(false);
            setFieldErrors({});
            setTouched({ username: false, name: false, secondname: false, email: false, phone: false });
        } catch (error: any) {
            console.error("Ошибка обновления данных:", error);
            setError(error.response?.data?.error || "Ошибка обновления данных");
        }
    };

    const handleChangePassword = async () => {
        try {
            setPasswordError(null);
            setPasswordSuccess(null);

            if (!isAdmin && newPassword !== confirmPassword) {
                setPasswordError("Пароли не совпадают");
                return;
            }

            if (newPassword.length < 6) {
                setPasswordError("Пароль должен быть не менее 6 символов");
                return;
            }

            const token = localStorage.getItem("token");
            const requestData: any = {
                newPassword: newPassword,
                isAdminChange: isAdmin && !isOwnProfile
            };

            if (!isAdmin || isOwnProfile) {
                requestData.currentPassword = currentPassword;
            }

            await axios.put(`${API_BASE_URL}/users/${targetUserId}/password`, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPasswordSuccess("Пароль успешно изменен");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setPasswordOpen(false);
                setPasswordSuccess(null);
            }, 2000);
        } catch (error: any) {
            console.error("Ошибка смены пароля:", error);
            setPasswordError(error.response?.data?.error || "Ошибка смены пароля");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge variant="outline">Администратор</Badge>;
            case "accountant":
                return <Badge variant="outline">Бухгалтер</Badge>;
            case "storekeeper":
                return <Badge variant="outline">Кладовщик</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl mb-4">Профиль не найден</h1>
                <Button onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto">
            <ScrollToTop />
            {!isOwnProfile && (
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                </Button>
            )}
            <div className="text-center mb-4">
                {!isOwnProfile && (
                    <h1 className="text-3xl font-bold">
                        {user.name} {user.secondname}
                    </h1>
                )}
                <div className="mt-2">{getRoleBadge(user.role)}</div>
                <p className="text-muted-foreground mt-1">{user.username}</p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Личная информация
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Пользователь</p>
                                <p className="text-base">
                                    {user.name} {user.secondname}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="text-base">{user.email || "Не указан"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Телефон</p>
                                <p className="text-base">{user.phone || "Не указан"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Дата рождения</p>
                                <p className="text-base">{user.birthday ? new Date(user.birthday).toLocaleDateString("ru-RU") : "Не указана"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Информация об аккаунте
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground text-sm">Аккаунт создан</span>
                        <span className="text-base">{new Date(user.created_at).toLocaleString("ru-RU")}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground text-sm">Последнее обновление</span>
                        <span className="text-base">{new Date(user.updated_at).toLocaleString("ru-RU")}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 justify-center">
                <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <img src="/edit.png" className="icon w-4" alt="" />
                            Изменить данные
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">{isOwnProfile ? "Изменить ваши данные" : "Изменить данные пользователя"}</AlertDialogTitle>
                            <AlertDialogDescription className="grid gap-4 pt-4 text-left">
                                {isAdmin && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Логин</label>
                                        <Input
                                            type="text"
                                            placeholder="Логин"
                                            value={editData.username}
                                            onChange={handleUsernameChange}
                                            onBlur={() => {
                                                setTouched((prev) => ({ ...prev, username: true }));
                                                const usernameError = validateUsername(editData.username);
                                                setFieldErrors((prev) => ({ ...prev, username: usernameError }));
                                            }}
                                            className={fieldErrors.username && touched.username ? "border-red-500" : ""}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Имя</label>
                                    <Input
                                        type="text"
                                        placeholder="Имя"
                                        value={editData.name}
                                        onChange={handleNameChange}
                                        onBlur={() => {
                                            setTouched((prev) => ({ ...prev, name: true }));
                                            const nameError = validateName(editData.name);
                                            setFieldErrors((prev) => ({ ...prev, name: nameError }));
                                        }}
                                        className={fieldErrors.name && touched.name ? "border-red-500" : ""}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Фамилия</label>
                                    <Input
                                        type="text"
                                        placeholder="Фамилия"
                                        value={editData.secondname}
                                        onChange={handleSecondnameChange}
                                        onBlur={() => {
                                            setTouched((prev) => ({ ...prev, secondname: true }));
                                            const secondnameError = validateSecondname(editData.secondname);
                                            setFieldErrors((prev) => ({ ...prev, secondname: secondnameError }));
                                        }}
                                        className={fieldErrors.secondname && touched.secondname ? "border-red-500" : ""}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="example@mail.com"
                                        value={editData.email}
                                        onChange={handleEmailChange}
                                        onBlur={() => {
                                            setTouched((prev) => ({ ...prev, email: true }));
                                            const emailError = validateEmail(editData.email);
                                            setFieldErrors((prev) => ({ ...prev, email: emailError }));
                                        }}
                                        className={fieldErrors.email && touched.email ? "border-red-500" : ""}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Телефон</label>
                                    <Input
                                        type="tel"
                                        placeholder="+7 XXX XXX XX XX"
                                        value={editData.phone}
                                        onChange={handlePhoneChange}
                                        onBlur={() => {
                                            setTouched((prev) => ({ ...prev, phone: true }));
                                            const phoneError = validatePhone(editData.phone);
                                            setFieldErrors((prev) => ({ ...prev, phone: phoneError }));
                                        }}
                                        className={fieldErrors.phone && touched.phone ? "border-red-500" : ""}
                                    />
                                </div>

                                {isAdmin && !isOwnProfile && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Роль</label>
                                        <Select value={editData.role} onValueChange={(value) => setEditData({ ...editData, role: value })}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Роль" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Администратор</SelectItem>
                                                <SelectItem value="accountant">Бухгалтер</SelectItem>
                                                <SelectItem value="storekeeper">Кладовщик</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Дата рождения</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {birthday ? format(birthday, "dd.MM.yyyy") : "Выберите дату"}
                                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                locale={ru}
                                                selected={birthday}
                                                onSelect={setBirthday}
                                                captionLayout="dropdown"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear() - 18}
                                                disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1 p-3 border rounded-md bg-muted/20 mt-2">
                                    <p className="text-sm font-medium">Правила ввода:</p>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Имя: только буквы, минимум 2 символа</li>
                                        <li>Фамилия: только буквы, минимум 3 символа</li>
                                        {isAdmin && <li>Логин: только латинские буквы и цифры, минимум 5 символов</li>}
                                        <li>Email: формат name@example.com (необязательно)</li>
                                        <li>Телефон: 10 цифр (необязательно)</li>
                                    </ul>
                                </div>

                                {error && <div className="text-red-500 text-sm">{error}</div>}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setEditOpen(false)}>Отмена</AlertDialogCancel>
                            <Button onClick={handleSaveData}>Сохранить</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <img src="/padlock.png" className="icon w-4" alt="" />
                            Сменить пароль
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">Смена пароля</AlertDialogTitle>
                            <AlertDialogDescription className="grid gap-4 pt-4 text-left">
                                {(!isAdmin || isOwnProfile) && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Текущий пароль</label>
                                        <Input type="password" placeholder="Текущий пароль" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required={!isAdmin || isOwnProfile} />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Новый пароль</label>
                                    <Input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                    <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
                                </div>

                                {(!isAdmin || isOwnProfile) && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Подтвердите новый пароль</label>
                                        <Input type="password" placeholder="Подтвердите новый пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!isAdmin || isOwnProfile} />
                                    </div>
                                )}

                                {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                                {passwordSuccess && <div className="text-green-500 text-sm">{passwordSuccess}</div>}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => {
                                    setPasswordOpen(false);
                                    setPasswordError(null);
                                    setPasswordSuccess(null);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                Отмена
                            </AlertDialogCancel>
                            <Button onClick={handleChangePassword}>Сменить пароль</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
