import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Link } from "react-router-dom";
import { BookOpen, Package, BarChart3, UserCog, ArrowRight, ClipboardList, FileText, Users, Database, Bell, CheckCircle, PlusCircle, Search } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";

const RevealBlock = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: "easeOut" }} className={className}>
            {children}
        </motion.div>
    );
};

export default function Main() {
    const { user, isAdmin } = useUser();

    const roleName = useMemo(() => {
        if (user?.role === "admin") return "Администратор";
        if (user?.role === "accountant") return "Бухгалтер";
        if (user?.role === "storekeeper") return "Кладовщик";
        return "";
    }, [user]);

    return (
        <div className="space-y-8 pb-8">
            <ScrollToTop />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-background p-8 border"
            >
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Добро пожаловать, {user?.name} {user?.secondname}
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">{roleName}</p>
                    <p className="mt-4 text-sm text-muted-foreground max-w-xl">
                        Material House — система управления складскими запасами. Выберите интересующий раздел ниже, чтобы изучить возможности.
                    </p>
                </div>
            </motion.div>

            <RevealBlock>
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">О программе</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-medium mb-2">Основные возможности</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Управление материалами и категориями</li>
                                <li>• Заявки на приход и расход</li>
                                <li>• Инвентаризации</li>
                                <li>• Отчёты и аналитика</li>
                                <li>• Журнал действий</li>
                                <li>• Резервное копирование</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Для кого</h3>
                            <p className="text-sm text-muted-foreground">Система рассчитана на три роли: администратор, бухгалтер и кладовщик. Каждая роль имеет свой набор инструментов.</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                
                            </div>
                        </div>
                        <div className="grid w-fit h-fit space-y-2">
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    <UserCog className="h-3 w-3" /> Админ
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                    <BarChart3 className="h-3 w-3" /> Бухгалтер
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full">
                                    <Package className="h-3 w-3" /> Кладовщик
                                </span>
                        </div>
                        {/* <div>
                            <h3 className="font-medium mb-2">Быстрый старт</h3>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/materials">
                                        <Package className="h-4 w-4 mr-2" /> Материалы
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/requests">
                                        <ClipboardList className="h-4 w-4 mr-2" /> Заявки
                                    </Link>
                                </Button>
                                {isAdmin && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to="/allusers">
                                            <Users className="h-4 w-4 mr-2" /> Пользователи
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div> */}
                    </div>
                </div>
            </RevealBlock>

            {(user?.role === "storekeeper" || isAdmin) && (
                <RevealBlock>
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Инструкция для кладовщика</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <PlusCircle className="h-4 w-4 text-primary" /> Создание заявки
                                </h3>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                    <li>Перейдите в раздел «Заявки»</li>
                                    <li>Нажмите «Создать»</li>
                                    <li>Выберите тип заявки и товары</li>
                                    <li>Укажите количество</li>
                                    <li>Сохраните заявку</li>
                                </ol>
                            </div>
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <Search className="h-4 w-4 text-primary" /> Просмотр остатков
                                </h3>
                                <p className="text-sm text-muted-foreground">Раздел «Материалы» показывает актуальные остатки с поиском и фильтрами.</p>
                            </div>
                            <div className="sm:col-span-2">
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <ClipboardList className="h-4 w-4 text-primary" /> Инвентаризация
                                </h3>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                    <li>Откройте раздел «Инвентаризация»</li>
                                    <li>Выберите назначенную вам инвентаризацию</li>
                                    <li>Нажмите «Начать» и вносите фактические остатки</li>
                                    <li>Сохраняйте результаты и завершите инвентаризацию</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </RevealBlock>
            )}

            {(user?.role === "accountant" || isAdmin) && (
                <RevealBlock>
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Инструкция для бухгалтера</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-primary" /> Подтверждение заявок
                                </h3>
                                <p className="text-sm text-muted-foreground">В разделе «Заявки» вы можете подтверждать (товары спишутся/поступят) или отклонять заявки с указанием причины.</p>
                            </div>
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-primary" /> Отчёты
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Раздел «Отчёты» — движение материалов, заявки, ОСВ, активность пользователей. Все отчёты можно экспортировать в Excel/PDF.
                                </p>
                            </div>
                        </div>
                    </div>
                </RevealBlock>
            )}

            {isAdmin && (
                <RevealBlock>
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCog className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold">Инструкция для администратора</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-primary" /> Управление пользователями
                                </h3>
                                <p className="text-sm text-muted-foreground">Создание, редактирование, удаление пользователей и смена ролей в разделе «Пользователи».</p>
                            </div>
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <Database className="h-4 w-4 text-primary" /> Бэкапы
                                </h3>
                                <p className="text-sm text-muted-foreground">Создание и скачивание резервных копий базы данных в разделе «Бэкапы».</p>
                            </div>
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <Bell className="h-4 w-4 text-primary" /> Журнал
                                </h3>
                                <p className="text-sm text-muted-foreground">Просмотр всех действий пользователей с фильтрацией в разделе «Журнал».</p>
                            </div>
                            <div>
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-primary" /> Полный контроль
                                </h3>
                                <p className="text-sm text-muted-foreground">Редактирование материалов, категорий, инвентаризаций и приватных заявок.</p>
                            </div>
                        </div>
                    </div>
                </RevealBlock>
            )}
        </div>
    );
}
