import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LocatairesPage() {
  const navigate = useNavigate();
  const [locataires, setLocataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    profession: '',
    compte_id: '',
    biens_id: '',
    titre_courtoisie: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocataires();
  }, []);

  const fetchLocataires = async () => {
    try {
      setLoading(true);
      const response = await api.get('/locataires?page=1&limit=100');
      setLocataires(response.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/locataires/${editingId}`, formData);
        alert('Locataire modifié!');
      } else {
        await api.post('/locataires', formData);
        alert('Locataire créé!');
      }
      resetForm();
      fetchLocataires();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (locataire) => {
    setFormData({
      nom: locataire.nom,
      prenom: locataire.prenom || '',
      telephone: locataire.telephone || '',
      profession: locataire.profession || '',
      compte_id: locataire.compte_id || '',
      biens_id: locataire.biens_id || '',
      titre_courtoisie: locataire.titre_courtoisie || '',
    });
    setEditingId(locataire.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce locataire?')) return;
    try {
      await api.delete(`/locataires/${id}`);
      alert('Locataire supprimé!');
      fetchLocataires();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      telephone: '',
      profession: '',
      compte_id: '',
      biens_id: '',
      titre_courtoisie: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredLocataires = locataires.filter(l =>
    l.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Retour</button>
          <h1 style={styles.title}>👥 Gestion des Locataires</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>➕ Ajouter</button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier' : 'Nouveau'} Locataire</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Nom:</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Prénom:</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Téléphone:</label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Profession:</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Compte ID:</label>
                <input type="number" name="compte_id" value={formData.compte_id} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Bien ID:</label>
                <input type="number" name="biens_id" value={formData.biens_id} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formButtons}>
                <button type="submit" style={styles.submitBtn}>{editingId ? 'Modifier' : 'Créer'}</button>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.listContainer}>
          {loading ? <p>Chargement...</p> : filteredLocataires.length === 0 ? <p style={styles.empty}>Aucun locataire</p> : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Prénom</th>
                  <th style={styles.th}>Téléphone</th>
                  <th style={styles.th}>Profession</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocataires.map((l) => (
                  <tr key={l.id} style={styles.row}>
                    <td style={styles.td}>{l.nom}</td>
                    <td style={styles.td}>{l.prenom || '-'}</td>
                    <td style={styles.td}>{l.telephone || '-'}</td>
                    <td style={styles.td}>{l.profession || '-'}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(l)} style={styles.editBtn}>✏️</button>
                      <button onClick={() => handleDelete(l.id)} style={styles.deleteBtn}>🗑️</button>
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
  container: { minHeight: '100vh', background: '#f3f4f6' },
  header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { padding: '10px 15px', background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 'bold' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
  toolbar: { display: 'flex', gap: '10px', marginBottom: '20px' },
  searchInput: { flex: 1, padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px' },
  addBtn: { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  formContainer: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '5px' },
  formButtons: { display: 'flex', gap: '10px', gridColumn: '1 / -1' },
  submitBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { padding: '10px 20px', background: '#999', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  listContainer: { background: 'white', borderRadius: '12px', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { background: '#f9fafb', borderBottom: '2px solid #e5e7eb' },
  th: { padding: '15px', textAlign: 'left', fontWeight: '600', color: '#1f2937' },
  row: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '15px', color: '#6b7280' },
  editBtn: { marginRight: '5px', padding: '6px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  empty: { padding: '40px', textAlign: 'center', color: '#9ca3af' },
};
