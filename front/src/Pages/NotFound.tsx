import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <section className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Кажется, вы заблудились
                </p>
                <div className="mb-8 flex justify-center">
                    <img 
                        src="/404.png" 
                        className="icon w-64 max-w-full" 
                        alt="Страница не найдена" 
                    />
                </div>
                <Button asChild size="lg">
                    <Link to='/main'>На главную страницу</Link>
                </Button>
            </div>
        </section>
    );
}