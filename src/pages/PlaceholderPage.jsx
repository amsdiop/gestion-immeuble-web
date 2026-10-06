import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>Page en développement</h1>
        </div>
      </header>
      <main style={styles.main}>
        <div style={styles.message}>
          <h2>Cette fonctionnalité est en cours de développement</h2>
          <p>Veuillez revenir au tableau de bord</p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '20px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: '2px solid white',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  title: {
    margin: '0',
    fontSize: '24px',
  },
  main: {
    padding: '40px 20px',
  },
  message: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
};
