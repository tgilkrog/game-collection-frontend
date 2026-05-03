import styles from "./Home.module.css";
import { PageTransition } from "../../components/PageTransition";
import { Statistics } from "./statistics";

export function Home() {
  return (
    <PageTransition>
      <section className={styles.hero}>
        <div className="wrapper">
          <h1>Game Collection</h1>
          <Statistics />
        </div>
      </section>
    </PageTransition>
  );
}