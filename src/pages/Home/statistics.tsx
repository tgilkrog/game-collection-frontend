import styles from "./Home.module.css";

export function Statistics() {
    return (
        <div className={styles.panel}>
            <div className={styles.scan}></div>

            <div className={styles.panel_header}>COLLECTION OVERVIEW</div>

            <div className={`${styles.panel_row} ${styles.total}`}>
                <span>Total Games</span>
                <span className={styles.value}>6</span>
            </div>

            <div className={styles.panel_row}><span>PS1</span><span className={styles.value}>12</span></div>
            <div className={styles.panel_row}><span>PS2</span><span className={styles.value}>56</span></div>
            <div className={styles.panel_row}><span>PS3</span><span className={styles.value}>45</span></div>
            <div className={styles.panel_row}><span>PS4</span><span className={styles.value}>22</span></div>
            <div className={styles.panel_row}><span>PS5</span><span className={styles.value}>19</span></div>
        </div>
    );
}