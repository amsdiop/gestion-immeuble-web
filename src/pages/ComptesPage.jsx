import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ComptesPage() {
  const navigate = useNavigate();
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    telephone: '',
    pin: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComptes();
  }, []);

  const fetchComptes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/comptes');
      setComptes(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/comptes/${editingId}`, formData);
        alert('Compte modifié avec succès!');
      } else {
        await api.post('/comptes', formData);
        alert('Compte créé avec succès!');
      }
      setFormData({ email: '', nom: '', telephone: '', pin: '' });
      setEditingId(null);
      setShowForm(false);
      fetchComptes();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (compte) => {
    setFormData({
      email: compte.email,
      nom: compte.nom,
      telephone: compte.telephone || '',
      pin: compte.pin || '',
    });
    setEditingId(compte.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) return;
    try {
      await api.delete(`/comptes/${id}`);
      alert('Compte supprimé!');
      fetchComptes();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ email: '', nom: '', telephone: '', pin: '' });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>👤 Sélectionner un Compte</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={styles.addBtn}
          >
            ➕ Ajouter un Compte
          </button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier le compte' : 'Nouveau compte'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Nom:</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Téléphone:</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>PIN (4 chiffres):</label>
                <input
                  type="text"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  maxLength="4"
                  pattern="\d{4}"
                  style={styles.input}
                />
              </div>
              <div style={styles.formButtons}>
                <button type="submit" style={styles.submitBtn}>
                  {editingId ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.listContainer}>
          {loading ? (
            <p>Chargement...</p>
          ) : !Array.isArray(comptes) || comptes.length === 0 ? (
            <p style={styles.empty}>Aucun compte disponible</p>
          ) : (
            <div style={styles.pastillesGrid}>
              {comptes.map((compte) => (
                <button
                  key={compte.id}
                  style={styles.comptePastille}
                  onClick={() => navigate(`/compte/${compte.id}`)}
                  title={`Cliquez pour accéder au compte: ${compte.email}`}
                >
                  <span style={styles.pastilleIcon}>👤</span>
                  <span style={styles.pastilleName}>{compte.nom}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
    fontWeight: 'bold',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  addBtn: {
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.3s ease',
  },
  formContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '5px',
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
    gridColumn: '1 / -1',
  },
  submitBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  listContainer: {
    padding: '20px 0',
  },
  pastillesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  comptePastille: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '30px 20px',
    background: 'white',
    border: '3px solid #667eea',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    transition: 'all 0.3s ease',
  },
  pastilleIcon: {
    fontSize: '40px',
  },
  pastilleName: {
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  empty: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '16px',
  },
};
