import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function InvitesPage() {
  const navigate = useNavigate();
  const { immeubles_id } = useParams();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    immeubles_id: immeubles_id || '',
    prenom: '',
    nom: '',
    adresse: '',
    pin: '',
    statut: 'en_attente',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (immeubles_id) {
      fetchInvites();
    }
  }, [immeubles_id]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invites/immeuble/${immeubles_id}?page=1&limit=100`);
      setInvites(response.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
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
        await api.put(`/invites/${editingId}`, formData);
        alert('Invite modifié!');
      } else {
        await api.post('/invites', formData);
        alert('Invite créé!');
      }
      setFormData({
        immeubles_id: immeubles_id || '',
        prenom: '',
        nom: '',
        adresse: '',
        pin: '',
        statut: 'en_attente',
      });
      setEditingId(null);
      setShowForm(false);
      fetchInvites();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (invite) => {
    setFormData({
      immeubles_id: invite.immeubles_id,
      prenom: invite.prenom,
      nom: invite.nom,
      adresse: invite.adresse || '',
      pin: invite.pin || '',
      statut: invite.statut || 'en_attente',
    });
    setEditingId(invite.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet invite?')) return;
    try {
      await api.delete(`/invites/${id}`);
      alert('Invite supprimé!');
      fetchInvites();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      immeubles_id: immeubles_id || '',
      prenom: '',
      nom: '',
      adresse: '',
      pin: '',
      statut: 'en_attente',
    });
  };

  const filteredInvites = invites.filter(invite =>
    invite.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.pin?.includes(searchTerm)
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>👥 Gestion des Invites</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Rechercher par nom ou PIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button
            onClick={() => setShowForm(!showForm)}
            style={styles.addBtn}
          >
            ➕ Ajouter un Invite
          </button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier l\'invite' : 'Nouvel invite'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Prénom:</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
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
                <label>PIN (4 chiffres):</label>
                <input
                  type="text"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  maxLength="4"
                  pattern="\d{4}"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Statut:</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="en_attente">En attente</option>
                  <option value="accepté">Accepté</option>
                  <option value="refusé">Refusé</option>
                </select>
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
          ) : !Array.isArray(filteredInvites) || filteredInvites.length === 0 ? (
            <p style={styles.empty}>Aucun invite trouvé</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableCell}>Prénom</th>
                  <th style={styles.tableCell}>Nom</th>
                  <th style={styles.tableCell}>Adresse</th>
                  <th style={styles.tableCell}>PIN</th>
                  <th style={styles.tableCell}>Statut</th>
                  <th style={styles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.map((invite) => (
                  <tr key={invite.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{invite.prenom}</td>
                    <td style={styles.tableCell}>{invite.nom}</td>
                    <td style={styles.tableCell}>{invite.adresse || '-'}</td>
                    <td style={styles.tableCell}>{invite.pin}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.badge,
                        background: invite.statut === 'accepté' ? '#10b981' :
                                   invite.statut === 'refusé' ? '#ef4444' : '#f59e0b'
                      }}>
                        {invite.statut}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleEdit(invite)}
                        style={styles.editBtn}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(invite.id)}
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  tableHeader: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  tableCell: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
  },
  tableRow: {
    transition: 'background 0.2s ease',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
  },
  editBtn: {
    margin: '0 5px',
    padding: '6px 10px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteBtn: {
    margin: '0 5px',
    padding: '6px 10px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  empty: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '16px',
  },
};
