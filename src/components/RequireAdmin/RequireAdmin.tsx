import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import styles from './RequireAdmin.module.css';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className={styles.status}>LOADING...</div>;
  if (!user?.is_admin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
