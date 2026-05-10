import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="text-center max-w-md">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-8xl font-bold text-primary/20 mb-4 select-none">
                    404
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Страница не найдена</h1>
                <p className="text-muted-foreground mb-8">Кажется, вы заблудились. Страница, которую вы ищете, не существует или была перемещена.</p>

                <div className="mb-8 flex justify-center">
                    <img src="/404.png" className="icon w-48 max-w-full opacity-80" alt="Страница не найдена" />
                </div>

                <Button asChild size="lg" className="gap-2">
                    <Link to="/main">
                        <Home className="h-5 w-5" />
                        На главную страницу
                    </Link>
                </Button>
            </motion.div>
        </div>
    );
}
