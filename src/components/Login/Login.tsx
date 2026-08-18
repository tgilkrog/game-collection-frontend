import { useState } from "react";
import Popup from "../Popup/Popup";
import styles from './Login.module.css';
import { useAuth } from "../../Context/AuthContext";
import { login, register } from "../../api/login";

type Mode = 'login' | 'register';

export default function Login() {
    const { loginUser, user } = useAuth();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>('login');

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function openAs(m: Mode) {
        setMode(m);
        setError("");
        setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
        setOpen(true);
    }

    function switchMode() {
        setMode(m => m === 'login' ? 'register' : 'login');
        setError("");
    }

    async function handleSubmit() {
        try {
            setLoading(true);
            setError("");

            if (mode === 'login') {
                const res = await login(email, password);
                loginUser(res.user);
            } else {
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    return;
                }
                const res = await register(name, email, password, confirmPassword);
                loginUser(res.user);
            }

            setOpen(false);
        } catch {
            setError(mode === 'login'
                ? "Invalid email or password"
                : "Registration failed. Check your details.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {!user && (
                <div className={styles.menuWrapper}>
                    <button className={styles.login} onClick={() => openAs('login')}>
                        Login
                    </button>
                </div>
            )}

            <Popup open={open} onClose={() => setOpen(false)}>
                <div className={styles.title}>
                    {mode === 'login' ? 'SYSTEM // LOGIN' : 'SYSTEM // REGISTER'}
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {mode === 'register' && (
                    <div className={styles.field}>
                        <label className={styles.label}>USERNAME</label>
                        <input
                            className={styles.login_input}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>EMAIL</label>
                    <input
                        className={styles.login_input}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>PASSWORD</label>
                    <input
                        className={styles.login_input}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {mode === 'register' && (
                    <div className={styles.field}>
                        <label className={styles.label}>CONFIRM PASSWORD</label>
                        <input
                            className={styles.login_input}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                )}

                <button className={styles.close} onClick={handleSubmit} disabled={loading}>
                    {loading
                        ? (mode === 'login' ? "LOGGING IN..." : "REGISTERING...")
                        : "SUBMIT"}
                </button>

                <button className={styles.switch_link} onClick={switchMode}>
                    {mode === 'login'
                        ? '// NO ACCOUNT? REGISTER'
                        : '// HAVE AN ACCOUNT? LOGIN'}
                </button>
            </Popup>
        </>
    );
}
