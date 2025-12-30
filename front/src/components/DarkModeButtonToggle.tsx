import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { Moon, Sun } from "lucide-react"

export default function DarkModeButtonToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Переключить на светлую тему" : "Переключить на темную тему"}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">
                {theme === "dark" ? "Переключить на светлую тему" : "Переключить на темную тему"}
            </span>
        </Button>
    )
}