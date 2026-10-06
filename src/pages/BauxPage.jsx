import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function BauxPage() {
  const navigate = useNavigate();
  const [baux, setBaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    bien_id: '',
    locataire_id: '',
    reference: '',
    date_debut: '',
    date_fin: '',
    loyer: '',
    statut: 'ACTIF',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBaux();
  }, []);

  const fetchBaux = async () => {
    try {
      setLoading(true);
      const response = await api.get('/baux?page=1&limit=100');
      setBaux(response.data.data || []);
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
        await api.put(`/baux/${editingId}`, formData);
        alert('Bail modifié!');
      } else {
        await api.post('/baux', formData);
        alert('Bail créé!');
      }
      resetForm();
      fetchBaux();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (bail) => {
    setFormData({
      bien_id: bail.bien_id || '',
      locataire_id: bail.locataire_id || '',
      reference: bail.reference || '',
      date_debut: bail.date_debut ? bail.date_debut.split('T')[0] : '',
      date_fin: bail.date_fin ? bail.date_fin.split('T')[0] : '',
      loyer: bail.loyer || '',
      statut: bail.statut || 'ACTIF',
    });
    setEditingId(bail.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce bail?')) return;
    try {
      await api.delete(`/baux/${id}`);
      alert('Bail supprimé!');
      fetchBaux();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      bien_id: '',
      locataire_id: '',
      reference: '',
      date_debut: '',
      date_fin: '',
      loyer: '',
      statut: 'ACTIF',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredBaux = baux.filter(b => b.reference?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Retour</button>
          <h1 style={styles.title}>📋 Gestion des Baux</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>➕ Ajouter</button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier' : 'Nouveau'} Bail</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Référence:</label>
                <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Bien ID:</label>
                <input type="number" name="bien_id" value={formData.bien_id} onChange={handleInputChange} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Locataire ID:</label>
                <input type="number" name="locataire_id" value={formData.locataire_id} onChange={handleInputChange} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Date début:</label>
                <input type="date" name="date_debut" value={formData.date_debut} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Date fin:</label>
                <input type="date" name="date_fin" value={formData.date_fin} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Loyer:</label>
                <input type="number" name="loyer" value={formData.loyer} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Statut:</label>
                <select name="statut" value={formData.statut} onChange={handleInputChange} style={styles.input}>
                  <option value="ACTIF">ACTIF</option>
                  <option value="BROUILLON">BROUILLON</option>
                  <option value="TERMINE">TERMINÉ</option>
                  <option value="RESILIE">RÉSILIÉ</option>
                </select>
              </div>
              <div style={styles.formButtons}>
                <button type="submit" style={styles.submitBtn}>{editingId ? 'Modifier' : 'Créer'}</button>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.listContainer}>
          {loading ? <p>Chargement...</p> : filteredBaux.length === 0 ? <p style={styles.empty}>Aucun bail</p> : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Référence</th>
                  <th style={styles.th}>Locataire ID</th>
                  <th style={styles.th}>Bien ID</th>
                  <th style={styles.th}>Loyer</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBaux.map((b) => (
                  <tr key={b.id} style={styles.row}>
                    <td style={styles.td}>{b.reference}</td>
                    <td style={styles.td}>{b.locataire_id || '-'}</td>
                    <td style={styles.td}>{b.bien_id || '-'}</td>
                    <td style={styles.td}>{b.loyer || '-'}</td>
                    <td style={styles.td}>{b.statut}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(b)} style={styles.editBtn}>✏️</button>
                      <button onClick={() => handleDelete(b.id)} style={styles.deleteBtn}>🗑️</button>
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
