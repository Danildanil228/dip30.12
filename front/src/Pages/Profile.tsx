import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ArrowLeft } from "lucide-react";
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/components/api";
import axios from "axios";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

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

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = !id || parseInt(id) === currentUser.id;
    const targetUserId = id ? parseInt(id) : currentUser.id;
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editData, setEditData] = useState({
        username: '',
        name: '',
        secondname: '',
        email: '',
        phone: '',
        role: '',
    });
    const [birthday, setBirthday] = useState<Date | undefined>();
    const [editOpen, setEditOpen] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data.user;
            setUser(userData);

            setEditData({
                username: userData.username,
                name: userData.name,
                secondname: userData.secondname,
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role,
            });

            if (userData.birthday) {
                setBirthday(new Date(userData.birthday));
            }

        } catch (error: any) {
            console.error('Ошибка загрузки профиля:', error);
            setError('Не удалось загрузить профиль');
            if (error.response?.status === 404) {
                navigate('/not-found');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveData = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');

            const currentData = await axios.get(`${API_BASE_URL}/users/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const currentUserData = currentData.data.user;

            const formattedBirthday = birthday ? format(birthday, 'yyyy-MM-dd') : null;

            let currentBirthdayFormatted = null;
            if (currentUserData.birthday) {
                const currentDate = new Date(currentUserData.birthday);
                currentBirthdayFormatted = format(currentDate, 'yyyy-MM-dd');
            }
            const updateData: any = {};

            if (editData.name !== currentUserData.name) updateData.name = editData.name;
            if (editData.secondname !== currentUserData.secondname) updateData.secondname = editData.secondname;
            if (editData.email !== (currentUserData.email || '')) updateData.email = editData.email;
            if (editData.phone !== (currentUserData.phone || '')) updateData.phone = editData.phone;

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

            console.log('Отправляемые данные:', updateData);

            const response = await axios.put(`${API_BASE_URL}/users/${targetUserId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchUserProfile();

            if (isOwnProfile) {
                const updatedUser = {
                    ...currentUser,
                    ...response.data.user
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            setEditOpen(false);

        } catch (error: any) {
            console.error('Ошибка обновления данных:', error);
            setError(error.response?.data?.error || 'Ошибка обновления данных');
        }
    };

    const handleChangePassword = async () => {
        try {
            setPasswordError(null);
            setPasswordSuccess(null);

            if (!isAdmin && newPassword !== confirmPassword) {
                setPasswordError('Пароли не совпадают');
                return;
            }

            if (newPassword.length < 6) {
                setPasswordError('Пароль должен быть не менее 6 символов');
                return;
            }

            const token = localStorage.getItem('token');
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

            setPasswordSuccess('Пароль успешно изменен');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setPasswordOpen(false);
                setPasswordSuccess(null);
            }, 2000);

        } catch (error: any) {
            console.error('Ошибка смены пароля:', error);
            setPasswordError(error.response?.data?.error || 'Ошибка смены пароля');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU');
    };

    if (loading) {
        return (
            <section className="grid gap-3">
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="grid gap-3">
                <h1>Профиль не найден</h1>
                <Button onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2" /> Назад
                </Button>
            </section>
        );
    }

    return (
        <section className="grid gap-3">
            <div className="flex flex-wrap justify-between items-center">
                <h1>{isOwnProfile ? 'Ваш профиль' : `Профиль: ${user.name} ${user.secondname}`}</h1>
                {!isOwnProfile && (
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2" /> Назад
                    </Button>
                )}
            </div>

            <div className="flex gap-4 flex-wrap">
                <p className="text-lg">{user.name} {user.secondname}</p>
            </div>

            <h1 className="text-xl font-semibold mt-6">Данные пользователя</h1>
            <div className="grid gap-2">
                <p>Логин: {user.username}</p>
                <p>Email: {user.email || 'Не указан'}</p>
                <p>Телефон: {user.phone || 'Не указан'}</p>
                <p>Дата рождения: {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Не указана'}</p>
                <div className="grid ">

                    <p className="text-xs opacity-50">Последнее обновление: {formatDate(user.updated_at)}</p>
                    <p className="text-xs opacity-50">Аккаунт создан: {formatDate(user.created_at)}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
                <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
                    <AlertDialogTrigger asChild>
                        <Button className="w-fit" variant='outline'>
                            Изменить данные <img src="/edit.png" className="icon w-5 ml-2" alt="" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">
                                {isOwnProfile ? 'Изменить ваши данные' : 'Изменить данные пользователя'}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="grid gap-4 pt-4">
                                {isAdmin && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Логин</label>
                                        <Input
                                            type="text"
                                            placeholder="Логин"
                                            value={editData.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
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
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Фамилия</label>
                                    <Input
                                        type="text"
                                        placeholder="Фамилия"
                                        value={editData.secondname}
                                        onChange={(e) => setEditData({ ...editData, secondname: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Телефон</label>
                                    <Input
                                        type="tel"
                                        placeholder="Телефон"
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    />
                                </div>

                                {isAdmin && !isOwnProfile && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Роль</label>
                                        <Select
                                            value={editData.role}
                                            onValueChange={(value) => setEditData({ ...editData, role: value })}
                                        >
                                            <SelectTrigger>
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
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between font-normal"
                                            >
                                                {birthday ? format(birthday, 'dd.MM.yyyy') : "Выберите дату"}
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
                                                disabled={(date) =>
                                                    date > new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm">{error}</div>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setEditOpen(false)}>
                                Закрыть
                            </AlertDialogCancel>
                            <Button onClick={handleSaveData}>
                                Сохранить
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                    <AlertDialogTrigger asChild>
                        <Button className="w-fit" variant='outline'>
                            Сменить пароль <img src="/edit.png" className="icon w-5 ml-2" alt="" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">
                                Смена пароля
                            </AlertDialogTitle>
                            <AlertDialogDescription className="grid gap-4 pt-4">
                                {(!isAdmin || isOwnProfile) && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Текущий пароль</label>
                                        <Input
                                            type="password"
                                            placeholder="Текущий пароль"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required={!isAdmin || isOwnProfile}
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Новый пароль</label>
                                    <Input
                                        type="password"
                                        placeholder="Новый пароль"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {(!isAdmin || isOwnProfile) && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Подтвердите новый пароль</label>
                                        <Input
                                            type="password"
                                            placeholder="Подтвердите новый пароль"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required={!isAdmin || isOwnProfile}
                                        />
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="text-red-500 text-sm">{passwordError}</div>
                                )}
                                {passwordSuccess && (
                                    <div className="text-green-500 text-sm">{passwordSuccess}</div>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setPasswordOpen(false);
                                setPasswordError(null);
                                setPasswordSuccess(null);
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }}>
                                Закрыть
                            </AlertDialogCancel>
                            <Button onClick={handleChangePassword}>
                                Сменить пароль
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </section>
    );
}