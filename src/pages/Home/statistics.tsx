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

    if (isLoading || isError) return null;

    return (
        <div className={styles.stats_panel}>
            <div className={styles.stats_header}>COLLECTION OVERVIEW</div>

            <div className={`${styles.stats_row} ${styles.stats_total}`}>
                <span>TOTAL</span>
                <span className={styles.stats_total_value}>{total}</span>
            </div>

            {stats.map((g) => (
                <div key={g.id} className={styles.stats_row}>
                    <span className={styles.stats_label}>{g.alias}</span>
                    <span className={styles.stats_value}>{g.total}</span>
                </div>
            ))}
        </div>
    );
}
