import { useQuery } from '@tanstack/react-query';
import styles from "./Home.module.css";
import { getHome } from '../../api/home';

type PlatformStat = {
    id: number;
    name: string;
    alias: string;
    total: number;
}

export function Statistics() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['home'],
        queryFn: () => getHome().then(r => r.data),
    });

    const stats: PlatformStat[] = data?.platform_totals ?? [];
    const total: number = data?.total_copies ?? 0;

    if (isLoading) return <div className={styles.panel}>Loading...</div>;
    if (isError) return <div className={styles.panel}>Failed to load stats.</div>;

    return (
        <div className={styles.panel}>
            <div className={styles.scan}></div>

            <div className={styles.panel_header}>COLLECTION OVERVIEW</div>

            <div className={`${styles.panel_row} ${styles.total}`}>
                <span>Total Games</span>
                <span className={styles.value}>{total}</span>
            </div>

            {stats.map((g) => (
                <div key={g.id} className={styles.panel_row}>
                    <span>{g.alias}</span>
                    <span className={styles.value}>{g.total}</span>
                </div>
            ))}
        </div>
    );
}
