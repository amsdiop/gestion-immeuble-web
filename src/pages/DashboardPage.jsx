import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [immeubles, setImmeubles] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const navItems = [
    { path: '/immeubles', icon: '🏗️', label: 'Immeubles' },
    { path: '/biens', icon: '🏠', label: 'Biens' },
    { path: '/etages', icon: '📐', label: 'Etages' },
    { path: '/locataires', icon: '👥', label: 'Locataires' },
    { path: '/titre-courtoisie', icon: '🎖️', label: 'Titre Courtoisie' },
    { path: '/users', icon: '👤', label: 'Users' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role === 'ADMIN') {
        fetchStatistics();
      }
    }
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/dashboard/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchImmeubles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/immeubles?page=1&limit=10');
      setImmeubles(response.data.data.immeubles);
    } catch (error) {
      console.error('Erreur lors du chargement des immeubles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📊 Tableau de bord</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcome}>
          <h2>Bienvenue, {user?.prenom} {user?.nom || 'Utilisateur'}!</h2>
          <p style={styles.role}>Rôle: {user?.role}</p>
        </div>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Gestion des données</h3>
          <div style={styles.navGrid}>
            {navItems.map((item, idx) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredBtn(idx)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.navBtn,
                  ...(hoveredBtn === idx ? styles.navBtnHover : {}),
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'inherit',
                  border: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <div style={styles.navIcon}>{item.icon}</div>
                <div style={styles.navLabel}>{item.label}</div>
              </button>
            ))}
          </div>
        </section>

        {statistics && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Statistiques</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.comptes?.total || 0}</div>
                <div style={styles.statLabel}>Comptes</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.biens?.total || 0}</div>
                <div style={styles.statLabel}>Biens</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.locataires?.total || 0}</div>
                <div style={styles.statLabel}>Locataires</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.immeubles?.total || 0}</div>
                <div style={styles.statLabel}>Immeubles</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.baux?.total || 0}</div>
                <div style={styles.statLabel}>Baux</div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f3f4f6',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid white',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  welcome: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  role: {
    margin: '10px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1f2937',
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  navBtn: {
    padding: '20px',
    background: 'white',
    border: '3px solid #3b82f6',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3), 0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
  navBtnHover: {
    borderColor: '#667eea',
    background: '#f3f4f6',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
    transform: 'translateY(-2px)',
  },
  navIcon: {
    fontSize: '32px',
  },
  navLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  manageBtn: {
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    borderTop: '4px solid #667eea',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  cardText: {
    margin: '8px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  viewBtn: {
    marginTop: '15px',
    width: '100%',
    padding: '10px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '40px',
    fontSize: '16px',
  },
};
