import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { ChevronDown, ClipboardList, ChevronUp, BookOpen, UserCog, Package, BarChart3, FileText, Users, Database, PlusCircle, Search, CheckCircle, Edit } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
}

export default function Main() {
    const { user, isAdmin } = useUser();
    const [hideInstructions, setHideInstructions] = useState(false);

    const allSections = useMemo<Section[]>(() => {
        const base: Section[] = [
            { id: "welcome", title: "Добро пожаловать", icon: <BookOpen className="h-4 w-4" />, isOpen: true },
            { id: "overview", title: "О программе", icon: <BookOpen className="h-4 w-4" />, isOpen: false },
            { id: "navigation", title: "Навигация по системе", icon: <BookOpen className="h-4 w-4" />, isOpen: false }
        ];

        if (user?.role === "storekeeper" || isAdmin) {
            base.push({ id: "storekeeper", title: "Инструкция для кладовщика", icon: <Package className="h-4 w-4" />, isOpen: false });
        }
        if (user?.role === "accountant" || isAdmin) {
            base.push({ id: "accountant", title: "Инструкция для бухгалтера", icon: <BarChart3 className="h-4 w-4" />, isOpen: false });
        }
        if (isAdmin) {
            base.push({ id: "admin", title: "Инструкция для администратора", icon: <UserCog className="h-4 w-4" />, isOpen: false });
        }

        return base;
    }, [user, isAdmin]);

    const [sections, setSections] = useState<Section[]>(allSections);

    useEffect(() => {
        setSections(allSections);
    }, [allSections]);

    useEffect(() => {
        const saved = localStorage.getItem("hideInstructions");
        if (saved === "true") {
            setHideInstructions(true);
        }
    }, []);

    const toggleSection = (id: string) => {
        setSections((prev) => prev.map((section) => (section.id === id ? { ...section, isOpen: !section.isOpen } : section)));
    };

    return (
        <div className="space-y-4">
            <ScrollToTop />
            <div className="border rounded-lg p-6">
                <h1 className="text-xl font-semibold mb-1">
                    Добро пожаловать, {user?.name} {user?.secondname}
                </h1>
                <p className="text-lg text-muted-foreground">{user?.role === "admin" ? "Администратор" : user?.role === "accountant" ? "Бухгалтер" : "Кладовщик"}</p>
            </div>

            {sections.map((section) => (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                    <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left">
                        <div className="flex items-center gap-2">
                            {section.icon}
                            <span className="text-lg font-medium">{section.title}</span>
                        </div>
                        {section.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {section.isOpen && (
                        <div className="px-4 pb-4 pt-0 space-y-4">
                            {section.id === "welcome" && (
                                <div className="space-y-3 text-lg text-muted-foreground">
                                    <p>Это система управления складскими запасами. Здесь вы можете управлять материалами, создавать заявки, проводить инвентаризации и формировать отчёты.</p>
                                    <p>Ниже представлены подробные инструкции по работе с системой. Выберите интересующий раздел, чтобы узнать больше.</p>
                                </div>
                            )}

                            {section.id === "overview" && (
                                <div className="space-y-4 text-lg">
                                    <div>
                                        <h3 className="font-medium mb-2">Что такое Material House?</h3>
                                        <p className="text-muted-foreground">
                                            Система учёта материалов на складе, которая позволяет отслеживать движение товаров, создавать заявки на приход и расход, проводить инвентаризации и формировать отчёты.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">Основные возможности</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 list-disc list-inside text-muted-foreground text-sm">
                                            <li>Управление материалами и категориями</li>
                                            <li>Создание заявок на приход и расход</li>
                                            <li>Автоматическое обновление остатков</li>
                                            <li>Проведение инвентаризаций</li>
                                            <li>Формирование отчётов</li>
                                            <li>Автоматическое логирование действий</li>
                                            <li>Резервное копирование базы данных</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">Роли пользователей</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserCog className="h-3 w-3" />
                                                    <span className="text-sm font-medium">Администратор</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground pl-5">Полный контроль: управление пользователями, бэкапы, логи.</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <BarChart3 className="h-3 w-3" />
                                                    <span className="text-sm font-medium">Бухгалтер</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground pl-5">Аналитика: отчёты, подтверждение заявок, инвентаризации.</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Package className="h-3 w-3" />
                                                    <span className="text-sm font-medium">Кладовщик</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground pl-5">Оперативная работа: заявки, инвентаризации, остатки.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {section.id === "navigation" && (
                                <div className="space-y-3 text-lg">
                                    <p className="text-muted-foreground text-sm">В верхнем меню (на компьютере) или нижней панели (на телефоне) расположены разделы системы:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="text-sm">
                                            <div className="font-medium">Материалы</div>
                                            <div className="text-muted-foreground">Просмотр и управление товарами</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">Категории</div>
                                            <div className="text-muted-foreground">Группировка материалов</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">Заявки</div>
                                            <div className="text-muted-foreground">Приход/расход товаров</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">Инвентаризация</div>
                                            <div className="text-muted-foreground">Проверка склада</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">Дашборд</div>
                                            <div className="text-muted-foreground">Графики и метрики</div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">Отчёты</div>
                                            <div className="text-muted-foreground">Аналитика и экспорт</div>
                                        </div>
                                        {isAdmin && (
                                            <>
                                                <div className="text-sm">
                                                    <div className="font-medium">Все пользователи</div>
                                                    <div className="text-muted-foreground">Управление учётными записями</div>
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-medium">Бэкапы</div>
                                                    <div className="text-muted-foreground">Резервное копирование</div>
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-medium">Журнал</div>
                                                    <div className="text-muted-foreground">Логи действий</div>
                                                </div>
                                            </>
                                        )}
                                        <div className="text-sm">
                                            <div className="font-medium">Профиль</div>
                                            <div className="text-muted-foreground">Личные данные</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {section.id === "storekeeper" && (
                                <div className="space-y-4 text-lg">
                                    <div className="border-l-2 pl-3">
                                        <p className="text-sm text-muted-foreground">Как кладовщик, вы отвечаете за оперативную работу со складом.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <PlusCircle className="h-3 w-3" />
                                            Создание заявки
                                        </h3>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>Перейдите в раздел «Заявки»</li>
                                            <li>Нажмите кнопку «Создать»</li>
                                            <li>Выберите тип: Приход (поступление) или Расход (отгрузка)</li>
                                            <li>Укажите название и выберите товары</li>
                                            <li>Укажите количество для каждого товара</li>
                                            <li>Нажмите «Создать заявку»</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2">Статусы заявок</h3>
                                        <ul className="space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>• На рассмотрении — ожидает подтверждения</li>
                                            <li>• Подтверждена — одобрена, остатки обновлены</li>
                                            <li>• Отклонена — отказано, указана причина</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <ClipboardList className="h-3 w-3" />
                                            Проведение инвентаризации
                                        </h3>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>Перейдите в раздел «Инвентаризация»</li>
                                            <li>Выберете инвентаризацию</li>
                                            <li>Нажмите «Начать»</li>
                                            <li>Введите фактическое количество для каждого товара</li>
                                            <li>При расхождениях укажите причину</li>
                                            <li>Сохраняйте результаты (черновик)</li>
                                            <li>По окончании нажмите «Завершить»</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <Search className="h-3 w-3" />
                                            Просмотр остатков
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Раздел «Материалы» — полный список товаров с текущим количеством, поиском и фильтрацией по категориям.</p>
                                    </div>
                                </div>
                            )}

                            {section.id === "accountant" && (
                                <div className="space-y-4 text-lg">
                                    <div className="border-l-2 pl-3">
                                        <p className="text-sm text-muted-foreground">Как бухгалтер, вы контролируете движение товаров и формируете отчётность.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Подтверждение заявок
                                        </h3>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>Раздел «Заявки» → фильтр «На рассмотрении»</li>
                                            <li>Откройте заявку, проверьте товары и количество</li>
                                            <li>Нажмите «Подтвердить» (остатки обновятся автоматически)</li>
                                            <li>Или «Отклонить» (обязательно укажите причину)</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Формирование отчётов
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-1">Раздел «Отчёты» — доступны 4 типа:</p>
                                        <ul className="space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>• Движение материалов — все операции за период</li>
                                            <li>• Заявки — список с фильтрацией по статусу</li>
                                            <li>• Оборотно-сальдовая ведомость — остатки и движение</li>
                                            <li>• Активность пользователей — статистика по каждому</li>
                                        </ul>
                                        <p className="text-sm text-muted-foreground mt-1">Все отчёты можно экспортировать в Excel, CSV и PDF.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <ClipboardList className="h-3 w-3" />
                                            Проверка инвентаризаций
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            После завершения инвентаризации кладовщиком, она появляется в списке со статусом «Завершена, ожидает проверки». Откройте, проверьте расхождения и подтвердите (остатки обновятся) или отмените.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <BarChart3 className="h-3 w-3" />
                                            Дашборд
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Раздел «Дашборд» — ключевые метрики, график движения товаров и статусы заявок/инвентаризаций за выбранный период.</p>
                                    </div>
                                </div>
                            )}

                            {section.id === "admin" && (
                                <div className="space-y-4 text-lg">
                                    <div className="border-l-2 pl-3">
                                        <p className="text-sm text-muted-foreground">Как администратор, вы имеете полный доступ ко всем функциям системы.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Управление пользователями
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-1">Раздел «Все пользователи»:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>Создание, редактирование, удаление пользователей</li>
                                            <li>Изменение ролей (админ, бухгалтер, кладовщик)</li>
                                            <li>Сброс паролей</li>
                                            <li>Массовое удаление через чекбоксы</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <Database className="h-3 w-3" />
                                            Резервное копирование
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-1">Раздел «Бэкапы»:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>Создание бэкапов с описанием</li>
                                            <li>Скачивание бэкапов на компьютер</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <Edit className="h-3 w-3" />
                                            Управление категориями и материалами
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Только администратор может создавать, редактировать и удалять категории. При удалении категории с материалами или материала с ненулевым остатком система заблокирует удаление.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Просмотр журнала
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Раздел «Журнал» — все действия пользователей с фильтрацией по типу события.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-2">Дополнительные возможности</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                            <li>Редактирование любых инвентаризаций (название, даты, ответственный)</li>
                                            <li>Отмена активных инвентаризаций</li>
                                            <li>Создание приватных заявок (видны только создателю и админам)</li>
                                            <li>Мгновенное подтверждение заявок при создании</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
