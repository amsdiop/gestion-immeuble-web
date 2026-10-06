import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BienDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bien, setBien] = useState(null);
  const [locataires, setLocataires] = useState([]);
  const [baux, setBaux] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bienRes, locRes, bauxRes] = await Promise.all([
        api.get(`/biens/${id}`),
        api.get(`/locataires?bien_id=${id}&page=1&limit=50`),
        api.get(`/baux?bien_id=${id}&page=1&limit=50`),
      ]);
      setBien(bienRes.data.data);
      setLocataires(locRes.data.data || []);
      setBaux(bauxRes.data.data || []);
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

  if (!bien) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>Bien non trouvé</p>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
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
        <h1 style={styles.title}>🏠 {bien.nom}</h1>
      </header>

      <main style={styles.main}>
        <section style={styles.bienInfo}>
          <h2>Informations</h2>
          <div style={styles.infoGrid}>
            <div>
              <p style={styles.label}>Référence</p>
              <p style={styles.value}>{bien.reference || '-'}</p>
            </div>
            <div>
              <p style={styles.label}>Prix Unitaire</p>
              <p style={styles.value}>{bien.pu || '-'} XOF</p>
            </div>
            <div>
              <p style={styles.label}>Disponibilité</p>
              <p style={styles.value}>{bien.dispo ? '✅ Libre' : '🔴 Occupé'}</p>
            </div>
            <div>
              <p style={styles.label}>Caution</p>
              <p style={styles.value}>{bien.caution || '-'} XOF</p>
            </div>
          </div>
        </section>

        <section style={styles.locatairesSection}>
          <h2>👥 Locataires ({locataires.length})</h2>
          {locataires.length === 0 ? (
            <p style={styles.empty}>Aucun locataire trouvé</p>
          ) : (
            <div style={styles.locatairesList}>
              {locataires.map((locataire) => (
                <div key={locataire.id} style={styles.locataireCard}>
                  <div style={styles.locataireHeader}>
                    <h3>{locataire.nom} {locataire.prenom || ''}</h3>
                  </div>
                  <p style={styles.info}>
                    <strong>Téléphone:</strong> {locataire.telephone || '-'}
                  </p>
                  <p style={styles.info}>
                    <strong>Profession:</strong> {locataire.profession || '-'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.bauxSection}>
          <h2>📋 Contrats/Baux ({baux.length})</h2>
          {baux.length === 0 ? (
            <p style={styles.empty}>Aucun contrat trouvé</p>
          ) : (
            <div style={styles.bauxList}>
              {baux.map((bail) => (
                <div key={bail.id} style={styles.bailCard}>
                  <div style={styles.bailHeader}>
                    <h3>Contrat: {bail.reference}</h3>
                    <span style={{
                      ...styles.statut,
                      background: bail.statut === 'ACTIF' ? '#d1fae5' : '#fee2e2',
                      color: bail.statut === 'ACTIF' ? '#065f46' : '#7f1d1d',
                    }}>
                      {bail.statut}
                    </span>
                  </div>
                  <div style={styles.bailInfo}>
                    <div>
                      <p style={styles.label}>Début</p>
                      <p style={styles.value}>{bail.date_debut ? new Date(bail.date_debut).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p style={styles.label}>Fin</p>
                      <p style={styles.value}>{bail.date_fin ? new Date(bail.date_fin).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p style={styles.label}>Loyer</p>
                      <p style={{...styles.value, color: '#10b981'}}>{bail.loyer || '-'} XOF</p>
                    </div>
                  </div>
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
  bienInfo: {
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
  locatairesSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  locatairesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  locataireCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa',
  },
  locataireHeader: {
    marginBottom: '15px',
  },
  info: {
    margin: '8px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  bauxSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  bauxList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  bailCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa',
  },
  bailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  statut: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  bailInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
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
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#6b7280',
  },
};
