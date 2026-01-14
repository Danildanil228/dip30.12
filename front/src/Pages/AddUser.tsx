import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";

export default function AddUser() {
  const [name, setName] = useState("");
  const [secondname, setSecondname] = useState("");
  const [role, setRole] = useState("storekeeper");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Генерация логина
  const handleGenerateLogin = () => {
    if (!name || !secondname) {
      setError("Введите имя и фамилию");
      return;
    }
    const firstLetter = name.charAt(0).toLowerCase();
    const lastName = secondname.toLowerCase();
    const randomNum = Math.floor(Math.random() * 90) + 10;
    setUsername(`${firstLetter}${lastName}${randomNum}`);
  };

  // Генерация пароля
  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !secondname || !username || !password) {
      setError("Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/createUser`, {
        username, password, name, secondname, role
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess(`Пользователь ${username} создан`);
      setName("");
      setSecondname("");
      setUsername("");
      setPassword("");
      setRole("storekeeper");

    } catch (error: any) {
      setError(error.response?.data?.error || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Добавить пользователя</h1>
        <Button>
          <Link to='/allusers' className="text-sm flex gap-3 items-center">
            Все пользователи
          </Link>
        </Button>

      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <p className="text-xl">Имя</p>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 border rounded focus:outline-none focus:ring-1 text-xl"
              required
            />
          </div>

          <div className="grid gap-2">
            <p className="text-xl">Фамилия</p>
            <input
              type="text"
              placeholder="Фамилия"
              value={secondname}
              onChange={(e) => setSecondname(e.target.value)}
              className="px-4 py-3 border rounded focus:outline-none focus:ring-1 text-xl"
              required
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="sm:flex grid items-center gap-4">
            <div className="flex-1">
              <p className="text-xl mb-2">Логин</p>
              <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-1 text-xl"
                required
              />
            </div>
            <Button
              type="button"
              variant='outline'
              onClick={handleGenerateLogin}
              className=""
            >
              <img src="/dice.png" className="icon w-5" alt="" />
            </Button>
          </div>

          <div className="lg:flex grid items-center gap-4">
            <div className="flex-1">
              <p className="text-xl mb-2">Пароль</p>
              <input
                type="text"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-1 text-xl"
                required
                minLength={6}
              />
            </div>
            <Button
              type="button"
              variant='outline'
              onClick={handleGeneratePassword}
              className=""
            >
              <img src="/dice.png" className="icon w-5" alt="" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-xl">Роль</p>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="text-xl py-6">
              <SelectValue placeholder="Роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Администратор</SelectItem>
              <SelectItem value="accountant">Бухгалтер</SelectItem>
              <SelectItem value="storekeeper">Кладовщик</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full lg:w-fit px-8 py-3 text-xl"
          disabled={loading}
        >
          {loading ? "Создание..." : "Создать пользователя"}
        </Button>
      </form>
      {error && <div className=" rounded">{error}</div>}
      {success && <div className="rounded">{success}</div>}
    </section>
  );
}