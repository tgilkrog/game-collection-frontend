import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from '../types/user';
import { getCsrfCookie, logoutApi } from '../api/auth';
import { getUser } from '../api/users';

type AuthContextType = {
    user: User | null;
    loading: boolean;
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

    const [loading, setLoading] = useState(() => !!user);

    // Ensure CSRF cookie is set on every app load
    useEffect(() => {
        getCsrfCookie();

        // localStorage only persists {id, name} (see loginUser below), so a page
        // refresh rehydrates a user missing avatar/banner/is_admin/rank/etc. Re-fetch
        // the full profile once on mount to restore it. `loading` lets consumers (e.g.
        // an admin route guard) wait for this before making decisions off `user`.
        if (user) {
            getUser(user.name)
                .then(res => setUser(res.data))
                .catch(() => { /* stale/expired session; leave as-is until an authed call 401s */ })
                .finally(() => setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                loading,
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
