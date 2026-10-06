import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function UserDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (isEditing && user) {
      setEditData(user);
    }
  }, [isEditing]);

  useEffect(() => {
    if (showSignatureCanvas && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      // Dans le modal, utiliser une hauteur plus grande
      canvas.width = 400;
      canvas.height = 250;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [showSignatureCanvas]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await api.get(`/users/${userId}?include_photo=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
    }
  };

  const startDrawingSignature = (e) => {
    if (!canvasRef.current) return;
    setIsDrawingSignature(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Calculer le ratio d'échelle
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX || (e.touches[0].clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY || (e.touches[0].clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSignature = (e) => {
    if (!isDrawingSignature || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Calculer le ratio d'échelle
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX || (e.touches && (e.touches[0].clientX - rect.left) * scaleX);
    const y = (e.clientY - rect.top) * scaleY || (e.touches && (e.touches[0].clientY - rect.top) * scaleY);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingSignature = () => {
    setIsDrawingSignature(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      // Upload photo if changed
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        await api.post(`/users/${userId}/photo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Upload signature file if selected
      if (signatureFile) {
        const formData = new FormData();
        formData.append('file', signatureFile);
        try {
          await api.post(`/users/${userId}/signature`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (err) {
          console.error('Erreur upload signature file:', err);
        }
      }

      // Upload signature if drawn - MUST wait for toBlob to complete
      if (showSignatureCanvas && canvasRef.current) {
        const canvas = canvasRef.current;
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });

        if (blob) {
          const formData = new FormData();
          formData.append('file', blob, 'signature.png');
          try {
            await api.post(`/users/${userId}/signature`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (err) {
            console.error('Erreur upload signature:', err);
          }
        }
      }

      // Update user data
      const updateData = { ...editData };
      delete updateData.users_photo;
      delete updateData.users_signature;
      delete updateData.users_mot_de_passe_hash;
      delete updateData.users_created_at;
      delete updateData.users_updated_at;

      await api.put(`/users/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setSignatureFile(null);
      setShowSignatureCanvas(false);
      fetchUser();
      alert('Utilisateur modifié avec succès!');
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible.')) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      await api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Utilisateur supprimé avec succès!');
      navigate('/users');
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const getSignatureBase64 = () => {
    if (!user.users_signature) return null;

    // Si c'est déjà une string base64
    if (typeof user.users_signature === 'string') {
      return user.users_signature.length > 0 ? user.users_signature : null;
    }

    // Si c'est un objet Buffer TypeORM {type: "Buffer", data: [...]}
    if (user.users_signature && user.users_signature.type === 'Buffer' && user.users_signature.data) {
      try {
        const bytes = new Uint8Array(user.users_signature.data);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } catch (err) {
        console.error('Erreur conversion signature:', err);
        return null;
      }
    }

    return null;
  };

  if (loading) return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/users')} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Détail Utilisateur</h1>
      </header>
      <main style={styles.main}>
        <p>Chargement...</p>
      </main>
    </div>
  );

  if (error) return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/users')} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Détail Utilisateur</h1>
      </header>
      <main style={styles.main}>
        <p style={{ color: 'red' }}>Erreur : {error}</p>
      </main>
    </div>
  );

  if (!user) return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/users')} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Détail Utilisateur</h1>
      </header>
      <main style={styles.main}>
        <p>Utilisateur non trouvé</p>
      </main>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/users')} style={styles.backBtn}>← Retour</button>
        <h1 style={styles.title}>👤 Détail Utilisateur</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <>
              <button onClick={handleSaveChanges} style={{...styles.backBtn, background: '#10b981'}} disabled={saving}>
                {saving ? '⏳ Enregistrement...' : '✓ Enregistrer'}
              </button>
              <button onClick={() => setIsEditing(false)} style={styles.backBtn}>✕ Annuler</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} style={{...styles.backBtn, background: '#667eea'}}>
                ✎ Modifier
              </button>
              <button onClick={handleDeleteUser} style={{...styles.backBtn, background: '#ef4444'}}>
                🗑 Supprimer
              </button>
            </>
          )}
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.detailCard}>
          <div style={styles.photoSection}>
            {photoPreview ? (
              <img src={photoPreview} alt="Photo" style={styles.photoImage} />
            ) : user.users_photo && typeof user.users_photo === 'string' && user.users_photo.length > 0 ? (
              <img
                src={`data:image/png;base64,${user.users_photo}`}
                alt={`${user.users_prenom} ${user.users_nom}`}
                style={styles.photoImage}
              />
            ) : (
              <div style={styles.photoPlaceholder}>
                {user.users_prenom?.charAt(0).toUpperCase()}{user.users_nom?.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <div style={{ marginTop: '15px' }}>
                <label style={styles.fileInputLabel}>
                  📷 Charger une photo
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>

          <div style={styles.fieldsGrid}>
            <div style={styles.field}>
              <label style={styles.label}>ID</label>
              <div style={styles.value}>{user.users_id}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Prénom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.users_prenom || ''}
                  onChange={(e) => setEditData({...editData, users_prenom: e.target.value})}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.users_prenom || '-'}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Nom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.users_nom || ''}
                  onChange={(e) => setEditData({...editData, users_nom: e.target.value})}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.users_nom || '-'}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.users_email || ''}
                  onChange={(e) => setEditData({...editData, users_email: e.target.value})}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.users_email}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Téléphone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.users_telephone || ''}
                  onChange={(e) => setEditData({...editData, users_telephone: e.target.value})}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.users_telephone || '-'}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>PIN</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.users_pin || ''}
                  onChange={(e) => setEditData({...editData, users_pin: e.target.value})}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.users_pin || '-'}</div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Rôle</label>
              {isEditing ? (
                <select
                  value={editData.users_role || ''}
                  onChange={(e) => setEditData({...editData, users_role: e.target.value})}
                  style={styles.input}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="BAILLEUR">BAILLEUR</option>
                  <option value="LOCATAIRE">LOCATAIRE</option>
                  <option value="INVITE">INVITE</option>
                </select>
              ) : (
                <div style={styles.value}>
                  <span style={{...styles.badge, background: getRoleColor(user.users_role)}}>
                    {user.users_role}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Actif</label>
              {isEditing ? (
                <select
                  value={editData.users_actif ? '1' : '0'}
                  onChange={(e) => setEditData({...editData, users_actif: e.target.value === '1' ? 1 : 0})}
                  style={styles.input}
                >
                  <option value="1">Oui</option>
                  <option value="0">Non</option>
                </select>
              ) : (
                <div style={styles.value}>
                  {user.users_actif ? '✅ Oui' : '❌ Non'}
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Créé le</label>
              <div style={styles.value}>{new Date(user.users_created_at).toLocaleString('fr-FR')}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Mis à jour le</label>
              <div style={styles.value}>{new Date(user.users_updated_at).toLocaleString('fr-FR')}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Propriétaire rattaché ID</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.users_proprietaire_rattache_id || ''}
                  onChange={(e) => setEditData({...editData, users_proprietaire_rattache_id: e.target.value ? parseInt(e.target.value) : null})}
                  style={styles.input}
                />
              ) : (
                <div style={styles.value}>{user.users_proprietaire_rattache_id || '-'}</div>
              )}
            </div>

            <div style={{...styles.field, background: '#f0f4ff', border: '2px solid #667eea', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', justifyContent: 'center'}}>

              {getSignatureBase64() ? (
                <img
                  src={`data:image/png;base64,${getSignatureBase64()}`}
                  alt="Signature"
                  style={{ maxWidth: '90%', height: 'auto', maxHeight: '50px', border: '1px solid #d1d5db', borderRadius: '2px', background: '#fafafa' }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Pas de signature</p>
              )}

              {isEditing && (
                <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
                  <button
                    onClick={() => setShowSignatureCanvas(true)}
                    style={{background: '#667eea', color: 'white', cursor: 'pointer', padding: '2px 6px', border: 'none', borderRadius: '3px', fontWeight: 'bold', fontSize: '8px', flex: 1, lineHeight: '1'}}
                    title="Dessiner signature"
                  >
                    ✎ Dessiner
                  </button>
                  <label style={{background: '#10b981', color: 'white', cursor: 'pointer', padding: '2px 6px', border: 'none', borderRadius: '3px', fontWeight: 'bold', fontSize: '8px', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1'}} title="Charger une signature">
                    📷 Charger
                    <input type="file" accept="image/*" onChange={handleSignatureFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>

            {showSignatureCanvas && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', maxWidth: '90%', width: '500px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>Dessiner votre signature</h3>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={250}
                    onMouseDown={startDrawingSignature}
                    onMouseMove={drawSignature}
                    onMouseUp={stopDrawingSignature}
                    onTouchStart={startDrawingSignature}
                    onTouchMove={drawSignature}
                    onTouchEnd={stopDrawingSignature}
                    style={{ width: '100%', height: 'auto', border: '2px solid #667eea', borderRadius: '8px', cursor: 'crosshair', background: 'white', display: 'block', marginBottom: '15px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={clearSignature} style={{background: '#ef4444', color: 'white', cursor: 'pointer', padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', flex: 1}}>
                      🗑 Effacer
                    </button>
                    <button onClick={() => setShowSignatureCanvas(false)} style={{background: '#gray', color: 'white', cursor: 'pointer', padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', flex: 1, background: '#6b7280'}}>
                      ✕ Annuler
                    </button>
                    <button onClick={() => setShowSignatureCanvas(false)} style={{background: '#10b981', color: 'white', cursor: 'pointer', padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', flex: 1}}>
                      ✓ Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

function getRoleColor(role) {
  const colors = {
    'ADMIN': '#667eea',
    'BAILLEUR': '#8b5cf6',
    'LOCATAIRE': '#10b981',
    'INVITE': '#f59e0b',
  };
  return colors[role] || '#6b7280';
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  detailCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '2px solid #3b82f6',
    padding: '30px',
  },
  photoSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  photoImage: {
    width: '200px',
    height: '200px',
    borderRadius: '12px',
    objectFit: 'cover',
    objectPosition: 'center top',
    border: '3px solid #667eea',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  photoPlaceholder: {
    width: '200px',
    height: '200px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  field: {
    padding: '10px 12px',
    background: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  },
  value: {
    fontSize: '15px',
    color: '#1f2937',
    fontWeight: '500',
    wordBreak: 'break-word',
  },
  badge: {
    display: 'inline-block',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  fileInputLabel: {
    display: 'inline-block',
    background: '#667eea',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.3s',
  },
};
