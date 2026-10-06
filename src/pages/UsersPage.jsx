import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterId, setFilterId] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await api.get('/users?page=1&limit=100&include_photo=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const usersData = response.data.data.users || [];
      setUsers(usersData);
      console.log('Users data:', usersData);
      if (usersData[0]) {
        console.log('User 0 photo type:', typeof usersData[0].users_photo);
        console.log('User 0 photo length:', usersData[0].users_photo?.length);
        console.log('User 0 photo start:', usersData[0].users_photo?.substring(0, 50));
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const filteredUsers = users
    .filter(user => !filterId || user.users_id.toString().includes(filterId))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.users_id - b.users_id;
      } else {
        return b.users_id - a.users_id;
      }
    });

  if (loading) return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={handleGoBack} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Gestion des Utilisateurs</h1>
      </header>
      <main style={styles.main}>
        <p>Chargement des utilisateurs...</p>
      </main>
    </div>
  );

  if (error) return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={handleGoBack} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Gestion des Utilisateurs</h1>
      </header>
      <main style={styles.main}>
        <p style={{ color: 'red' }}>Erreur : {error}</p>
      </main>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={handleGoBack} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Gestion des Utilisateurs</h1>
      </header>

      <main style={styles.main}>
        <h2>Liste des Utilisateurs</h2>

        <div style={styles.toolbar}>
          <div style={styles.sortGroup}>
            <label style={styles.label}>Ordre:</label>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                ...styles.sortBtn,
                background: sortOrder === 'asc' ? '#667eea' : '#999',
              }}
            >
              {sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <div style={styles.usersList}>
            {filteredUsers.map((user) => (
              <div
                key={user.users_id}
                style={styles.userCard}
                onClick={() => navigate(`/users/${user.users_id}`)}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div
                  style={styles.userAvatar}
                >
                  {user.users_photo && typeof user.users_photo === 'string' && user.users_photo.length > 0 ? (
                    <img
                      src={`data:image/png;base64,${user.users_photo}`}
                      alt={`${user.users_prenom} ${user.users_nom}`}
                      style={styles.avatarImage}
                      onError={() => console.log('Image load error for user', user.users_id)}
                    />
                  ) : (
                    <span>{user.users_prenom?.charAt(0).toUpperCase()}{user.users_nom?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user.users_prenom} {user.users_nom}</div>
                  <div style={styles.userDetails}>
                    <span>{user.users_email}</span>
                    <span>•</span>
                    <span>{user.users_telephone}</span>
                  </div>
                </div>
                <div style={styles.userRole}>
                  <span style={styles.badge}>{user.users_role}</span>
                </div>
                <div style={styles.userStatus}>
                  {user.users_actif ? '✅ Actif' : '❌ Inactif'}
                </div>
              </div>
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
    background: '#f3f4f6',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid white',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  toolbar: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'center',
    background: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  filterGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  sortGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  sortBtn: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #3b82f6',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  userAvatar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '36px',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '2px solid #667eea',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    borderRadius: '10px',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },
  userDetails: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  userRole: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  userStatus: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10b981',
    flexShrink: 0,
  },
  badge: {
    display: 'inline-block',
    background: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
};
