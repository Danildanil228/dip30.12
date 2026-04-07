import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Trash2, AlertCircle, ChevronLeft, ChevronRight} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Material {
    id: number;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    category_name?: string;
    category_id?: number;
}

interface SelectedItem {
    material_id: number;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    current_quantity: number;
}

interface Category {
    id: number;
    name: string;
}

interface SelectMaterialsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (items: SelectedItem[]) => void;
    selectedItems: SelectedItem[];
    requestType: 'incoming' | 'outgoing';
}

export default function SelectMaterialsDialog({
    open,
    onOpenChange,
    onSelect,
    selectedItems,
    requestType
}: SelectMaterialsDialogProps) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [tempSelected, setTempSelected] = useState<SelectedItem[]>(selectedItems);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const [showAll, setShowAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        if (open) {
            fetchMaterials();
            fetchCategories();
            const initialQuantities: { [key: number]: number } = {};
            selectedItems.forEach(item => {
                initialQuantities[item.material_id] = item.quantity;
            });
            setQuantities(initialQuantities);
            setTempSelected([...selectedItems]);
            setCurrentPage(0);
            setShowAll(false);
        }
    }, [open]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(response.data.materials);
        } catch (error) {
            console.error("Ошибка загрузки материалов:", error);
        } finally {
            setLoading(false);
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

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = searchTerm === "" || 
            material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (material.category_name && material.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = selectedCategory === "all" || 
            (material.category_id && material.category_id.toString() === selectedCategory);
        
        return matchesSearch && matchesCategory;
    });

    const totalItems = filteredMaterials.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedMaterials = showAll 
        ? filteredMaterials 
        : filteredMaterials.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleToggleShowAll = () => {
        if (showAll) {
            setShowAll(false);
            setCurrentPage(0);
        } else {
            setShowAll(true);
        }
    };

    const isMaterialSelected = (materialId: number) => {
        return tempSelected.some(item => item.material_id === materialId);
    };

    const getSelectedQuantity = (materialId: number) => {
        return quantities[materialId] || 1;
    };

    const handleAddMaterial = (material: Material) => {
        if (isMaterialSelected(material.id)) {
            return;
        }

        const quantity = quantities[material.id] || 1;
        
        if (requestType === 'outgoing' && quantity > material.quantity) {
            alert(`Недостаточно товара. Доступно: ${material.quantity} ${material.unit}`);
            return;
        }

        const newItem: SelectedItem = {
            material_id: material.id,
            name: material.name,
            code: material.code,
            unit: material.unit,
            quantity: quantity,
            current_quantity: material.quantity
        };

        setTempSelected([...tempSelected, newItem]);
    };

    const handleRemoveMaterial = (materialId: number) => {
        setTempSelected(tempSelected.filter(item => item.material_id !== materialId));
        const newQuantities = { ...quantities };
        delete newQuantities[materialId];
        setQuantities(newQuantities);
    };

    const handleQuantityChange = (materialId: number, value: number) => {
        if (value < 1) {
            value = 1;
        }
        
        const material = materials.find(m => m.id === materialId);
        if (requestType === 'outgoing' && material && value > material.quantity) {
            alert(`Недостаточно товара. Доступно: ${material.quantity} ${material.unit}`);
            return;
        }

        setQuantities({ ...quantities, [materialId]: value });
        
        setTempSelected(tempSelected.map(item =>
            item.material_id === materialId
                ? { ...item, quantity: value }
                : item
        ));
    };

    const handleConfirm = () => {
        if (tempSelected.length === 0) {
            alert("Выберите хотя бы один товар");
            return;
        }
        onSelect(tempSelected);
        onOpenChange(false);
    };

    // Компонент карточки товара для мобильных
    const MaterialCard = ({ material }: { material: Material }) => {
        const isSelected = isMaterialSelected(material.id);
        const quantity = getSelectedQuantity(material.id);
        
        return (
            <Card className="mb-3">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                            <h3 className="font-semibold text-base">{material.name}</h3>
                            <p className="text-sm text-gray-500">Код: {material.code}</p>
                            {material.category_name && (
                                <p className="text-sm text-gray-500">Категория: {material.category_name}</p>
                            )}
                        </div>
                        <Badge variant={material.quantity === 0 ? "destructive" : "default"}>
                            {material.quantity} {material.unit}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Кол-во:</span>
                            <Input
                                type="number"
                                min="1"
                                max={requestType === 'outgoing' ? material.quantity : undefined}
                                value={quantity}
                                onChange={(e) => handleQuantityChange(material.id, parseInt(e.target.value) || 1)}
                                disabled={isSelected}
                                className="w-20 h-8"
                            />
                            <span className="text-sm">{material.unit}</span>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleAddMaterial(material)}
                            disabled={isSelected || (requestType === 'outgoing' && material.quantity === 0)}
                            variant={isSelected ? "secondary" : "default"}
                        >
                            {isSelected ? "Добавлен" : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl! max-h-[80vh] overflow-y-auto mt-5">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Выбор товаров для заявки</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Фильтры */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Поиск по названию, коду или категории..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(0);
                                    setShowAll(false);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    </div>

                    {/* Десктопная таблица (видна только на больших экранах) */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Код</TableHead>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Категория</TableHead>
                                    <TableHead>Доступно</TableHead>
                                    <TableHead>Ед.</TableHead>
                                    <TableHead>Кол-во</TableHead>
                                    <TableHead className="w-20"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedMaterials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            Товары не найдены
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedMaterials.map((material) => {
                                        const isSelected = isMaterialSelected(material.id);
                                        return (
                                            <TableRow key={material.id}>
                                                <TableCell className="font-mono">{material.code}</TableCell>
                                                <TableCell>{material.name}</TableCell>
                                                <TableCell>{material.category_name || "-"}</TableCell>
                                                <TableCell>
                                                    {material.quantity}
                                                    {material.quantity < 10 && material.quantity > 0 && (
                                                        <AlertCircle className="inline ml-1 h-4 w-4 text-yellow-500" />
                                                    )}
                                                    {material.quantity === 0 && (
                                                        <Badge variant="destructive" className="ml-1">Нет в наличии</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{material.unit}</TableCell>
                                                <TableCell className="w-24">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={requestType === 'outgoing' ? material.quantity : undefined}
                                                        value={getSelectedQuantity(material.id)}
                                                        onChange={(e) => handleQuantityChange(material.id, parseInt(e.target.value) || 1)}
                                                        disabled={isSelected}
                                                        className="w-20"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddMaterial(material)}
                                                        disabled={isSelected || (requestType === 'outgoing' && material.quantity === 0)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Мобильные карточки (видно только на маленьких экранах) */}
                    <div className="md:hidden">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
                            </div>
                        ) : paginatedMaterials.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Товары не найдены
                            </div>
                        ) : (
                            paginatedMaterials.map((material) => (
                                <MaterialCard key={material.id} material={material} />
                            ))
                        )}
                    </div>

                    {/* Пагинация */}
                    {!showAll && totalPages > 1 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500 order-2 md:order-1">
                                Всего товаров: {totalItems}
                            </div>
                            <div className="flex items-center gap-2 order-1 md:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm whitespace-nowrap">
                                    {currentPage + 1} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleShowAll}
                                >
                                    Развернуть
                                </Button>
                            </div>
                        </div>
                    )}

                    {showAll && totalItems > 10 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500 order-2 md:order-1">
                                Всего товаров: {totalItems}
                            </div>
                            <div className="order-1 md:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleShowAll}
                                >
                                    Свернуть
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Выбранные товары */}
                    {tempSelected.length > 0 && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Выбранные товары ({tempSelected.length})</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {tempSelected.map((item) => (
                                    <div key={item.material_id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-500">
                                                Код: {item.code} | Доступно: {item.current_quantity} {item.unit}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between w-full md:w-auto gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">Кол-во:</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max={requestType === 'outgoing' ? item.current_quantity : undefined}
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.material_id, parseInt(e.target.value) || 1)}
                                                    className="w-20 h-8"
                                                />
                                                <span className="text-sm">{item.unit}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveMaterial(item.material_id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleConfirm}>
                        Подтвердить ({tempSelected.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}