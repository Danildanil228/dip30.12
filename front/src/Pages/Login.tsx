import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, Shield } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />

            <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                        {isFirst ? <Shield className="w-8 h-8 text-primary" /> : <img src="/boxes.png" className="w-8 h-8 icon" alt="Logo" />}
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Material House</h1>
                    <p className="text-muted-foreground mt-2">{isFirst ? "Создание администратора" : "Вход в систему"}</p>
                </div>

                <div className="rounded-2xl border bg-card shadow-lg p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Логин</label>
                            <input
                                type="text"
                                placeholder="Введите ваш логин"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                disabled={loading}
                                autoFocus
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Пароль</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Введите ваш пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 transition-all"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isFirst && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                    <label className="text-sm font-medium mb-1.5 block">Подтвердите пароль</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Подтвердите пароль"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 transition-all"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                ) : isFirst ? (
                                    <>
                                        <UserPlus className="h-4 w-4" /> Создать
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4" /> Войти
                                    </>
                                )}
                            </button>
                            <DarkModeButtonToggle />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">Система управления складскими запасами</p>
            </motion.div>
        </div>
    );
}
