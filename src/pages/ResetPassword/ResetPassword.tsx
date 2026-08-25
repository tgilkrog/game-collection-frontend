import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageTransition } from "../../components/PageTransition";
import { resetPassword } from "../../api/passwordReset";
import { useToast } from "../../components/Toast/ToastProvider";
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const token = searchParams.get('token') ?? '';
    const email = searchParams.get('email') ?? '';

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit() {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await resetPassword(token, email, password, confirmPassword);
            showToast({ message: "Password reset. Please log in.", variant: 'success' });
            navigate('/');
        } catch (err) {
            const message = (err as { response?: { data?: { message?: string } } })
                .response?.data?.message;
            setError(message ?? "This reset link is invalid or has expired.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <PageTransition>
            <div className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.title}>SYSTEM // NEW PASSWORD</div>

                    {!token || !email ? (
                        <div className={styles.error}>This reset link is missing required information.</div>
                    ) : (
                        <>
                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.field}>
                                <label className={styles.label}>NEW PASSWORD</label>
                                <input
                                    className={styles.input}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>CONFIRM PASSWORD</label>
                                <input
                                    className={styles.input}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button className={styles.submit} onClick={handleSubmit} disabled={loading}>
                                {loading ? "RESETTING..." : "RESET PASSWORD"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
