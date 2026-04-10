import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { RadioGroup } from "../ui/radio-group";

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
    category_name?: string;
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
    const [userSearch, setUserSearch] = useState("");
    const [selectionMode, setSelectionMode] = useState<"all" | "categories" | "materials">("all");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [categorySearch, setCategorySearch] = useState("");
    const [materialSearch, setMaterialSearch] = useState("");
    const [materialSelectedCategory, setMaterialSelectedCategory] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(0);
    const [showAllMaterials, setShowAllMaterials] = useState(false);
    const itemsPerPage = 10;
    const today = new Date();

    useEffect(() => {
        if (open) {
            fetchUsers();
            fetchCategories();
            fetchMaterials();
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setTitle("");
        setResponsiblePerson("");
        setStartDate(undefined);
        setEndDate(undefined);
        setDescription("");
        setSelectionMode("all");
        setSelectedCategories([]);
        setSelectedMaterials([]);
        setUserSearch("");
        setCategorySearch("");
        setMaterialSearch("");
        setMaterialSelectedCategory("all");
        setCurrentPage(0);
        setShowAllMaterials(false);
        setError("");
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users || []);
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

    const filteredUsers = users.filter((user) => {
        const search = userSearch.toLowerCase();
        return (
            user.name?.toLowerCase().includes(search) ||
            user.secondname?.toLowerCase().includes(search) ||
            user.username?.toLowerCase().includes(search)
        );
    });

    const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()));

    const filteredMaterials = materials.filter((material) => {
        const matchesSearch =
            materialSearch === "" ||
            material.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
            material.code.toLowerCase().includes(materialSearch.toLowerCase());

        const matchesCategory =
            materialSelectedCategory === "all" || (material.category_id && material.category_id.toString() === materialSelectedCategory);

        return matchesSearch && matchesCategory;
    });

    const totalMaterials = filteredMaterials.length;
    const totalPages = Math.ceil(totalMaterials / itemsPerPage);
    const paginatedMaterials = showAllMaterials
        ? filteredMaterials
        : filteredMaterials.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleCategoryToggle = (categoryId: number) => {
        setSelectedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
    };

    const handleMaterialToggle = (materialId: number) => {
        setSelectedMaterials((prev) => (prev.includes(materialId) ? prev.filter((id) => id !== materialId) : [...prev, materialId]));
    };

    const handleSelectAllInCategory = (categoryId: number) => {
        const categoryMaterials = materials.filter((m) => m.category_id === categoryId);
        const allSelected = categoryMaterials.every((m) => selectedMaterials.includes(m.id));

        if (allSelected) {
            setSelectedMaterials((prev) => prev.filter((id) => !categoryMaterials.some((m) => m.id === id)));
        } else {
            const newIds = categoryMaterials.map((m) => m.id);
            setSelectedMaterials((prev) => [...new Set([...prev, ...newIds])]);
        }
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
        if (today > startDate) {
            setError("Дата начала не может быть раньше сегодняшней даты");
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
                description: description.trim() || null
            };

            if (selectionMode === "categories" && selectedCategories.length > 0) {
                payload.categories = selectedCategories;
            } else if (selectionMode === "materials" && selectedMaterials.length > 0) {
                payload.materials = selectedMaterials;
            }

            await axios.post(`${API_BASE_URL}/inventories`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            resetForm();
            onOpenChange(false);
            onInventoryCreated();
        } catch (error: any) {
            console.error("Ошибка создания:", error);
            setError(error.response?.data?.error || "Ошибка создания инвентаризации");
        } finally {
            setLoading(false);
        }
    };

    const materialsByCategory = categories
        .map((category) => ({
            ...category,
            materials: materials.filter((m) => m.category_id === category.id)
        }))
        .filter((c) => c.materials.length > 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg">Создание инвентаризации</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Название</Label>
                        <Input
                            id="title"
                            placeholder="Инвентаризация склада"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Ответственный</Label>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="Поиск" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
                        </div>

                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                                <div className="p-3 text-center text-gray-500">Пользователи не найдены</div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-b-0 ${
                                            responsiblePerson === user.id.toString() ? "bg-primary/10 border-l-4 border-l-primary" : ""
                                        }`}
                                        onClick={() => setResponsiblePerson(user.id.toString())}
                                    >
                                        <div>
                                            <div className="text-base">
                                                {user.name} {user.secondname}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.username} •{" "}
                                                {user.role === "admin" ? "Администратор" : user.role === "accountant" ? "Бухгалтер" : "Кладовщик"}
                                            </div>
                                        </div>
                                        {responsiblePerson === user.id.toString() && <div className="text-gray-500 text-sm">Выбран</div>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Дата начала</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "dd.MM.yyyy") : "Выберите дату"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={ru} />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label>Дата окончания</Label>
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
                                        disabled={(date) => (startDate ? date < startDate : false)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="grid gap-2">
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

                    <div className="border rounded-lg p-4">
                        <Label className="mb-3 block">Что инвентаризируем?</Label>

                        <div className="space-y-3 text-base">
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
                                <div className="ml-6">
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Поиск категорий..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                                        {filteredCategories.length === 0 ? (
                                            <div className="text-center text-gray-500 py-2">Категории не найдены</div>
                                        ) : (
                                            filteredCategories.map((category) => (
                                                <div key={category.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`cat-${category.id}`}
                                                        checked={selectedCategories.includes(category.id)}
                                                        onCheckedChange={() => handleCategoryToggle(category.id)}
                                                    />
                                                    <label htmlFor={`cat-${category.id}`}>{category.name}</label>
                                                </div>
                                            ))
                                        )}
                                    </div>
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
                                <div className="ml-6">
                                    <div className="flex flex-col gap-2 mb-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Поиск"
                                                value={materialSearch}
                                                onChange={(e) => {
                                                    setMaterialSearch(e.target.value);
                                                    setCurrentPage(0);
                                                    setShowAllMaterials(false);
                                                }}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={materialSelectedCategory} onValueChange={setMaterialSelectedCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Все категории" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Все категории</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded p-2">
                                        {paginatedMaterials.length === 0 ? (
                                            <div className="text-center text-gray-500 py-2">Товары не найдены</div>
                                        ) : (
                                            paginatedMaterials.map((material) => (
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
                                            ))
                                        )}
                                    </div>

                                    {!showAllMaterials && totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="text-xs text-gray-500">Всего: {totalMaterials}</div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                                    disabled={currentPage === 0}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm">
                                                    {currentPage + 1} / {totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                                    disabled={currentPage === totalPages - 1}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setShowAllMaterials(true)}>
                                                    Развернуть
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {showAllMaterials && totalMaterials > 10 && (
                                        <div className="flex justify-end mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowAllMaterials(false);
                                                    setCurrentPage(0);
                                                }}
                                            >
                                                Свернуть
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

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
