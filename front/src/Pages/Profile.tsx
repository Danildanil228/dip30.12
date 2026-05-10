import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Phone, Calendar as CalendarIcon, Clock, Edit3, Key } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import EditProfileDialog from "@/components/Dialog/EditProfileDialog";
import ChangePasswordDialog from "@/components/Dialog/ChangePasswordDialog";
import { useUser } from "@/hooks/useUser";
import { userService } from "@/services/userService";
import type { UserProfile } from "@/types/user.types";

const formatDate = (value: unknown): string => {
    if (!value) return "";
    try {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ru-RU");
    } catch {
        return "";
    }
};

const formatDateTime = (value: unknown): string => {
    if (!value) return "";
    try {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU");
    } catch {
        return "";
    }
};

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser, loading: userLoading, isAdmin: userIsAdmin } = useUser();
    const isAdmin = userIsAdmin === true;
    const isOwnProfile = !id || (currentUser && parseInt(id) === currentUser.id);
    const targetUserId = id ? parseInt(id) : currentUser?.id;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const userData = await userService.getUserById(targetUserId);
            setUser(userData);
        } catch (error: any) {
            console.error("Ошибка загрузки профиля:", error);
            if (error.response?.status === 404) {
                navigate("/not-found");
            }
        } finally {
            setLoading(false);
        }
    }, [targetUserId, navigate]);

    useEffect(() => {
        if (!userLoading) {
            fetchUserProfile();
        }
    }, [userLoading, fetchUserProfile]);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">Администратор</Badge>;
            case "accountant":
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Бухгалтер</Badge>;
            case "storekeeper":
                return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">Кладовщик</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    if (userLoading || loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl mb-4">Не авторизован</h1>
                <Button onClick={() => navigate("/login")}>Войти</Button>
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
        <div className="max-w-2xl mx-auto space-y-6">
            <ScrollToTop />

            {!isOwnProfile && (
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
            )}

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mx-auto mb-4">
                    {user.name?.charAt(0)}
                    {user.secondname?.charAt(0)}
                </div>
                {!isOwnProfile && (
                    <h1 className="text-3xl font-bold">
                        {user.name} {user.secondname}
                    </h1>
                )}
                <div className="mt-2 flex justify-center gap-2">{getRoleBadge(user.role)}</div>
                <p className="text-muted-foreground mt-1">{user.username}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="shadow-sm border">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Личная информация
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={User} label="Имя" value={`${user.name} ${user.secondname}`} />
                            <InfoRow icon={Mail} label="Email" value={user.email || "Не указан"} />
                            <InfoRow icon={Phone} label="Телефон" value={user.phone || "Не указан"} />
                            <InfoRow icon={CalendarIcon} label="Дата рождения" value={user.birthday ? formatDate(user.birthday) : "Не указана"} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="shadow-sm border">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Информация об аккаунте
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground text-sm">Аккаунт создан</span>
                            <span className="text-sm font-medium">{formatDateTime(user.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground text-sm">Последнее обновление</span>
                            <span className="text-sm font-medium">{formatDateTime(user.updated_at)}</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                    <Edit3 className="h-4 w-4" />
                    Изменить данные
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setPasswordOpen(true)}>
                    <Key className="h-4 w-4" />
                    Сменить пароль
                </Button>
            </motion.div>

            <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} isOwnProfile={isOwnProfile || false} isAdmin={isAdmin} onProfileUpdated={fetchUserProfile} />
            <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} userId={targetUserId!} isOwnProfile={isOwnProfile || false} isAdmin={isAdmin} onPasswordChanged={fetchUserProfile} />
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-base font-medium">{value}</p>
            </div>
        </div>
    );
}
