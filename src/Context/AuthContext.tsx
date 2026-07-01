import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from '../types/user';
import { getCsrfCookie, logoutApi } from '../api/auth';

type AuthContextType = {
    user: User | null;
    loginUser: (user: User) => void;
    logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    // Ensure CSRF cookie is set on every app load
    useEffect(() => { getCsrfCookie(); }, []);

    function loginUser(user: User) {
        localStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name }));
        setUser(user);
    }

    async function logoutUser() {
        try { await logoutApi(); } catch { /* session may already be gone */ }
        localStorage.removeItem("user");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
