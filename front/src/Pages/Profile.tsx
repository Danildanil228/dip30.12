import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Phone, Calendar as CalendarIcon, Clock } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import EditProfileDialog from "@/components/Dialog/EditProfileDialog";
import ChangePasswordDialog from "@/components/Dialog/ChangePasswordDialog";

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
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = currentUser.role === "admin";
    const isOwnProfile = !id || parseInt(id) === currentUser.id;
    const targetUserId = id ? parseInt(id) : currentUser.id;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

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
            if (isOwnProfile) {
                const updatedUser = {
                    ...currentUser,
                    ...response.data.user
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                window.dispatchEvent(new Event("profile-updated")); // ← добавить
            }
            setUser(response.data.user);
        } catch (error: any) {
            console.error("Ошибка загрузки профиля:", error);
            if (error.response?.status === 404) {
                navigate("/not-found");
            }
        } finally {
            setLoading(false);
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
        return <LoadingSpinner />;
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
                <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                    <img src="/edit.png" className="icon w-4" alt="" />
                    Изменить данные
                </Button>

                <Button variant="outline" className="gap-2" onClick={() => setPasswordOpen(true)}>
                    <img src="/padlock.png" className="icon w-4" alt="" />
                    Сменить пароль
                </Button>
            </div>

            <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} isOwnProfile={isOwnProfile} isAdmin={isAdmin} onProfileUpdated={fetchUserProfile} />

            <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} userId={targetUserId} isOwnProfile={isOwnProfile} isAdmin={isAdmin} onPasswordChanged={fetchUserProfile} />
        </div>
    );
}
