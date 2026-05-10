import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, Shield, Package, BarChart3, Users, CheckCircle2, ArrowRight } from "lucide-react";
import type { LoginResponse } from "@/types/user.types";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFirst, setIsFirst] = useState<boolean | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkFirstRun();

        const savedUsername = localStorage.getItem("rememberedUsername");
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
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

        if (!isFirst) {
            if (!username.trim() || !password.trim()) {
                setError("Заполните все поля");
                return;
            }
        } else {
            if (step === 1) {
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
                if (username.length < 5) {
                    setError("Логин должен быть не менее 5 символов");
                    return;
                }
                setStep(2);
                return;
            }
        }

        setLoading(true);

        try {
            let response: LoginResponse;
            if (isFirst) {
                response = await authService.registerFirst(username.trim(), password.trim());
            } else {
                response = await authService.login(username.trim(), password.trim());
            }

            if (rememberMe) {
                localStorage.setItem("rememberedUsername", username.trim());
            } else {
                localStorage.removeItem("rememberedUsername");
            }

            navigate("/main");
        } catch (error: any) {
            console.error("Ошибка авторизации:", error);
            const errorMessage = error.response?.data?.error || error.message || "Ошибка входа";
            setError(errorMessage);
            setPassword("");
            setConfirmPassword("");
            if (isFirst) setStep(1);
        } finally {
            setLoading(false);
        }
    };

    if (isFirst === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-primary/80">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20 text-white">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                                <img src="/boxes.png" className="w-8 h-8 brightness-0 invert" alt="Logo" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Material House</h1>
                                <p className="text-white/70 text-sm">Система складского учёта</p>
                            </div>
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">{isFirst ? "Добро пожаловать в Material House" : "Управляйте складом эффективно"}</h2>
                        <p className="text-white/80 text-lg mb-10 leading-relaxed">
                            {isFirst
                                ? "Настройте систему за пару минут. Создайте учётную запись администратора и начните работу."
                                : "Отслеживайте движение материалов, создавайте заявки, проводите инвентаризации и формируйте отчёты."}
                        </p>

                        <div className="space-y-4 mb-10">
                            {[
                                { icon: Package, text: "Управление материалами и категориями" },
                                { icon: BarChart3, text: "Отчёты и аналитика в реальном времени" },
                                { icon: Users, text: "Разграничение прав доступа" },
                                { icon: Shield, text: "Резервное копирование базы данных" },
                            ].map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-white/90 text-sm">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <p className="text-white/40 text-xs">Версия 1.0 • 2026</p>
                    </motion.div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {isFirst ? <Shield className="w-8 h-8 text-primary" /> : <img src="/boxes.png" className="w-8 h-8 icon" alt="Logo" />}
                        </div>
                        <h1 className="text-2xl font-bold">Material House</h1>
                    </div>

                    <div className="rounded-2xl border bg-card shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{isFirst ? (step === 1 ? "Создание администратора" : "Проверьте данные") : "Вход в систему"}</h2>
                            <p className="text-muted-foreground text-sm mt-2">{isFirst ? (step === 1 ? "Шаг 1 из 2: Учётные данные" : "Шаг 2 из 2: Подтверждение") : "Войдите в свою учётную запись"}</p>
                        </div>

                        {isFirst && (
                            <div className="flex justify-center gap-2 mb-6">
                                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "w-8 bg-primary" : "w-4 bg-primary/30"}`} />
                                <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "w-8 bg-primary" : "w-4 bg-primary/30"}`} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {(step === 1 || !isFirst) && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Логин</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder={isFirst ? "Придумайте логин" : "Введите ваш логин"}
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    disabled={loading}
                                                    autoFocus
                                                    required
                                                />
                                                {!isFirst && localStorage.getItem("rememberedUsername") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            localStorage.removeItem("rememberedUsername");
                                                            setUsername("");
                                                            setRememberMe(false);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-destructive transition-colors p-1"
                                                        title="Забыть сохранённый логин"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            {isFirst && <p className="text-xs text-muted-foreground mt-1.5">Минимум 5 символов, латинские буквы и цифры</p>}
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-1.5 block">Пароль</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={isFirst ? "Придумайте пароль" : "Введите ваш пароль"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 transition-all"
                                                    disabled={loading}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {isFirst && <p className="text-xs text-muted-foreground mt-1.5">Минимум 6 символов</p>}
                                        </div>

                                        {isFirst && (
                                            <div>
                                                <label className="text-sm font-medium mb-1.5 block">Подтвердите пароль</label>
                                                <input
                                                    type="password"
                                                    placeholder="Повторите пароль"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    disabled={loading}
                                                    required
                                                />
                                            </div>
                                        )}

                                        {!isFirst && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="rememberMe"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="rounded border-input w-4 h-4 accent-primary cursor-pointer"
                                                />
                                                <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer select-none">
                                                    Запомнить меня
                                                </label>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {isFirst && step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                                            <h3 className="font-medium">Данные администратора:</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="text-muted-foreground">Логин:</div>
                                                <div className="font-medium text-right">{username}</div>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-600 text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Данные для входа проверены</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Это будет администратор системы с полным доступом. Вы сможете создать других пользователей позже.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-3 pt-2">
                                {isFirst && step === 2 && (
                                    <button type="button" onClick={() => setStep(1)} disabled={loading} className="px-6 py-3 rounded-xl border font-medium hover:bg-accent transition-colors disabled:opacity-50">
                                        Назад
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                                >
                                    {loading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                        />
                                    ) : isFirst ? (
                                        step === 1 ? (
                                            <>
                                                Далее <ArrowRight className="h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-4 w-4" /> Создать администратора
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4" /> Войти
                                        </>
                                    )}
                                </button>
                                <DarkModeButtonToggle />
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">{isFirst ? "При создании учётной записи вы принимаете условия использования" : "Защищённый вход в систему управления складом"}</p>
                </motion.div>
            </div>
        </div>
    );
}
