import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

interface User {
    id: number;
    username: string;
    name: string;
    secondname: string;
    role: string;
}

interface Category {
    id: number;
    name: string;
}

interface Material {
    id: number;
    name: string;
    code: string;
    category_id: number | null;
}

interface CreateInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInventoryCreated: () => void;
}

export default function CreateInventoryDialog({ open, onOpenChange, onInventoryCreated }: CreateInventoryDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [title, setTitle] = useState("");
    const [responsiblePerson, setResponsiblePerson] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [description, setDescription] = useState("");
    
    // Выбор товаров
    const [selectionMode, setSelectionMode] = useState<"all" | "categories" | "materials">("all");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            fetchUsers();
            fetchCategories();
            fetchMaterials();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Только кладовщики могут быть ответственными
            const storekeepers = response.data.users.filter((u: User) => u.role === 'storekeeper');
            setUsers(storekeepers);
        } catch (error) {
            console.error("Ошибка загрузки пользователей:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error("Ошибка загрузки категорий:", error);
        }
    };

    const fetchMaterials = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(response.data.materials || []);
        } catch (error) {
            console.error("Ошибка загрузки материалов:", error);
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleMaterialToggle = (materialId: number) => {
        setSelectedMaterials(prev =>
            prev.includes(materialId)
                ? prev.filter(id => id !== materialId)
                : [...prev, materialId]
        );
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError("Введите название");
            return;
        }
        if (!responsiblePerson) {
            setError("Выберите ответственного");
            return;
        }
        if (!startDate) {
            setError("Выберите дату начала");
            return;
        }
        if (!endDate) {
            setError("Выберите дату окончания");
            return;
        }
        if (startDate > endDate) {
            setError("Дата начала не может быть позже даты окончания");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const payload: any = {
                title: title.trim(),
                responsible_person: parseInt(responsiblePerson),
                start_date: format(startDate, "yyyy-MM-dd"),
                end_date: format(endDate, "yyyy-MM-dd"),
                description: description.trim() || null,
            };

            if (selectionMode === "categories" && selectedCategories.length > 0) {
                payload.categories = selectedCategories;
            } else if (selectionMode === "materials" && selectedMaterials.length > 0) {
                payload.materials = selectedMaterials;
            }

            await axios.post(`${API_BASE_URL}/inventories`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Сброс формы
            setTitle("");
            setResponsiblePerson("");
            setStartDate(undefined);
            setEndDate(undefined);
            setDescription("");
            setSelectionMode("all");
            setSelectedCategories([]);
            setSelectedMaterials([]);
            
            onOpenChange(false);
            onInventoryCreated();

        } catch (error: any) {
            console.error("Ошибка создания:", error);
            setError(error.response?.data?.error || "Ошибка создания инвентаризации");
        } finally {
            setLoading(false);
        }
    };

    const getMaterialsByCategory = (categoryId: number) => {
        return materials.filter(m => m.category_id === categoryId);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Создание инвентаризации</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Название */}
                    <div>
                        <Label htmlFor="title">Название *</Label>
                        <Input
                            id="title"
                            placeholder="Инвентаризация склада Апрель 2025"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Ответственный */}
                    <div>
                        <Label htmlFor="responsible">Ответственный (кладовщик) *</Label>
                        <Select value={responsiblePerson} onValueChange={setResponsiblePerson} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите ответственного" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name} {user.secondname} ({user.username})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Даты */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Дата начала *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "dd.MM.yyyy") : "Выберите дату"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        locale={ru}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>Дата окончания *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "dd.MM.yyyy") : "Выберите дату"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        locale={ru}
                                        disabled={(date) => startDate ? date < startDate : false}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Описание */}
                    <div>
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            placeholder="Дополнительная информация..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            disabled={loading}
                        />
                    </div>

                    {/* Выбор товаров */}
                    <div className="border rounded-lg p-4">
                        <Label className="mb-3 block">Что инвентаризируем?</Label>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="all"
                                    name="selectionMode"
                                    checked={selectionMode === "all"}
                                    onChange={() => setSelectionMode("all")}
                                />
                                <label htmlFor="all">Все товары</label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="categories"
                                    name="selectionMode"
                                    checked={selectionMode === "categories"}
                                    onChange={() => setSelectionMode("categories")}
                                />
                                <label htmlFor="categories">Выбрать категории</label>
                            </div>
                            
                            {selectionMode === "categories" && (
                                <div className="ml-6 space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`cat-${category.id}`}
                                                checked={selectedCategories.includes(category.id)}
                                                onCheckedChange={() => handleCategoryToggle(category.id)}
                                            />
                                            <label htmlFor={`cat-${category.id}`}>
                                                {category.name} ({getMaterialsByCategory(category.id).length} товаров)
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="materials"
                                    name="selectionMode"
                                    checked={selectionMode === "materials"}
                                    onChange={() => setSelectionMode("materials")}
                                />
                                <label htmlFor="materials">Выбрать конкретные товары</label>
                            </div>
                            
                            {selectionMode === "materials" && (
                                <div className="ml-6 space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                                    {categories.map((category) => {
                                        const categoryMaterials = getMaterialsByCategory(category.id);
                                        if (categoryMaterials.length === 0) return null;
                                        return (
                                            <div key={category.id} className="mb-3">
                                                <div className="font-semibold text-sm mb-2">{category.name}</div>
                                                <div className="ml-4 space-y-1">
                                                    {categoryMaterials.map((material) => (
                                                        <div key={material.id} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`mat-${material.id}`}
                                                                checked={selectedMaterials.includes(material.id)}
                                                                onCheckedChange={() => handleMaterialToggle(material.id)}
                                                            />
                                                            <label htmlFor={`mat-${material.id}`} className="text-sm">
                                                                {material.name} ({material.code})
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ошибка */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Создание..." : "Создать"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}