import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types/user.types";

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(() => {
        const userData = sessionStorage.getItem("user");
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error("Ошибка при парсинге user из sessionStorage:", error);
            }
        }
        setLoading(false);
    }, []);

    const updateCurrentUser = useCallback(
        (updatedUser: Partial<User>) => {
            if (user) {
                const newUser = { ...user, ...updatedUser };
                sessionStorage.setItem("user", JSON.stringify(newUser));
                setUser(newUser);
                window.dispatchEvent(new Event("profile-updated"));
            }
        },
        [user]
    );

    useEffect(() => {
        loadUser();
        const handleProfileUpdate = () => {
            loadUser();
        };

        window.addEventListener("profile-updated", handleProfileUpdate);
        return () => {
            window.removeEventListener("profile-updated", handleProfileUpdate);
        };
    }, [loadUser]);

    const isAdmin = user?.role === "admin";
    const isAccountant = user?.role === "accountant";
    const isStorekeeper = user?.role === "storekeeper";

    return {
        user,
        loading,
        isAdmin,
        isAccountant,
        isStorekeeper,
        updateCurrentUser,
        loadUser
    };
};
