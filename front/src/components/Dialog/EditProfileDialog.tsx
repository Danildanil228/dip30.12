import { useState } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { CapitalizedInput } from "../CapitalizedInput";

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

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile;
    isOwnProfile: boolean;
    isAdmin: boolean;
    onProfileUpdated: () => void;
}

interface FieldErrors {
    username?: string;
    name?: string;
    secondname?: string;
    email?: string;
    phone?: string;
}

export default function EditProfileDialog({ open, onOpenChange, user, isOwnProfile, isAdmin, onProfileUpdated }: EditProfileDialogProps) {
    const [editData, setEditData] = useState({
        username: user.username,
        name: user.name,
        secondname: user.secondname,
        email: user.email || "",
        phone: user.phone || "",
        role: user.role
    });
    const [birthday, setBirthday] = useState<Date | undefined>(user.birthday ? new Date(user.birthday) : undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState({
        username: false,
        name: false,
        secondname: false,
        email: false,
        phone: false
    });

    const validateName = (value: string): string => {
        if (!value.trim()) return "Имя обязательно";
        const lettersRegex = /^[А-Яа-яЁё]+$/;
        if (!lettersRegex.test(value)) return "Имя должно содержать только русские буквы";
        if (value.length < 2) return "Имя должно содержать минимум 2 символа";
        if (value.length > 20) return "Имя не должно превышать 20 символов";
        return "";
    };

    const validateSecondname = (value: string): string => {
        if (!value.trim()) return "Фамилия обязательна";
        const lettersRegex = /^[А-Яа-яЁё]+$/;
        if (!lettersRegex.test(value)) return "Фамилия должна содержать только русские буквы";
        if (value.length < 3) return "Фамилия должна содержать минимум 3 символа";
        if (value.length > 30) return "Имя не должно превышать 30 символов";
        return "";
    };

    const validateUsername = (value: string): string => {
        if (!value.trim()) return "Логин обязателен";
        const latinRegex = /^[A-Za-z0-9]+$/;
        if (!latinRegex.test(value)) return "Логин может содержать только латинские буквы и цифры";
        if (value.length < 5) return "Логин должен содержать минимум 5 символов";
        if (value.length > 20) return "Логин не должен превышать 20 символов";
        return "";
    };

    const validateEmail = (value: string): string => {
        if (!value.trim()) return "";
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(value)) return "Введите корректный email (пример: user@example.com)";
        if (value.length > 30) return "Email не должен превышать 30 символов";
        return "";
    };

    const validatePhone = (value: string): string => {
        if (!value.trim()) return "";
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
            setLoading(true);
            const token = localStorage.getItem("token");

            const currentData = await axios.get(`${API_BASE_URL}/users/${user.id}`, {
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
                onOpenChange(false);
                return;
            }

            await axios.put(`${API_BASE_URL}/users/${user.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onOpenChange(false);
            setFieldErrors({});
            setTouched({ username: false, name: false, secondname: false, email: false, phone: false });
            onProfileUpdated();
        } catch (error: any) {
            console.error("Ошибка обновления данных:", error);
            setError(error.response?.data?.error || "Ошибка обновления данных");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
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
                                    disabled={loading}
                                    required
                                />
                                {fieldErrors.username && touched.username && <p className="text-red-500 text-xs">{fieldErrors.username}</p>}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Имя</label>
                            <CapitalizedInput
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
                                disabled={loading}
                                required
                            />
                            {fieldErrors.name && touched.name && <p className="text-red-500 text-xs">{fieldErrors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Фамилия</label>
                            <CapitalizedInput
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
                                disabled={loading}
                                required
                            />
                            {fieldErrors.secondname && touched.secondname && <p className="text-red-500 text-xs">{fieldErrors.secondname}</p>}
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
                                disabled={loading}
                            />
                            {fieldErrors.email && touched.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
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
                                disabled={loading}
                            />
                            {fieldErrors.phone && touched.phone && <p className="text-red-500 text-xs">{fieldErrors.phone}</p>}
                        </div>

                        {isAdmin && !isOwnProfile && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Роль</label>
                                <Select value={editData.role} onValueChange={(value) => setEditData({ ...editData, role: value })} disabled={loading}>
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
                                    <Button variant="outline" className="w-full justify-between font-normal" disabled={loading}>
                                        {birthday ? format(birthday, "dd.MM.yyyy") : "Выберите дату"}
                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        className="text-lg"
                                        mode="single"
                                        locale={ru}
                                        selected={birthday}
                                        onSelect={setBirthday}
                                        captionLayout="dropdown"
                                        fromYear={1960}
                                        toYear={new Date().getFullYear() - 18}
                                        disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1 p-3 border rounded-md bg-muted/20 mt-2">
                            <p className="text-sm font-medium">Правила ввода:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Имя: только русские буквы, минимум 2 символа</li>
                                <li>Фамилия: только русские буквы, минимум 3 символа</li>
                                {isAdmin && <li>Логин: только латинские буквы и цифры, минимум 5 символов</li>}
                                <li>Email: формат name@example.com (необязательно)</li>
                                <li>Телефон: 10 цифр (необязательно)</li>
                            </ul>
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Отмена</AlertDialogCancel>
                    <Button onClick={handleSaveData} disabled={loading}>
                        {loading ? "Сохранение..." : "Сохранить"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
