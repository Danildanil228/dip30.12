import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

interface Category {
    id: number;
    name: string;
    description: string | null;
}

interface EditCategoryDialogProps {
    categoryId: number;
    onCategoryUpdated?: () => void;
    triggerButton?: React.ReactNode;
    children?: React.ReactNode;
}

export default function EditCategoryDialog({
    categoryId,
    onCategoryUpdated,
    triggerButton,
    children
}: EditCategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open && categoryId) {
            fetchCategory();
        }
    }, [open, categoryId]);

    const fetchCategory = async () => {
        try {
            setLoadingData(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const categoryData = response.data.categories.find(
                (cat: Category) => cat.id === categoryId
            );

            if (categoryData) {
                setCategory(categoryData);
                setName(categoryData.name || "");
                setDescription(categoryData.description || "");
            } else {
                setError("Категория не найдена");
            }

        } catch (error) {
            console.error("Ошибка загрузки категории:", error);
            setError("Не удалось загрузить данные категории");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError(null);
            setLoading(true);

            if (!name.trim()) {
                setError("Название категории обязательно");
                return;
            }

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/categories/${categoryId}`,
                {
                    name: name.trim(),
                    description: description.trim() || null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setOpen(false);

            if (onCategoryUpdated) {
                onCategoryUpdated();
            }

        } catch (error: any) {
            console.error("Ошибка обновления категории:", error);
            setError(error.response?.data?.error || "Ошибка обновления категории");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setError(null);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {triggerButton || children || <Button variant="outline">Редактировать</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Редактировать категорию</AlertDialogTitle>
                    <AlertDialogDescription>
                        {category ? `Редактирование: ${category.name}` : "Загрузка данных..."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {loadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category-name">Название категории *</Label>
                                <Input
                                    id="edit-category-name"
                                    placeholder="Например: Цементные смеси"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-category-description">Описание</Label>
                                <Textarea
                                    id="edit-category-description"
                                    placeholder="Описание категории..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                    rows={3}
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading} className="text-base">Отмена</AlertDialogCancel>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Сохранение..." : "Сохранить изменения"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}