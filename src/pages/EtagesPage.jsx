import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function EtagesPage() {
  const navigate = useNavigate();
  const [etages, setEtages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    immeuble_id: '',
    numero_etage: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEtages();
  }, []);

  const fetchEtages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/etages?page=1&limit=100');
      setEtages(response.data.data || []);
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
        await api.put(`/etages/${editingId}`, formData);
        alert('Étage modifié!');
      } else {
        await api.post('/etages', formData);
        alert('Étage créé!');
      }
      resetForm();
      fetchEtages();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (etage) => {
    setFormData({
      nom: etage.nom,
      immeuble_id: etage.immeuble_id || '',
      numero_etage: etage.numero_etage || '',
    });
    setEditingId(etage.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet étage?')) return;
    try {
      await api.delete(`/etages/${id}`);
      alert('Étage supprimé!');
      fetchEtages();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', immeuble_id: '', numero_etage: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEtages = etages.filter(e => e.nom?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Retour</button>
          <h1 style={styles.title}>🏗️ Gestion des Étages</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>➕ Ajouter</button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier' : 'Nouvel'} Étage</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Nom:</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Immeuble ID:</label>
                <input type="number" name="immeuble_id" value={formData.immeuble_id} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Numéro d'étage:</label>
                <input type="number" name="numero_etage" value={formData.numero_etage} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formButtons}>
                <button type="submit" style={styles.submitBtn}>{editingId ? 'Modifier' : 'Créer'}</button>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.listContainer}>
          {loading ? <p>Chargement...</p> : filteredEtages.length === 0 ? <p style={styles.empty}>Aucun étage</p> : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Numéro</th>
                  <th style={styles.th}>Immeuble ID</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEtages.map((e) => (
                  <tr key={e.id} style={styles.row}>
                    <td style={styles.td}>{e.nom}</td>
                    <td style={styles.td}>{e.numero_etage || '-'}</td>
                    <td style={styles.td}>{e.immeuble_id || '-'}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(e)} style={styles.editBtn}>✏️</button>
                      <button onClick={() => handleDelete(e.id)} style={styles.deleteBtn}>🗑️</button>
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
