import { useState } from "react";
import Popup from "../Popup/Popup";
import styles from './Login.module.css';
import { useAuth } from "../../Context/AuthContext";

import { login} from "../../api/login";

export default function Login() {
    const { loginUser, logoutUser } = useAuth();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin() {
        try {
            setLoading(true);
            setError("");

            const response = await login(email, password);
            loginUser(response.user, response.token);

            setOpen(false);
        } catch (err) {
            console.error(err);

            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={styles.menuWrapper}>
                {!user ? (
                    <button 
                        className={styles.login} 
                        onClick={() => setOpen(true)}
                    >
                        Login
                    </button>    
                ) : (
                    <button
                        className={styles.login}
                        onClick={() => logoutUser()}
                    >
                        Terminate User
                    </button>
                )}
                
                 
            </div>

            <Popup open={open} onClose={() => setOpen(false)}>
                <div className={styles.title}>
                    SYSTEM // LOGIN
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <input 
                    className={styles.login_input} 
                    type="text" 
                    placeholder="Username"
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

                <button 
                    className={styles.close} 
                    onClick={() => handleLogin()}
                >
                    {loading ? "LOGGING IN..." : "SUBMIT"}
                </button>
            </Popup>
        </>
    );
}