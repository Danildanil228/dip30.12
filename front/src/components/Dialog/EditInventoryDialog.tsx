import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Inventory {
    id: number;
    title: string;
    status: string;
    responsible_person: number;
    responsible_username: string;
    start_date: string;
    end_date: string;
    description: string | null;
}

interface EditInventoryDialogProps {
    inventory: Inventory | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInventoryUpdated: () => void;
}

export default function EditInventoryDialog({ inventory, open, onOpenChange, onInventoryUpdated }: EditInventoryDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [responsiblePerson, setResponsiblePerson] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open && inventory) {
            fetchUsers();
            setTitle(inventory.title);
            setResponsiblePerson(inventory.responsible_person.toString());
            setStartDate(new Date(inventory.start_date));
            setEndDate(new Date(inventory.end_date));
            setDescription(inventory.description || "");
            setError("");
        }
    }, [open, inventory]);

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
            await axios.put(
                `${API_BASE_URL}/inventories/${inventory?.id}`,
                {
                    title: title.trim(),
                    responsible_person: parseInt(responsiblePerson),
                    start_date: format(startDate, "yyyy-MM-dd"),
                    end_date: format(endDate, "yyyy-MM-dd"),
                    description: description.trim() || null
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            onOpenChange(false);
            onInventoryUpdated();
        } catch (error: any) {
            console.error("Ошибка обновления:", error);
            setError(error.response?.data?.error || "Ошибка обновления инвентаризации");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => user.role === "storekeeper" || user.role === "admin");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Редактирование инвентаризации</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-title">Название</Label>
                        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Ответственный</Label>
                        <Select value={responsiblePerson} onValueChange={setResponsiblePerson} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите ответственного" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name} {user.secondname} ({user.username})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={ru} disabled={(date) => (startDate ? date < startDate : false)} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Описание</Label>
                        <Textarea id="edit-description" placeholder="Дополнительная информация..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={loading} />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
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
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
