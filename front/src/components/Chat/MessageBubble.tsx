import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Edit2, Trash2, CheckCheck, Check } from "lucide-react";
import { API_BASE_URL } from "@/components/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Message } from "./types";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    onEdit?: (id: number, newText: string) => void;
    onDelete?: (id: number, forBoth: boolean) => void;
}

export function MessageBubble({ message, isOwn, onEdit, onDelete }: MessageBubbleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.message || "");
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; forBoth: boolean }>({ open: false, forBoth: false });
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const handleSaveEdit = () => {
        if (editText.trim() && onEdit) {
            onEdit(message.id, editText.trim());
            setIsEditing(false);
        }
    };

    const formatTime = (dateStr: string) => {
        return format(new Date(dateStr), "HH:mm");
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (ext === "pdf") return "📄";
        if (ext === "doc" || ext === "docx") return "📝";
        if (ext === "xls" || ext === "xlsx") return "📊";
        if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif") return "🖼️";
        return "📎";
    };

    return (
        <>
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
                <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                    {!isOwn && <div className="text-xs text-muted-foreground mb-1 ml-2">{message.sender_name}</div>}
                    <div className={`relative group`}>
                        <div className={`rounded-lg px-3 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {/* Текст сообщения */}
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-2 py-1 rounded border bg-background text-foreground" autoFocus />
                                    <Button size="sm" onClick={handleSaveEdit}>
                                        ✓
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                        ✗
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {message.message && <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>}

                                    {/* Изображение */}
                                    {message.image_url && (
                                        <div className="mt-2 cursor-pointer" onClick={() => setImageDialogOpen(true)}>
                                            <img src={`${API_BASE_URL}${message.image_url}`} alt="Изображение" className="max-w-full rounded-lg max-h-48 object-cover" />
                                        </div>
                                    )}

                                    {/* Файл */}
                                    {message.file_url && !message.image_url && (
                                        <a href={`${API_BASE_URL}${message.file_url}`} download={message.file_name || "file"} className="flex items-center gap-2 mt-2 p-2 rounded bg-background/10 hover:bg-background/20 transition-colors">
                                            <span className="text-xl">{getFileIcon(message.file_name || "")}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm truncate">{message.file_name}</div>
                                                {message.file_size && <div className="text-xs opacity-70">{(message.file_size / 1024).toFixed(1)} KB</div>}
                                            </div>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    )}
                                </>
                            )}

                            {/* Отметка о времени и прочтении */}
                            <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"}`}>
                                <span>{formatTime(message.created_at)}</span>
                                {message.edited_at && <span>(ред.)</span>}
                                {isOwn && (message.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                            </div>
                        </div>

                        {/* Меню действий при наведении */}
                        {isOwn && !isEditing && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="absolute -top-2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
                                        ⋮
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Изменить
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, forBoth: false })}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить для себя
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, forBoth: true })}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить для всех
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {/* Диалог просмотра изображения */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/90">
                    <img src={`${API_BASE_URL}${message.image_url}`} alt="Полный размер" className="w-full h-full object-contain" />
                </DialogContent>
            </Dialog>

            {/* Диалог удаления */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleteDialog.forBoth ? "Удалить сообщение для всех?" : "Удалить сообщение?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteDialog.forBoth ? "Сообщение будет удалено у всех участников чата. Восстановить будет невозможно." : "Сообщение будет удалено только у вас. Собеседник сможет его видеть."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (onDelete) {
                                    onDelete(message.id, deleteDialog.forBoth);
                                }
                                setDeleteDialog({ open: false, forBoth: false });
                            }}
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
