import { useUser } from "@/hooks/useUser";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Home, Package, ClipboardList, Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Отслеживаем направление скролла
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;
    setLastScrollY(latest);
    if (latest > previous && latest > 100) {
      setHidden(true); // скроллим вниз
    } else if (latest < previous) {
      setHidden(false); // скроллим вверх
    }
  });

  const items = [
    { path: "/main", label: "Главная", icon: Home, adminOnly: false },
    { path: "/materials", label: "Материалы", icon: Package, adminOnly: false, hasDrop: true },
    { path: "/requests", label: "Заявки", icon: ClipboardList, adminOnly: false },
    { path: "/notifications", label: "Журнал", icon: Bell, adminOnly: true },
  ];

  const materialItems = [
    { path: "/materials", label: "Материалы" },
    { path: "/category", label: "Категории" },
  ];

  const visible = items.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (path: string) => {
    if (path === "/main") return location.pathname === "/" || location.pathname === "/main";
    if (path === "/materials") return location.pathname.startsWith("/materials") || location.pathname.startsWith("/category");
    return location.pathname === path;
  };

  return (
    <motion.nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-t border-border/40 safe-area-bottom"
      variants={{
        visible: { y: 0 },
        hidden: { y: "100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex justify-around items-center py-2">
        {visible.map((item) => {
          const active = isActive(item.path);

          if (item.hasDrop && item.path === "/materials") {
            return (
              <DropdownMenu key={item.path}>
                <DropdownMenuTrigger className="flex flex-col items-center justify-center py-1 px-2 flex-1 min-w-0 relative">
                  <item.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs mt-1 ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="mobile-tab-indicator"
                      className="absolute -top-1 w-8 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="center">
                  {materialItems.map((mi) => (
                    <DropdownMenuItem key={mi.path} onClick={() => navigate(mi.path)}>
                      {mi.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center py-1 px-2 flex-1 min-w-0 relative"
            >
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs mt-1 ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-1 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}