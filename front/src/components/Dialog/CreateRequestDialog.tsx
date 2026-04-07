import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { useUser } from "@/hooks/useUser";
import SelectMaterialsDialog from "./SelectMaterialsDialog";

interface SelectedItem {
    material_id: number;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    current_quantity: number;
}

interface CreateRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRequestCreated: () => void;
}

export default function CreateRequestDialog({ open, onOpenChange, onRequestCreated }: CreateRequestDialogProps) {
    const { user, isAdmin } = useUser();
    const [title, setTitle] = useState("");
    const [requestType, setRequestType] = useState<"incoming" | "outgoing">("incoming");
    const [notes, setNotes] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [showMaterialsDialog, setShowMaterialsDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (autoApprove: boolean = false) => {
        if (!title.trim()) {
            setError("Введите название заявки");
            return;
        }

        if (selectedItems.length === 0) {
            setError("Выберите хотя бы один товар");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const payload = {
                title: title.trim(),
                request_type: requestType,
                notes: notes.trim() || null,
                items: selectedItems.map(item => ({
                    material_id: item.material_id,
                    quantity: item.quantity
                })),
                is_public: isPublic,
                is_approved: autoApprove && isAdmin
            };

            await axios.post(`${API_BASE_URL}/requests`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Сброс формы
            setTitle("");
            setRequestType("incoming");
            setNotes("");
            setIsPublic(true);
            setSelectedItems([]);
            
            onOpenChange(false);
            onRequestCreated();

        } catch (error: any) {
            console.error("Ошибка создания заявки:", error);
            setError(error.response?.data?.error || "Ошибка создания заявки");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMaterials = (items: SelectedItem[]) => {
        setSelectedItems(items);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Создание новой заявки</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Название заявки */}
                        <div>
                            <Label htmlFor="title">Название заявки *</Label>
                            <Input
                                id="title"
                                placeholder="Например: Заявка на пополнение склада"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Тип заявки */}
                        <div>
                            <Label htmlFor="type">Тип заявки *</Label>
                            <Select
                                value={requestType}
                                onValueChange={(value: "incoming" | "outgoing") => setRequestType(value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="incoming">Приход (пополнение склада)</SelectItem>
                                    <SelectItem value="outgoing">Расход (списание со склада)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Выбор товаров */}
                        <div>
                            <Label>Товары *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mt-1"
                                onClick={() => setShowMaterialsDialog(true)}
                                disabled={loading}
                            >
                                <Package className="mr-2 h-4 w-4" />
                                {selectedItems.length === 0 
                                    ? "Выбрать товары" 
                                    : `Выбрано товаров: ${selectedItems.length}`}
                            </Button>
                            {selectedItems.length > 0 && (
                                <div className="mt-2 text-sm text-green-600">
                                    ✓ {selectedItems.length} товар(ов) добавлено
                                </div>
                            )}
                        </div>

                        {/* Примечания */}
                        <div>
                            <Label htmlFor="notes">Примечания</Label>
                            <Textarea
                                id="notes"
                                placeholder="Дополнительная информация..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                disabled={loading}
                            />
                        </div>

                        {/* Видимость (только для админа) */}
                        {isAdmin && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isPublic"
                                    checked={isPublic}
                                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                                    disabled={loading}
                                />
                                <Label htmlFor="isPublic" className="cursor-pointer">
                                    Отображать заявку для всех
                                </Label>
                            </div>
                        )}

                        {/* Ошибка */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Отмена
                        </Button>
                        <Button onClick={() => handleSubmit(false)} disabled={loading}>
                            {loading ? "Создание..." : "Создать заявку"}
                        </Button>
                        {isAdmin && (
                            <Button onClick={() => handleSubmit(true)} disabled={loading} variant="default">
                                {loading ? "Создание..." : "Создать и подтвердить"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SelectMaterialsDialog
                open={showMaterialsDialog}
                onOpenChange={setShowMaterialsDialog}
                onSelect={handleSelectMaterials}
                selectedItems={selectedItems}
                requestType={requestType}
            />
        </>
    );
}