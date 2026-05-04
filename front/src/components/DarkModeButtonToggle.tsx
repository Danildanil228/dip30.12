import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { Moon, Sun, Monitor } from "lucide-react";

export default function DarkModeButtonToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    const getIcon = () => {
        if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />;
        if (theme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />;
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    };

    const getTitle = () => {
        if (theme === "light") return "Светлая тема";
        if (theme === "dark") return "Тёмная тема";
        return "Системная тема";
    };

    return (
        <Button type="button" variant="outline" size="icon" onClick={toggleTheme} title={getTitle()}>
            {getIcon()}
            <span className="sr-only">{getTitle()}</span>
        </Button>
    );
}
