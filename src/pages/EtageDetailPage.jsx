import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function EtageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [etage, setEtage] = useState(null);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [etageRes, biensRes] = await Promise.all([
        api.get(`/etages/${id}`),
        api.get(`/biens?etage_id=${id}&page=1&limit=50`),
      ]);
      setEtage(etageRes.data.data);
      setBiens(biensRes.data.data?.biens || biensRes.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Chargement...</p>
      </div>
    );
  }

  if (!etage) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>Étage non trouvé</p>
        <button onClick={() => navigate('/immeubles-manage')} style={styles.backBtn}>
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Retour
        </button>
        <h1 style={styles.title}>🏗️ {etage.nom}</h1>
      </header>

      <main style={styles.main}>
        <section style={styles.etageInfo}>
          <h2>Informations</h2>
          <div style={styles.infoGrid}>
            <div>
              <p style={styles.label}>Numéro d'étage</p>
              <p style={styles.value}>{etage.numero_etage || '-'}</p>
            </div>
            <div>
              <p style={styles.label}>Nombre de biens</p>
              <p style={styles.value}>{biens.length}</p>
            </div>
          </div>
        </section>

        <section style={styles.biensSection}>
          <h2>🏠 Biens ({biens.length})</h2>
          {biens.length === 0 ? (
            <p style={styles.empty}>Aucun bien trouvé</p>
          ) : (
            <div style={styles.biensList}>
              {biens.map((bien) => (
                <div
                  key={bien.id}
                  style={styles.bienCard}
                  onClick={() => navigate(`/bien/${bien.id}`)}
                >
                  <div style={styles.bienHeader}>
                    <h3>{bien.nom}</h3>
                    <span style={styles.dispo}>{bien.dispo ? '✅ Libre' : '🔴 Occupé'}</span>
                  </div>
                  <p style={styles.reference}>
                    <strong>Référence:</strong> {bien.reference || '-'}
                  </p>
                  <p style={styles.loyer}>
                    <strong>Prix Unit:</strong> {bien.pu || '-'} XOF
                  </p>
                  <button style={styles.viewBtn}>Voir les détails →</button>
                </div>
              ))}
            </div>
          )}
        </section>
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
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backBtn: {
    padding: '10px 15px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid white',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  etageInfo: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  label: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    margin: '0 0 5px',
  },
  value: {
    fontSize: '16px',
    color: '#1f2937',
    margin: 0,
    fontWeight: '500',
  },
  biensSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  biensList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  bienCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  bienHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px',
  },
  dispo: {
    background: '#f0fdf4',
    color: '#15803d',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  reference: {
    margin: '8px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  loyer: {
    margin: '8px 0',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '600',
  },
  viewBtn: {
    width: '100%',
    marginTop: '15px',
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9ca3af',
  },
  error: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#dc2626',
  },
};
