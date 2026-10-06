import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ImmeubleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [immeuble, setImmeuble] = useState(null);
  const [etages, setEtages] = useState([]);
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [immeubleRes, etagesRes, biensRes] = await Promise.all([
        api.get(`/immeubles/${id}`),
        api.get(`/etages?immeuble_id=${id}&page=1&limit=50`),
        api.get(`/biens?immeuble_id=${id}&page=1&limit=50`),
      ]);
      setImmeuble(immeubleRes.data.data);
      setEtages(etagesRes.data.data || []);
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

  if (!immeuble) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>Immeuble non trouvé</p>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Retour au dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Retour
        </button>
        <h1 style={styles.title}>{immeuble.nom}</h1>
      </header>

      <main style={styles.main}>
        <section style={styles.immeubleInfo}>
          <h2>Informations</h2>
          <div style={styles.infoGrid}>
            <div>
              <p style={styles.label}>Adresse</p>
              <p style={styles.value}>{immeuble.adresse}</p>
            </div>
            <div>
              <p style={styles.label}>Ville</p>
              <p style={styles.value}>{immeuble.ville}</p>
            </div>
            <div>
              <p style={styles.label}>Code postal</p>
              <p style={styles.value}>{immeuble.code_postal}</p>
            </div>
            <div>
              <p style={styles.label}>Statut</p>
              <p style={styles.value}>
                {immeuble.actif === 1 ? '✅ Actif' : '❌ Inactif'}
              </p>
            </div>
          </div>
        </section>

        <section style={styles.etagesSection}>
          <h2>🏗️ Étages ({etages.length})</h2>
          {etages.length === 0 ? (
            <p style={styles.empty}>Aucun étage trouvé</p>
          ) : (
            <div style={styles.etagesList}>
              {etages.map((etage) => (
                <div
                  key={etage.id}
                  style={styles.etageCard}
                  onClick={() => navigate(`/etage/${etage.id}`)}
                >
                  <div style={styles.etageHeader}>
                    <h3>{etage.nom}</h3>
                    <span style={styles.etageNum}>Étage {etage.numero_etage}</span>
                  </div>
                  <button style={styles.viewBtn}>Voir les biens →</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.biensSection}>
          <h2>Biens ({biens.length})</h2>
          {biens.length === 0 ? (
            <p style={styles.empty}>Aucun bien trouvé</p>
          ) : (
            <div style={styles.biensList}>
              {biens.map((bien) => (
                <div key={bien.id} style={styles.bienCard}>
                  <div style={styles.bienHeader}>
                    <h3>{bien.designation}</h3>
                    <span style={styles.type}>{bien.type_bien}</span>
                  </div>
                  <p style={styles.reference}>
                    <strong>Référence:</strong> {bien.reference}
                  </p>
                  <p style={styles.loyer}>
                    <strong>Loyer:</strong> {bien.loyer} €
                  </p>
                  <div style={styles.taxes}>
                    <span>TVA: {bien.taux_tva}%</span>
                    <span>Marge: {bien.taux_marge}%</span>
                    <span>Remise: {bien.taux_remise}%</span>
                  </div>
                  <p style={styles.status}>
                    {bien.actif === 1 ? '✅ Actif' : '❌ Inactif'}
                  </p>
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
  immeubleInfo: {
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
  etagesSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  etagesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  etageCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  etageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  etageNum: {
    background: '#f3f4f6',
    color: '#667eea',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  viewBtn: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
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
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa',
  },
  bienHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px',
  },
  type: {
    background: '#dbeafe',
    color: '#0284c7',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
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
  taxes: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px',
    color: '#6b7280',
    margin: '10px 0',
    flexWrap: 'wrap',
  },
  status: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#6b7280',
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
