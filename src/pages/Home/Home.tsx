import { useEffect, useState } from 'react';
import styles from "./Home.module.css";
import { PageTransition } from "../../components/PageTransition";
import { Statistics } from "./statistics";
import { getHome } from "../../api/home";

export function Home() {
  return (
    <PageTransition>
      <section className={styles.hero}>
        <div className="wrapper">
          <Statistics />
        </div>
      </section>
    </PageTransition>
  );
}