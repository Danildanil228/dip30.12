import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { versionService, type VersionEntry } from "@/services/versionService";

import {
    Bug,
    FileText,
    Zap,
    Palette,
    Shield,
    Hammer,
    Trash2,
    Settings,
    Globe,
    Package as PackageIcon,
    TestTube,
    BarChart,
    Plug,
    Smartphone,
    Accessibility,
    Database,
    ArrowRightLeft,
    Rocket,
    ArrowLeft,
    Tag,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
const ITEMS_PER_PAGE = 10;

const CATEGORY_CONFIG: Record<string, { title: string; icon: React.ReactNode }> = {
    "ИСПРАВЛЕНИЯ БАГОВ:": { title: "Исправления багов", icon: <Bug className="h-4 w-4" /> },
    "НОВЫЙ ФУНКЦИОНАЛ:": { title: "Новый функционал", icon: <Rocket className="h-4 w-4" /> },
    "ДОКУМЕНТАЦИЯ:": { title: "Документация", icon: <FileText className="h-4 w-4" /> },
    "УЛУЧШЕНИЯ ПРОИЗВОДИТЕЛЬНОСТИ:": { title: "Улучшения производительности", icon: <Zap className="h-4 w-4" /> },
    "UI/UX УЛУЧШЕНИЯ:": { title: "UI/UX улучшения", icon: <Palette className="h-4 w-4" /> },
    "БЕЗОПАСНОСТЬ:": { title: "Безопасность", icon: <Shield className="h-4 w-4" /> },
    "РЕФАКТОРИНГ:": { title: "Рефакторинг", icon: <Hammer className="h-4 w-4" /> },
    "УДАЛЕНИЕ УСТАРЕВШЕГО:": { title: "Удаление устаревшего", icon: <Trash2 className="h-4 w-4" /> },
    "ИНФРАСТРУКТУРА:": { title: "Инфраструктура", icon: <Settings className="h-4 w-4" /> },
    "ЛОКАЛИЗАЦИЯ:": { title: "Локализация", icon: <Globe className="h-4 w-4" /> },
    "ЗАВИСИМОСТИ:": { title: "Зависимости", icon: <PackageIcon className="h-4 w-4" /> },
    "ТЕСТИРОВАНИЕ:": { title: "Тестирование", icon: <TestTube className="h-4 w-4" /> },
    "АНАЛИТИКА:": { title: "Аналитика", icon: <BarChart className="h-4 w-4" /> },
    "ИНТЕГРАЦИЯ:": { title: "Интеграция", icon: <Plug className="h-4 w-4" /> },
    "МОБИЛЬНАЯ ВЕРСИЯ:": { title: "Мобильная версия", icon: <Smartphone className="h-4 w-4" /> },
    "ДОСТУПНОСТЬ:": { title: "Доступность", icon: <Accessibility className="h-4 w-4" /> },
    "БАЗА ДАННЫХ:": { title: "База данных", icon: <Database className="h-4 w-4" /> },
    "МИГРАЦИЯ ДАННЫХ:": { title: "Миграция данных", icon: <ArrowRightLeft className="h-4 w-4" /> },
};

export default function Versions() {
    const [versions, setVersions] = useState<VersionEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        versionService
            .getVersions()
            .then((data) => {
                console.log("Полученные версии:", data);
                setVersions(data.versions);
            })
            .catch((err) => console.error("Ошибка загрузки версий:", err))
            .finally(() => setLoading(false));
    }, []);

    const groupChanges = (changes: string[]) => {
        const groups: { title: string; icon: React.ReactNode; items: string[] }[] = [];
        let currentGroup: { title: string; icon: React.ReactNode; items: string[] } | null = null;

        for (const change of changes) {
            if (CATEGORY_CONFIG[change]) {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = {
                    title: CATEGORY_CONFIG[change].title,
                    icon: CATEGORY_CONFIG[change].icon,
                    items: [],
                };
            } else if (currentGroup && change.trim() !== "") {
                currentGroup.items.push(change);
            } else if (!currentGroup && change.trim() !== "") {
                groups.push({
                    title: "Прочее",
                    icon: <FileText className="h-4 w-4" />,
                    items: [change],
                });
                currentGroup = null;
            }
        }

        if (currentGroup) {
            groups.push(currentGroup);
        }

        return groups;
    };

    const totalPages = Math.ceil(versions.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const paginatedVersions = versions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-6">
            <ScrollToTop />

            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
            </Button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">История версий</h1>
                    <p className="text-muted-foreground text-sm mt-1">Всего версий: {versions.length}</p>
                </div>

                {versions.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <p className="text-muted-foreground">Нет записей о версиях.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                {paginatedVersions.map((v, idx) => {
                                    const groups = groupChanges(v.changes);
                                    return (
                                        <motion.div key={v.version} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                                            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3 border-b">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Tag className="h-4 w-4 text-primary" />
                                                            <CardTitle className="text-lg">Версия {v.version}</CardTitle>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span className="text-sm">{v.date}</span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-4">
                                                    <div className="space-y-4">
                                                        {groups.map((group, groupIdx) => (
                                                            <div key={groupIdx}>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {group.icon}
                                                                    <h3 className="font-semibold text-sm text-foreground/80">{group.title}</h3>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {group.items.length}
                                                                    </Badge>
                                                                </div>
                                                                <ul className="list-disc list-inside space-y-1.5 pl-1">
                                                                    {group.items.map((item, itemIdx) => (
                                                                        <li key={itemIdx} className="text-sm text-muted-foreground wrap-break-words whitespace-pre-wrap">
                                                                            {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                {groupIdx !== groups.length - 1 && <div className="my-3 border-t border-border/50" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Страница {currentPage + 1} из {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 0} className="gap-1">
                                        <ChevronLeft className="h-4 w-4" />
                                        Назад
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="gap-1">
                                        Вперёд
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
}
