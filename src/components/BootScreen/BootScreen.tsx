import { useEffect, useState } from "react";
import styles from "./BootScreen.module.css";

export function BootScreen({ onFinish }: { onFinish: () => void }) {
    const lines = [
    "[OK] POWER CORE ONLINE",
    "[OK] NETWORK LINK STABLE",
    "[OK] RENDER ENGINE INITIALIZED",
    "[OK] UI SYSTEM READY",
    "ACCESS GRANTED",
    ];

    const [output, setOutput] = useState<string[]>([]);

    useEffect(() => {
        let i = 0;

        const interval = setInterval(() => {
            setOutput((prev) => [...prev, lines[i]]);
            i++;

            if (i >= lines.length) {
                clearInterval(interval);

                setTimeout(() => {
                    onFinish();
                }, 500);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [onFinish]);

    return (
        <div className={styles.boot}>
        <div className={styles.console}>
            {output.map((line, idx) => (
            <div key={idx} className={styles.line}>
                {line}
            </div>
            ))}
            <div className={styles.cursor}>▌</div>
        </div>
        </div>
    );
}