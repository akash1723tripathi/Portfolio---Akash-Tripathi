import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 - Page Not Found · Akash Tripathi',
  description: "The requested page could not be found. Return to Akash Tripathi's portfolio homepage.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className={styles.container}>
      <span className={styles.code} aria-hidden="true">
        404
      </span>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The page you are looking for doesn&apos;t exist or has moved. Explore Akash
        Tripathi&apos;s full-stack work or return to the home page.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primaryBtn}>
          Return Home
        </Link>
        <Link href="/work2" className={styles.secondaryBtn}>
          Browse Projects
        </Link>
      </div>
    </main>
  );
}
