import { useState } from "react";
import { Button } from "@/components/ui/button";
import {AlertDialog,AlertDialogContent,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface CreateCategoryDialogProps {
  onCategoryCreated?: () => void;
  triggerButton?: React.ReactNode;
}

export default function CreateCategoryDialog({ 
  onCategoryCreated, 
  triggerButton 
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setLoading(true);

      if (!categoryName.trim()) {
        setError("Название категории обязательно");
        return;
      }

      const token = localStorage.getItem("token");
      
      await axios.post(
        `${API_BASE_URL}/categories`,
        {
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCategoryName("");
      setCategoryDescription("");
      setOpen(false);
      
      if (onCategoryCreated) {
        onCategoryCreated();
      }

    } catch (error: any) {
      console.error("Ошибка создания категории:", error);
      setError(error.response?.data?.error || "Ошибка создания категории");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCategoryName("");
      setCategoryDescription("");
      setError(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {triggerButton || <Button>Добавить категорию</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Добавить новую категорию</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Название категории</Label>
              <Input
                id="category-name"
                placeholder="Например: Цементные смеси"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-description">Описание</Label>
              <Textarea
                id="category-description"
                placeholder="Описание категории..."
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="text-base" disabled={loading}>Отмена</AlertDialogCancel>
            <Button  type="submit" className="text-base" disabled={loading}>
              {loading ? "Создание..." : "Создать категорию"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}