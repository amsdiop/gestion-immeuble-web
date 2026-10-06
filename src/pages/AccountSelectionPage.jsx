import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AccountSelectionPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user) {
        navigate('/');
        return;
      }

      setRole(user.role);

      // Charger selon le rôle
      if (user.role === 'ADMIN') {
        // ADMIN: Afficher tous les comptes
        const response = await api.get('/comptes?page=1&limit=100');
        setItems(response.data.data || []);
      } else if (user.role === 'BAILLEUR') {
        // BAILLEUR: Son compte
        setItems([user]);
      } else if (user.role === 'INVITE') {
        // INVITE: Les immeubles accessibles
        if (user.immeubles_id) {
          const response = await api.get(`/immeubles/${user.immeubles_id}`);
          setItems([response.data]);
        } else {
          setItems([]);
        }
      } else if (user.role === 'LOCATAIRE') {
        // LOCATAIRE: Son profil locataire
        setItems([user]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    if (role === 'ADMIN') {
      // Aller à la page des immeubles du compte
      navigate(`/immeubles-manage`);
    } else if (role === 'BAILLEUR') {
      // Aller à la page des immeubles
      navigate('/immeubles-manage');
    } else if (role === 'INVITE') {
      // Aller à la page de l'immeuble
      navigate(`/immeuble/${item.id}`);
    } else if (role === 'LOCATAIRE') {
      // Aller à la page locataire
      navigate('/locataires');
    }
  };

  const getTitle = () => {
    if (role === 'ADMIN') return '👤 Sélectionner un Compte';
    if (role === 'BAILLEUR') return '🏢 Mon Compte';
    if (role === 'INVITE') return '🏢 Immeubles Accessibles';
    if (role === 'LOCATAIRE') return '👤 Mon Profil';
    return 'Sélection';
  };

  const getIcon = () => {
    if (role === 'ADMIN') return '👤';
    if (role === 'BAILLEUR') return '🏢';
    if (role === 'INVITE') return '🏢';
    if (role === 'LOCATAIRE') return '👤';
    return '📍';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>{getIcon()} {getTitle()}</h1>
      </header>

      <main style={styles.main}>
        {loading ? (
          <p style={styles.loading}>Chargement...</p>
        ) : items.length === 0 ? (
          <p style={styles.empty}>Aucun élément trouvé</p>
        ) : (
          <div style={styles.pastillesGrid}>
            {items.map((item) => (
              <button
                key={item.id}
                style={styles.pastille}
                onClick={() => handleSelectItem(item)}
              >
                <span style={styles.icon}>
                  {role === 'ADMIN' || role === 'BAILLEUR' ? '👤' : '🏢'}
                </span>
                <span style={styles.name}>
                  {role === 'ADMIN' || role === 'BAILLEUR'
                    ? item.nom || item.email
                    : item.nom || item.adresse}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    padding: '40px 20px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  pastillesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    maxWidth: '800px',
    width: '100%',
  },
  pastille: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '30px 20px',
    background: 'white',
    border: '3px solid #667eea',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    fontSize: '40px',
  },
  name: {
    textAlign: 'center',
    wordBreak: 'break-word',
    maxWidth: '100%',
  },
  loading: {
    fontSize: '16px',
    color: 'white',
  },
  empty: {
    fontSize: '16px',
    color: 'white',
  },
};
