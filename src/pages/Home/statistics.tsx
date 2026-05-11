import { useEffect, useState } from 'react';
import styles from "./Home.module.css";
import { getHome } from '../../api/home';

type stats = {
    'id': number,
    'name': string,
    'alias': string
    'total': number
}

export function Statistics() {
    const [stats, setStats] = useState<stats[]>([]);
    const [total, setTotal]  = useState(0);

    const fetchStats = async () => {
        const res = await getHome();
        setStats(res.data.platform_totals);
        setTotal(res.data.total_copies);
    };

    useEffect(() => {
    fetchStats();
    }, []);

    return (
        <div className={styles.panel}>
            <div className={styles.scan}></div>

            <div className={styles.panel_header}>COLLECTION OVERVIEW</div>

            <div className={`${styles.panel_row} ${styles.total}`}>
                <span>Total Games</span>
                <span className={styles.value}>{total}</span>
            </div>

            {stats.map((g) => (
                <div className={styles.panel_row}><span>{g.alias}</span><span className={styles.value}>{g.total}</span></div>
            ))}
        </div>
    );
}