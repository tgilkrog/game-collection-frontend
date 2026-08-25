import { useState } from "react";
import Popup from "../Popup/Popup";
import styles from './Login.module.css';
import { useAuth } from "../../Context/AuthContext";
import { login, register } from "../../api/login";
import { requestPasswordReset } from "../../api/passwordReset";
import { useToast } from "../Toast/ToastProvider";

type Mode = 'login' | 'register' | 'forgot';

export default function Login() {
    const { loginUser, user } = useAuth();
    const { showToast } = useToast();
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
            } else if (mode === 'register') {
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    return;
                }
                const res = await register(name, email, password, confirmPassword);
                loginUser(res.user);
            } else {
                // Always show the same confirmation, whether or not the email matched an
                // account, so this can't be used to check which emails are registered.
                await requestPasswordReset(email);
                showToast({ message: "If that email is registered, a reset link has been sent.", variant: 'success' });
                setMode('login');
                return;
            }

            setOpen(false);
        } catch {
            setError(mode === 'login'
                ? "Invalid email or password"
                : mode === 'register'
                ? "Registration failed. Check your details."
                : "Something went wrong. Please try again.");
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
                    {mode === 'login' && 'SYSTEM // LOGIN'}
                    {mode === 'register' && 'SYSTEM // REGISTER'}
                    {mode === 'forgot' && 'SYSTEM // RESET PASSWORD'}
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

                {mode !== 'forgot' && (
                    <div className={styles.field}>
                        <label className={styles.label}>PASSWORD</label>
                        <input
                            className={styles.login_input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}

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

                {mode === 'login' && (
                    <button
                        type="button"
                        className={styles.switch_link}
                        onClick={() => { setMode('forgot'); setError(""); }}
                    >
                        // FORGOT PASSWORD?
                    </button>
                )}

                <button className={styles.close} onClick={handleSubmit} disabled={loading}>
                    {loading
                        ? (mode === 'login' ? "LOGGING IN..." : mode === 'register' ? "REGISTERING..." : "SENDING...")
                        : mode === 'forgot' ? "SEND RESET LINK" : "SUBMIT"}
                </button>

                {mode === 'forgot' ? (
                    <button
                        type="button"
                        className={styles.switch_link}
                        onClick={() => { setMode('login'); setError(""); }}
                    >
                        // BACK TO LOGIN
                    </button>
                ) : (
                    <button className={styles.switch_link} onClick={switchMode}>
                        {mode === 'login'
                            ? '// NO ACCOUNT? REGISTER'
                            : '// HAVE AN ACCOUNT? LOGIN'}
                    </button>
                )}
            </Popup>
        </>
    );
}
