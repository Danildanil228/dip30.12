import { useState } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
    isOwnProfile: boolean;
    isAdmin: boolean;
    onPasswordChanged: () => void;
}

export default function ChangePasswordDialog({ open, onOpenChange, userId, isOwnProfile, isAdmin, onPasswordChanged }: ChangePasswordDialogProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

            setLoading(true);
            const token = localStorage.getItem("token");
            const requestData: any = {
                newPassword: newPassword,
                isAdminChange: isAdmin && !isOwnProfile
            };

            if (!isAdmin || isOwnProfile) {
                requestData.currentPassword = currentPassword;
            }

            await axios.put(`${API_BASE_URL}/users/${userId}/password`, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPasswordSuccess("Пароль успешно изменен");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                onOpenChange(false);
                setPasswordSuccess(null);
                onPasswordChanged();
            }, 2000);
        } catch (error: any) {
            console.error("Ошибка смены пароля:", error);
            setPasswordError(error.response?.data?.error || "Ошибка смены пароля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl">Смена пароля</AlertDialogTitle>
                    <AlertDialogDescription className="grid gap-4 pt-4 text-left">
                        {(!isAdmin || isOwnProfile) && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Текущий пароль</label>
                                <Input type="password" placeholder="Текущий пароль" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required={!isAdmin || isOwnProfile} disabled={loading} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Новый пароль</label>
                            <Input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
                            <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
                        </div>

                        {(!isAdmin || isOwnProfile) && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Подтвердите новый пароль</label>
                                <Input type="password" placeholder="Подтвердите новый пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!isAdmin || isOwnProfile} disabled={loading} />
                            </div>
                        )}

                        {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                        {passwordSuccess && <div className="text-green-500 text-sm">{passwordSuccess}</div>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={loading}
                        onClick={() => {
                            onOpenChange(false);
                            setPasswordError(null);
                            setPasswordSuccess(null);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        Отмена
                    </AlertDialogCancel>
                    <Button onClick={handleChangePassword} disabled={loading}>
                        {loading ? "Сохранение..." : "Сменить пароль"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
