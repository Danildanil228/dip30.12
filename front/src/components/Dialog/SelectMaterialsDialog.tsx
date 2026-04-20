import { useState, useEffect, useRef } from "react";
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
    const itemsPerPage = 5;
    const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

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

    const handleQuantityBlur = (material: Material, inputValue: string) => {
        let quantity = parseInt(inputValue);
        
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }
        
        if (requestType === 'outgoing' && quantity > material.quantity) {
            alert(`Недостаточно товара. Доступно: ${material.quantity} ${material.unit}`);
            quantity = Math.min(quantity, material.quantity);
            if (quantity < 1) quantity = 1;
            if (inputRefs.current[material.id]) {
                inputRefs.current[material.id]!.value = quantity.toString();
            }
        }
        
        setQuantities({ ...quantities, [material.id]: quantity });
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

    const handleSelectedItemQuantityBlur = (item: SelectedItem, inputValue: string) => {
        let quantity = parseInt(inputValue);
        
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }
        
        if (requestType === 'outgoing' && quantity > item.current_quantity) {
            alert(`Недостаточно товара. Доступно: ${item.current_quantity} ${item.unit}`);
            quantity = Math.min(quantity, item.current_quantity);
            if (quantity < 1) quantity = 1;
            if (inputRefs.current[item.material_id]) {
                inputRefs.current[item.material_id]!.value = quantity.toString();
            }
        }
        
        setQuantities({ ...quantities, [item.material_id]: quantity });
        setTempSelected(tempSelected.map(i =>
            i.material_id === item.material_id
                ? { ...i, quantity: quantity }
                : i
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

    const MaterialCard = ({ material }: { material: Material }) => {
        const isSelected = isMaterialSelected(material.id);
        const currentQuantity = quantities[material.id] || 1;
        
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
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm">Кол-во:</span>
                            <Input
                                ref={(el) => {
                                    if (el) inputRefs.current[material.id] = el;
                                }}
                                type="number"
                                min="1"
                                defaultValue={currentQuantity}
                                onBlur={(e) => handleQuantityBlur(material, e.target.value)}
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
                            {isSelected ? "✓" : <Plus className="h-4 w-4" />}
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
                    <div className="flex flex-col md:flex-row gap-4 items-center text-center">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="код, категория, название"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(0);
                                    setShowAll(false);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-64 justify-center flex sm:justify-end">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="sm:w-full max-w-70">
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
                                        const currentQuantity = quantities[material.id] || 1;
                                        return (
                                            <TableRow key={material.id}>
                                                <TableCell className="font-mono">{material.code}</TableCell>
                                                <TableCell>{material.name}</TableCell>
                                                <TableCell>{material.category_name || "-"}</TableCell>
                                                <TableCell>
                                                    {material.quantity}
                                                </TableCell>
                                                <TableCell>{material.unit}</TableCell>
                                                <TableCell className="w-24">
                                                    <Input
                                                        ref={(el) => {
                                                            if (el) inputRefs.current[material.id] = el;
                                                        }}
                                                        type="number"
                                                        min="1"
                                                        defaultValue={currentQuantity}
                                                        onBlur={(e) => handleQuantityBlur(material, e.target.value)}
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

                    {tempSelected.length > 0 && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3 text-base">Выбранные товары ({tempSelected.length})</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {tempSelected.map((item) => {
                                    const currentQuantity = quantities[item.material_id] || item.quantity;
                                    return (
                                        <div key={item.material_id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 rounded text-wrap">
                                            <div className="flex-1">
                                                <div className="text-base">{item.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    Код: {item.code} | Доступно: {item.current_quantity} {item.unit}
                                                </div>
                                            </div>
                                            <div className="flex items-start text-left justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">Кол-во:</span>
                                                    <Input
                                                        ref={(el) => {
                                                            if (el) inputRefs.current[item.material_id] = el;
                                                        }}
                                                        type="number"
                                                        min="1"
                                                        defaultValue={currentQuantity}
                                                        onBlur={(e) => handleSelectedItemQuantityBlur(item, e.target.value)}
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
                                    );
                                })}
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