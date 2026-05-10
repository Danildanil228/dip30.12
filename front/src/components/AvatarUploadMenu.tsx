import { useState, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Camera, Trash2 } from "lucide-react";
import { avatarService } from "@/services/avatarService";
import { useUser } from "@/hooks/useUser";

interface AvatarUploadMenuProps {
    userId: number;
    currentAvatar: string | null | undefined;
    onAvatarUpdate: (newAvatarUrl: string | null) => void;
    children: React.ReactNode;
}

export function AvatarUploadMenu({ userId, currentAvatar, onAvatarUpdate, children }: AvatarUploadMenuProps) {
    const { user, updateCurrentUser } = useUser();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isOwnProfile = user?.id === userId;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await avatarService.uploadAvatar(file);
            if (isOwnProfile) {
                updateCurrentUser({ avatar: result.avatar });
            }
            onAvatarUpdate(result.avatar);
        } catch (error) {
            console.error("Ошибка загрузки аватара:", error);
            alert("Не удалось загрузить фото");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async () => {
        if (!confirm("Удалить фото профиля?")) return;
        setUploading(true);
        try {
            await avatarService.deleteAvatar();
            if (isOwnProfile) {
                updateCurrentUser({ avatar: null });
            }
            onAvatarUpdate(null);
        } catch (error) {
            console.error("Ошибка удаления аватара:", error);
            alert("Не удалось удалить фото");
        } finally {
            setUploading(false);
        }
    };

    const triggerClick = () => {
        if (!isOwnProfile) return;
        fileInputRef.current?.click();
    };

    if (!isOwnProfile) {
        return <div className="cursor-default">{children}</div>;
    }

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
                        {currentAvatar ? "Изменить фото" : "Добавить фото"}
                    </DropdownMenuItem>
                    {currentAvatar && (
                        <DropdownMenuItem onClick={handleDelete} disabled={uploading}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить фото
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
