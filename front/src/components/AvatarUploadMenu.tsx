import { useState, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Camera, Trash2, Eye } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent} from "@/components/ui/dialog";
import { avatarService } from "@/services/avatarService";
import { useUser } from "@/hooks/useUser";

interface AvatarUploadMenuProps {
    userId: number;
    currentAvatar: string | null | undefined;
    onAvatarUpdate: (newAvatarUrl: string | null) => void;
    onSuccess?: () => void; // новый prop
    children: React.ReactNode;
}

export function AvatarUploadMenu({ userId, currentAvatar, onAvatarUpdate, onSuccess, children }: AvatarUploadMenuProps) {
    const { user, updateCurrentUser } = useUser();
    const [uploading, setUploading] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isOwnProfile = user?.id === userId;

    const loadPreview = async () => {
        if (!currentAvatar) return;
        try {
            const response = await avatarService.getAvatarBlob(userId);
            if (response) {
                const url = URL.createObjectURL(response);
                setPreviewUrl(url);
                setPreviewOpen(true);
            }
        } catch (error) {
            console.error("Ошибка загрузки фото для предпросмотра:", error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage("Максимальный размер файла – 10 МБ");
            setErrorDialogOpen(true);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setUploading(true);
        try {
            const result = await avatarService.uploadAvatar(file);
            if (isOwnProfile) {
                updateCurrentUser({ avatar: result.avatar });
            }
            onAvatarUpdate(result.avatar);
            onSuccess?.();
        } catch (error: any) {
            console.error("Ошибка загрузки аватара:", error);
            const msg = error.response?.data?.error || "Не удалось загрузить фото";
            setErrorMessage(msg);
            setErrorDialogOpen(true);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteConfirmOpen(false);
        setUploading(true);
        try {
            await avatarService.deleteAvatar();
            if (isOwnProfile) {
                updateCurrentUser({ avatar: null });
            }
            onAvatarUpdate(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            onSuccess?.();
        } catch (error: any) {
            console.error("Ошибка удаления аватара:", error);
            const msg = error.response?.data?.error || "Не удалось удалить фото";
            setErrorMessage(msg);
            setErrorDialogOpen(true);
        } finally {
            setUploading(false);
        }
    };

    const handleClosePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setPreviewOpen(false);
    };

    if (!isOwnProfile) {
        return (
            <>
                <div className="cursor-pointer" onClick={loadPreview}>
                    {children}
                </div>
                <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
                    <DialogContent className="max-w-lg bg-background">
                        <div className="flex justify-center">{previewUrl && <img src={previewUrl} alt="Avatar" className="max-w-full max-h-[70vh] rounded-lg" />}</div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    const hasAvatar = !!currentAvatar;

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">{children}</div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Camera className="mr-2 h-4 w-4" />
                        {hasAvatar ? "Изменить фото" : "Добавить фото"}
                    </DropdownMenuItem>
                    {hasAvatar && (
                        <>
                            <DropdownMenuItem onClick={loadPreview}>
                                <Eye className="mr-2 h-4 w-4" />
                                Открыть фото
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDeleteClick} disabled={uploading}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить фото
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить фото профиля?</AlertDialogTitle>
                        <AlertDialogDescription>Фото будет удалено без возможности восстановления.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ошибка</AlertDialogTitle>
                        <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>Закрыть</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
                <DialogContent className="max-w-lg bg-background">
                    <div className="flex justify-center">{previewUrl && <img src={previewUrl} alt="Avatar" className="max-w-full max-h-[70vh] rounded-lg" />}</div>
                </DialogContent>
            </Dialog>
        </>
    );
}
