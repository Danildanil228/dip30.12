import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

interface Category {
    id: number;
    name: string;
}

interface Material {
    id: number;
    name: string;
    code: string;
    description: string | null;
    unit: string;
    quantity: number;
    category_id: number | null;
}

interface EditMaterialDialogProps {
    materialId: number;
    onMaterialUpdated?: () => void;
    triggerButton?: React.ReactNode;
    children?: React.ReactNode;
}

const MATERIAL_UNITS = [
    "шт", "кг", "г", "т",
    "м", "см", "мм",
    "м²", "м³",
    "л", "мл",
    "упак.", "рулон", "лист",
    "мешок", "банка", "ведро",
    "пара", "комплект", "набор"
];

export default function EditMaterialDialog({
    materialId,
    onMaterialUpdated,
    triggerButton,
    children
}: EditMaterialDialogProps) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState("шт");
    const [categoryId, setCategoryId] = useState<string>("0");

    useEffect(() => {
        if (open && materialId) {
            fetchData();
        }
    }, [open, materialId]);

    const fetchData = async () => {
        try {
            setLoadingData(true);
            const token = localStorage.getItem("token");

            const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(categoriesResponse.data.categories || []);

            const materialResponse = await axios.get(`${API_BASE_URL}/materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const materialData = materialResponse.data.material;
            setMaterial(materialData);

            setName(materialData.name || "");
            setCode(materialData.code || "");
            setDescription(materialData.description || "");
            setUnit(materialData.unit || "шт");

            if (materialData.category_id) {
                setCategoryId(materialData.category_id.toString());
            } else {
                setCategoryId("0");
            }

        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            setError("Не удалось загрузить данные материала");
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
                setError("Название материала обязательно");
                return;
            }

            if (!code.trim()) {
                setError("Код материала обязателен");
                return;
            }

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/materials/${materialId}`,
                {
                    name: name.trim(),
                    code: code.trim(),
                    description: description.trim() || null,
                    unit,
                    category_id: categoryId !== "0" ? parseInt(categoryId) : null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setOpen(false);

            if (onMaterialUpdated) {
                onMaterialUpdated();
            }

        } catch (error: any) {
            console.error("Ошибка обновления материала:", error);
            setError(error.response?.data?.error || "Ошибка обновления материала");
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
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Редактировать материал</AlertDialogTitle>
                    <AlertDialogDescription>
                        {material ? `Редактирование: ${material.name}` : "Загрузка данных..."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {loadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-material-name">Название материала *</Label>
                                    <Input
                                        id="edit-material-name"
                                        placeholder="Например: Цемент М500"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-material-code">Код *</Label>
                                    <Input
                                        id="edit-material-code"
                                        placeholder="Например: CEM-001"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-material-description">Описание</Label>
                                <Textarea
                                    id="edit-material-description"
                                    placeholder="Описание материала, технические характеристики..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-material-unit">Единица измерения *</Label>
                                    <Select value={unit} onValueChange={setUnit} disabled={loading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите единицу" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MATERIAL_UNITS.map((unitItem) => (
                                                <SelectItem key={unitItem} value={unitItem}>
                                                    {unitItem}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-material-quantity">Текущее количество</Label>
                                    <Input
                                        id="edit-material-quantity"
                                        value={material?.quantity || 0}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Количество изменяется только через операции прихода/расхода
                                    </p>
                                </div>
                            </div>

                            {/* Категория */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-material-category">Категория</Label>
                                <Select
                                    value={categoryId}
                                    onValueChange={setCategoryId}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите категорию">
                                            {categoryId !== "0" ?
                                                categories.find(c => c.id.toString() === categoryId)?.name
                                                : "Без категории"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Без категории</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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