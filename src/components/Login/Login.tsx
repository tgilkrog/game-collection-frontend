import { useState } from "react";
import Popup from "../Popup/Popup";
import styles from './Login.module.css';

export default function Login() {
    const [open, setOpen] = useState(false);

    return (
        <>
        <div className={styles.menuWrapper}>
            <button 
                className={styles.login} 
                onClick={() => setOpen(true)}
            >
                Login
            </button>
        </div>

        <Popup open={open} onClose={() => setOpen(false)}>
            <div className={styles.title}>
            SYSTEM // LOGIN
            </div>

            <input className={styles.login_input} type="text" placeholder="Username" />
            <input className={styles.login_input} type="password" placeholder="Password" />

            <button 
                className={styles.close} 
                onClick={() => setOpen(false)}
            >
                SUBMIT
            </button>
        </Popup>
    </>
    );
}