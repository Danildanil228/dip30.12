import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Mail, Phone, MapPin, Github } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { versionService } from "@/services/versionService";

export default function Footer() {
    const { user } = useUser();
    const isAdmin = user?.role === "admin";
    const [currentVersion, setCurrentVersion] = useState("1.0.0");
    useEffect(() => {
        versionService
            .getVersions()
            .then((data) => setCurrentVersion(data.currentVersion))
            .catch((err) => console.error(err));
    }, []);

    const currentYear = new Date().getFullYear();

    const navigationLinks = [
        { label: "Главная", path: "/main" },
        { label: "Материалы", path: "/materials" },
        { label: "Категории", path: "/category" },
        { label: "Заявки", path: "/requests" },
        { label: "Инвентаризация", path: "/inventories" },
        { label: "Дашборд", path: "/dashboard" },
        {label:"Версии",path:"/versions"}
    ];

    const adminLinks = [
        { label: "Пользователи", path: "/allusers" },
        { label: "Бэкапы", path: "/backups" },
        { label: "Журнал", path: "/notifications" },
        { label: "Корзина", path: "/trash" },
    ];

    const contactInfo = [
        { icon: Phone, text: "+7 (911) 857-35-84", href: "tel:+79118573584" },
        { icon: Mail, text: "d_silchenkov@mail.ru", href: "mailto:d_silchenkov@mail.ru" },
        { icon: MapPin, text: "г. Калининград", href: "#" },
    ];

    return (
        <footer className="mt-12">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="container backdrop-blur-lg bg-background/70 border border-border/40 rounded-t-2xl shadow-sm sm:pb-0! pb-10!"
            >
                <div className="py-8 px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">Material House</h3>
                                    <p className="text-xs text-muted-foreground">Складской учёт</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">Профессиональное решение для управления складскими запасами, проведения инвентаризаций и формирования отчётности.</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Навигация</h4>
                            <ul className="sm:grid-cols-2 sm:grid">
                                {navigationLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Возможности</h4>
                            <ul className="sm:grid sm:grid-cols-2">
                                {user?.role !== "storekeeper" && (
                                    <li>
                                        <Link to="/reports" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            Отчёты
                                        </Link>
                                    </li>
                                )}
                                {isAdmin &&
                                    adminLinks.map((link) => (
                                        <li key={link.path}>
                                            <Link to={link.path} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                <li>
                                    <Link to="/profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        Профиль
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Контакты</h4>
                            <ul className="space-y-1">
                                {contactInfo.map((item) => (
                                    <li key={item.text}>
                                        <a href={item.href} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            <item.icon className="h-3 w-3 shrink-0" />
                                            <span>{item.text}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-1">
                                <a
                                    href="https://github.com/danildanil228"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Github className="h-3 w-3" />
                                    <span>Исходный код</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>&copy; {currentYear} Material House.</span>
                            <span>Все права защищены.</span>
                            <Link to="/versions" className="hover:text-foreground transition-colors">
                                v.{currentVersion}
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <a href="/privacy" target="_blank" className="hover:text-foreground transition-colors">
                                Политика конфиденциальности
                            </a>
                            <span className="hidden sm:inline">•</span>
                            <a href="/terms" target="_blank" className="hover:text-foreground transition-colors">
                                Условия использования
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}
