import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";

interface Log {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_name: string;
  name: string;
  secondname: string;
}
interface LogsProps {
  onVisited?: () => void;
}

export default function Notifications({ onVisited }: LogsProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const LOG_TYPES = [
    { value: "user_created", label: "Создание пользователя" },
    { value: "user_deleted", label: "Удаление пользователя" },
    { value: "profile_updated", label: "Изменение профиля" },
    { value: "password_changed", label: "Смена пароля" },
    { value: "admin_user_updated", label: "Админ изменил данные" },
    { value: "admin_password_changed", label: "Админ сменил пароль" },
    { value: "login", label: "Вход в систему" }
  ];

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data.logs);
      if (onVisited) {
        onVisited();
      }
    } catch (error) {
      console.error("Ошибка загрузки логов:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(logs.filter(log => log.id !== id));
    } catch (error) {
      console.error("Ошибка удаления лога:", error);
    }
  };

  const handleDeleteAllLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs([]);
    } catch (error) {
      console.error("Ошибка удаления логов:", error);
    }
  };
  const filteredLogs = selectedTypes.length > 0
    ? logs.filter(log => selectedTypes.includes(log.type))
    : logs;


  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const parseMessageWithLinks = (message: string) => {
    const parts = message.split(/(\[user:\d+:\w+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[user:(\d+):(\w+)\]/);
      if (match) {
        const userId = parseInt(match[1]);
        const username = match[2];

        return (
          <Link
            key={index}
            to={`/profile/${userId}`}
            className="text-blue-500 hover:underline mx-1"
          >
            {username}
          </Link>
        );
      }
      return part;
    });
  };

  if (loading) {
    return <div className="p-4">Загрузка логов...</div>;
  }

  return (
    <div className="lg:my-0 my-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl mb-4">
          Журнал действий {logs.length !== filteredLogs.length  && `(${filteredLogs.length}/${logs.length})`}
        </h1>

        <div className="grid sm:flex text-center items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Фильтры {selectedTypes.length > 0 && `(${selectedTypes.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4">
              <div className="grid gap-2">
                {LOG_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={(checked) =>
                        handleTypeChange(type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`type-${type.value}`}
                      className="text-sm leading-none cursor-pointer"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {logs.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Удалить все ({logs.length})</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить все записи из журнала?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllLogs}>
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-4 border rounded-lg`}
          >
            <div className="flex justify-between items-center">
              <div className="flex">
                <h3 className="text-xs">{log.title}</h3>
              </div>
              <div className="flex items-center gap-10">
                <span className="text-sm">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <button onClick={() => handleDeleteLog(log.id)}>
                  <img src="/trash.png" className="icon w-5 items-center" alt="" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-xl flex flex-wrap items-center">
              {parseMessageWithLinks(log.message)}
            </div>
            {log.user_name && (
              <p className="text-sm mt-1">
                Пользователь: {log.name} {log.secondname} ({log.user_name})
              </p>
            )}
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <p className="text-center py-8">
            {selectedTypes.length > 0 ? "Нет записей по выбранным фильтрам" : "Нет записей в журнале"}
          </p>
        )}
      </div>
    </div>
  );
}