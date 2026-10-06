import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ImmeubleListPage() {
  const navigate = useNavigate();
  const [immeubles, setImmeubles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchImmeubles();
  }, []);

  const fetchImmeubles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/immeubles?page=1&limit=100');
      setImmeubles(response.data.data?.immeubles || []);
    } catch (error) {
      console.error('Erreur lors du chargement des immeubles:', error);
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
        await api.put(`/immeubles/${editingId}`, formData);
        alert('Immeuble modifié avec succès!');
      } else {
        await api.post('/immeubles', formData);
        alert('Immeuble créé avec succès!');
      }
      setFormData({ nom: '', adresse: '', ville: '', telephone: '', email: '' });
      setEditingId(null);
      setShowForm(false);
      fetchImmeubles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (immeuble) => {
    setFormData({
      nom: immeuble.nom,
      adresse: immeuble.adresse || '',
      ville: immeuble.ville || '',
      telephone: immeuble.telephone || '',
      email: immeuble.email || '',
    });
    setEditingId(immeuble.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet immeuble?')) return;
    try {
      await api.delete(`/immeubles/${id}`);
      alert('Immeuble supprimé!');
      fetchImmeubles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleView = (id) => {
    navigate(`/immeuble/${id}`);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nom: '', adresse: '', ville: '', telephone: '', email: '' });
  };

  const filteredImmeubles = immeubles.filter(immeuble =>
    immeuble.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    immeuble.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    immeuble.ville?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>🏢 Gestion des Immeubles</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Rechercher un immeuble..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button
            onClick={() => setShowForm(!showForm)}
            style={styles.addBtn}
          >
            ➕ Ajouter un Immeuble
          </button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier l\'immeuble' : 'Nouvel immeuble'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
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
                <label>Adresse:</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Ville:</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
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
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
          ) : filteredImmeubles.length === 0 ? (
            <p style={styles.empty}>Aucun immeuble trouvé</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Adresse</th>
                  <th style={styles.th}>Ville</th>
                  <th style={styles.th}>Téléphone</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredImmeubles.map((immeuble) => (
                  <tr key={immeuble.id} style={styles.row}>
                    <td style={styles.td}>{immeuble.nom}</td>
                    <td style={styles.td}>{immeuble.adresse || '-'}</td>
                    <td style={styles.td}>{immeuble.ville || '-'}</td>
                    <td style={styles.td}>{immeuble.telephone || '-'}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleView(immeuble.id)}
                        style={styles.viewBtn}
                      >
                        👁️ Voir
                      </button>
                      <button
                        onClick={() => handleEdit(immeuble)}
                        style={styles.editBtn}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(immeuble.id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  },
  searchInput: {
    flex: 1,
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
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
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  headerRow: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#1f2937',
  },
  row: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '15px',
    color: '#6b7280',
  },
  viewBtn: {
    marginRight: '5px',
    padding: '6px 10px',
    background: '#06b6d4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  editBtn: {
    marginRight: '5px',
    padding: '6px 10px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteBtn: {
    padding: '6px 10px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};
