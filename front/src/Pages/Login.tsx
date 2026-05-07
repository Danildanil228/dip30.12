import React, { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFirst, setIsFirst] = useState<boolean | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkFirstRun();
    }, []);

    const checkFirstRun = async () => {
        try {
            const data = await authService.countUsers();
            setIsFirst(!data.hasUsers);
        } catch (error) {
            console.error("Ошибка проверки первого запуска:", error);
            setError("Не удалось подключиться к серверу");
            setIsFirst(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);

        if (isFirst) {
            if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
                setError("Заполните все поля");
                return;
            }

            if (password !== confirmPassword) {
                setError("Пароли не совпадают");
                return;
            }

            if (password.length < 6) {
                setError("Пароль должен быть не менее 6 символов");
                return;
            }
        } else {
            if (!username.trim() || !password.trim()) {
                setError("Заполните все поля");
                return;
            }
        }

        setLoading(true);

        try {
            let response;
            if (isFirst) {
                response = await authService.registerFirst(username.trim(), password.trim());
            } else {
                response = await authService.login(username.trim(), password.trim());
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            navigate("/main");
        } catch (error: any) {
            console.error("Ошибка авторизации:", error);
            const errorMessage = error.response?.data?.error || "Ошибка";
            setError(errorMessage);
            setPassword("");
            setConfirmPassword("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex justify-center items-center sm:h-screen h-140">
            <form onSubmit={handleSubmit} className="text-center">
                <h1 className="mb-4 text-wrap"> {isFirst ? "Создание админа" : "Авторизация в систему"} </h1>
                <div className="grid gap-5">
                    <input
                        type="text"
                        placeholder="Введите ваш логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-1 sm:text-xl text-base"
                        disabled={loading}
                        required
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Введите ваш пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-1 w-full pr-10 sm:text-xl text-base"
                            disabled={loading}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2" tabIndex={-1}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {isFirst && (
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Подтвердите пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="px-4 py-2 border rounded focus:outline-none focus:ring-1 w-full pr-10 sm:text-xl text-base"
                                disabled={loading}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2" tabIndex={-1}>
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    )}

                    <div className="flex gap-5 items-center">
                        <button type="submit" disabled={loading} className="w-full px-6 py-2 border rounded cursor-pointer hover:transition-colors disabled:opacity-50">
                            {loading ? "..." : isFirst ? "Создать" : "Войти"}
                        </button>
                        <DarkModeButtonToggle />
                    </div>
                    {error && <p className="text-red-500 text-base">{error}</p>}
                </div>
            </form>
        </section>
    );
}
