import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function BiensPage() {
  const navigate = useNavigate();
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    immeuble_id: '',
    etage_id: '',
    typebiens_id: '',
    pu: '',
    taux_marge: '',
    taux_reduction: '',
    taux_tva: '',
    caution: '',
    nettoyage: '',
    security: '',
    dispo: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBiens();
  }, []);

  const fetchBiens = async () => {
    try {
      setLoading(true);
      const response = await api.get('/biens?page=1&limit=100');
      setBiens(response.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked ? 1 : 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/biens/${editingId}`, formData);
        alert('Bien modifié!');
      } else {
        await api.post('/biens', formData);
        alert('Bien créé!');
      }
      resetForm();
      fetchBiens();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = (bien) => {
    setFormData({
      nom: bien.nom,
      reference: bien.reference || '',
      immeuble_id: bien.immeuble_id || '',
      etage_id: bien.etage_id || '',
      typebiens_id: bien.typebiens_id || '',
      pu: bien.pu || '',
      taux_marge: bien.taux_marge || '',
      taux_reduction: bien.taux_reduction || '',
      taux_tva: bien.taux_tva || '',
      caution: bien.caution || '',
      nettoyage: bien.nettoyage || '',
      security: bien.security || '',
      dispo: bien.dispo || 1,
    });
    setEditingId(bien.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce bien?')) return;
    try {
      await api.delete(`/biens/${id}`);
      alert('Bien supprimé!');
      fetchBiens();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      reference: '',
      immeuble_id: '',
      etage_id: '',
      typebiens_id: '',
      pu: '',
      taux_marge: '',
      taux_reduction: '',
      taux_tva: '',
      caution: '',
      nettoyage: '',
      security: '',
      dispo: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredBiens = biens.filter(bien =>
    bien.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bien.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>🏠 Gestion des Biens</h1>
          <div></div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            ➕ Ajouter
          </button>
        </div>

        {showForm && (
          <div style={styles.formContainer}>
            <h3>{editingId ? 'Modifier' : 'Nouveau'} Bien</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Nom:</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Référence:</label>
                <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Immeuble ID:</label>
                <input type="number" name="immeuble_id" value={formData.immeuble_id} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Étage ID:</label>
                <input type="number" name="etage_id" value={formData.etage_id} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Prix Unitaire:</label>
                <input type="number" name="pu" value={formData.pu} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Taux Marge:</label>
                <input type="number" name="taux_marge" value={formData.taux_marge} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label>Disponible:</label>
                <select name="dispo" value={formData.dispo} onChange={handleInputChange} style={styles.input}>
                  <option value="1">Oui</option>
                  <option value="0">Non</option>
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
          {loading ? <p>Chargement...</p> : filteredBiens.length === 0 ? <p style={styles.empty}>Aucun bien</p> : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Référence</th>
                  <th style={styles.th}>Prix</th>
                  <th style={styles.th}>Disponible</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBiens.map((bien) => (
                  <tr key={bien.id} style={styles.row}>
                    <td style={styles.td}>{bien.nom}</td>
                    <td style={styles.td}>{bien.reference || '-'}</td>
                    <td style={styles.td}>{bien.pu || '-'}</td>
                    <td style={styles.td}>{bien.dispo ? 'Oui' : 'Non'}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(bien)} style={styles.editBtn}>✏️</button>
                      <button onClick={() => handleDelete(bien.id)} style={styles.deleteBtn}>🗑️</button>
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
  header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { padding: '10px 15px', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid white', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 'bold' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
  toolbar: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
  addBtn: { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  formContainer: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginTop: '5px' },
  formButtons: { display: 'flex', gap: '10px', gridColumn: '1 / -1' },
  submitBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  cancelBtn: { padding: '10px 20px', background: '#999', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  listContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  headerRow: { background: '#f9fafb', borderBottom: '2px solid #e5e7eb' },
  th: { padding: '15px', textAlign: 'left', fontWeight: '600', color: '#1f2937' },
  row: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '15px', color: '#6b7280' },
  editBtn: { marginRight: '5px', padding: '6px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  empty: { padding: '40px', textAlign: 'center', color: '#9ca3af' },
};
