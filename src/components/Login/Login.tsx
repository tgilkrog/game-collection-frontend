import { useState } from "react";
import Popup from "../Popup/Popup";
import styles from './Login.module.css';
import { useAuth } from "../../Context/AuthContext";
import { login, register } from "../../api/login";

type Mode = 'login' | 'register';

export default function Login() {
    const { loginUser, logoutUser, user } = useAuth();
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
                loginUser(res.user, res.token);
            } else {
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    return;
                }
                const res = await register(name, email, password, confirmPassword);
                loginUser(res.user, res.token);
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
            <div className={styles.menuWrapper}>
                {!user ? (
                    <button className={styles.login} onClick={() => openAs('login')}>
                        Login
                    </button>
                ) : (
                    <button className={styles.login} onClick={() => logoutUser()}>
                        Terminate User
                    </button>
                )}
            </div>

            <Popup open={open} onClose={() => setOpen(false)}>
                <div className={styles.title}>
                    {mode === 'login' ? 'SYSTEM // LOGIN' : 'SYSTEM // REGISTER'}
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {mode === 'register' && (
                    <input
                        className={styles.login_input}
                        type="text"
                        placeholder="Username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <input
                    className={styles.login_input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className={styles.login_input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {mode === 'register' && (
                    <input
                        className={styles.login_input}
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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
