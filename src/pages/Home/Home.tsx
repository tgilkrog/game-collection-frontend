import styles from "./Home.module.css";
import { PageTransition } from "../../components/PageTransition";
import { Statistics } from "./statistics";
import { Feed } from "./Feed";

export function Home() {
  return (
    <PageTransition>
      <section className={styles.hero}>
        <div className="wrapper">
          <Statistics />
        </div>
        <Feed />
      </section>
    </PageTransition>
  );
}