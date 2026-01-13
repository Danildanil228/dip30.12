import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";

interface CreateBackupDialogProps {
    onBackupCreated?: () => void;
    triggerButton?: React.ReactNode;
}

export default function CreateBackupDialog({
    onBackupCreated,
    triggerButton
}: CreateBackupDialogProps) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError(null);
            setSuccess(null);
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_BASE_URL}/backups`,
                {
                    description: description.trim() || null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setDescription("");
            setSuccess("Бэкап успешно создан!");
            
            // Закрываем диалог через 2 секунды после успеха
            setTimeout(() => {
                setOpen(false);
                setSuccess(null);
                
                if (onBackupCreated) {
                    onBackupCreated();
                }
            }, 2000);

        } catch (error: any) {
            console.error("Ошибка создания бэкапа:", error);
            setError(error.response?.data?.error || "Ошибка создания бэкапа");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setDescription("");
            setError(null);
            setSuccess(null);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {triggerButton || <Button>Создать бэкап</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Создать новый бэкап базы данных</AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="backup-description">Описание (необязательно)</Label>
                            <Textarea
                                id="backup-description"
                                placeholder="Например: 'Бэкап перед обновлением системы'"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                            <p className="text-sm text-gray-500">
                                Бэкап будет создан с текущим состоянием базы данных
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="text-green-500 text-sm p-3 bg-green-50 rounded-md">
                                {success}
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Создание бэкапа...</span>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            className="text-base" 
                            disabled={loading}
                        >
                            Отмена
                        </AlertDialogCancel>
                        <Button 
                            type="submit" 
                            className="text-base" 
                            disabled={loading || !!success}
                        >
                            {loading ? "Создание..." : "Создать бэкап"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}