import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { versionService, type VersionEntry } from "@/services/versionService";

const ITEMS_PER_PAGE = 10;

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
                                {paginatedVersions.map((v, idx) => (
                                    <motion.div key={v.version} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
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
                                            <CardContent className="pt-0">
                                                <div className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                                                    {v.changes.map((change, i) => (
                                                        <p key={i} className="wrap-break-words whitespace-pre-wrap">
                                                            {change}
                                                        </p>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
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
