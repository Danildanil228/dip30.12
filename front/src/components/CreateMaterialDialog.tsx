import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

interface Category {
    id: number;
    name: string;
}

interface CreateMaterialDialogProps {
    onMaterialCreated?: () => void;
    triggerButton?: React.ReactNode;
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

export default function CreateMaterialDialog({
    onMaterialCreated,
    triggerButton
}: CreateMaterialDialogProps) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState("шт");
    const [quantity, setQuantity] = useState("0");
    const [categoryId, setCategoryId] = useState<string>("no-category");

    useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error("Ошибка загрузки категорий:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const generateMaterialCode = () => {
        if (!name.trim()) return;

        const words = name.trim().split(' ');
        let codePrefix = '';

        if (words.length >= 2) {
            codePrefix = words[0].charAt(0).toUpperCase() +
                words[1].charAt(0).toUpperCase();
        } else {
            codePrefix = words[0].substring(0, 3).toUpperCase();
        }

        const randomNum = Math.floor(Math.random() * 900) + 100;
        setCode(`${codePrefix}-${randomNum}`);
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

            const quantityNum = parseInt(quantity);
            if (isNaN(quantityNum) || quantityNum < 0) {
                setError("Количество должно быть положительным числом");
                return;
            }

            const token = localStorage.getItem("token");

            const categoryIdToSend = categoryId === "no-category" ? null : categoryId;

            const response = await axios.post(
                `${API_BASE_URL}/materials`,
                {
                    name: name.trim(),
                    code: code.trim(),
                    description: description.trim() || null,
                    unit,
                    quantity: quantityNum,
                    category_id: categoryIdToSend ? parseInt(categoryIdToSend) : null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setName("");
            setCode("");
            setDescription("");
            setUnit("шт");
            setQuantity("0");
            setCategoryId("no-category");
            setOpen(false);

            if (onMaterialCreated) {
                onMaterialCreated();
            }

        } catch (error: any) {
            console.error("Ошибка создания материала:", error);
            setError(error.response?.data?.error || "Ошибка создания материала");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setName("");
            setCode("");
            setDescription("");
            setUnit("шт");
            setQuantity("0");
            setCategoryId("no-category");
            setError(null);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                {triggerButton || <Button>Добавить материал</Button>}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Добавить новый материал</AlertDialogTitle>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid gap-4">
                                <Label htmlFor="material-name">Название материала *</Label>
                                <Input
                                    id="material-name"
                                    placeholder="Например: Цемент М500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="grid gap-">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="material-code">Код *</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={generateMaterialCode}
                                        disabled={!name.trim() || loading}
                                    >
                                        Сгенерировать
                                    </Button>
                                </div>
                                <Input
                                    id="material-code"
                                    placeholder="Например: CEM-001"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="material-description">Описание</Label>
                            <Textarea
                                id="material-description"
                                placeholder="Описание материала..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="material-unit">Единица измерения *</Label>
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
                                <Label htmlFor="material-quantity">Начальное количество</Label>
                                <Input
                                    id="material-quantity"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="material-category">Категория</Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                                disabled={loading || loadingCategories}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-category">Без категории</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {loadingCategories && (
                                <p className="text-sm text-gray-500">Загрузка категорий...</p>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading} className="text-base">Отмена</AlertDialogCancel>
                        <Button className="text-base" type="submit" disabled={loading}>
                            {loading ? "Создание..." : "Создать материал"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}