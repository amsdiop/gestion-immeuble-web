import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const RegisterBailleur = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Infos, 2: Vérification PIN
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    telephone: '',
    motDePasse: '',
    confirmMotDePasse: '',
  });
  const [generatedPin, setGeneratedPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const generatePin = () => {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.nom.trim() || !formData.motDePasse.trim()) {
      setError('Email, nom et mot de passe requis');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email invalide');
      return;
    }

    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vérifier que l'email n'existe pas déjà
      const checkResponse = await api.post('/auth/check-email', {
        email: formData.email,
      });

      if (!checkResponse.data.available) {
        setError('Cet email est déjà utilisé');
        setLoading(false);
        return;
      }

      // Générer le PIN
      const pin = generatePin();
      setGeneratedPin(pin);
      setStep(2);
      setSuccess(`Votre PIN temporaire a été généré: ${pin}`);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Erreur lors de la vérification');
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Créer le compte bailleur
      const response = await api.post('/auth/register-bailleur', {
        email: formData.email,
        nom: formData.nom,
        telephone: formData.telephone,
        motDePasse: formData.motDePasse,
        pin: generatedPin,
      });

      setSuccess('Compte créé avec succès! Redirection...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Erreur lors de la création du compte');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏢 Nouveau Bailleur</h1>
          <p style={styles.subtitle}>Créez votre compte</p>
        </div>

        {/* STEP 1: INFOS */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                disabled={loading}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nom Complet</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Amadou Diop"
                disabled={loading}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Téléphone (optionnel)</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+221 78 528 3367"
                disabled={loading}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mot de Passe</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  disabled={loading}
                  style={styles.passwordInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmer Mot de Passe</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmMotDePasse"
                  value={formData.confirmMotDePasse}
                  onChange={handleChange}
                  placeholder="Retapez le mot de passe"
                  disabled={loading}
                  style={styles.passwordInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  title={showConfirmPassword ? 'Masquer' : 'Afficher'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Vérification...' : 'Suivant'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={styles.backLink}
            >
              ← Retour à la connexion
            </button>
          </form>
        )}

        {/* STEP 2: CONFIRMATION PIN */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} style={styles.form}>
            <div style={styles.successBox}>
              <p style={styles.successIcon}>✅</p>
              <p style={styles.successText}>
                Informations vérifiées!
              </p>
            </div>

            <div style={styles.pinDisplay}>
              <p style={styles.pinLabel}>Votre PIN de connexion:</p>
              <p style={styles.pin}>{generatedPin}</p>
              <p style={styles.pinHint}>
                ✍️ Notez ce PIN. Vous en aurez besoin pour vous connecter.
              </p>
            </div>

            <div style={styles.summaryBox}>
              <h3 style={styles.summaryTitle}>Résumé</h3>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Nom:</strong> {formData.nom}</p>
              {formData.telephone && (
                <p><strong>Téléphone:</strong> {formData.telephone}</p>
              )}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Création en cours...' : '✨ Créer mon compte'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setGeneratedPin('');
                setError('');
                setSuccess('');
              }}
              style={styles.backLink}
            >
              ← Modifier mes infos
            </button>
          </form>
        )}
      </div>

      <p style={styles.footer}>
        © 2026 Gestion_Immeuble. Tous les droits réservés.
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '11px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    outline: 'none',
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    width: '100%',
    padding: '11px 40px 11px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    outline: 'none',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
  button: {
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    marginBottom: '12px',
    marginTop: '8px',
  },
  error: {
    margin: '0 0 16px',
    padding: '12px 14px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#991b1b',
    textAlign: 'center',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'underline',
    padding: '8px 0',
    textAlign: 'center',
  },
  successBox: {
    background: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  successIcon: {
    fontSize: '32px',
    margin: '0 0 8px',
  },
  successText: {
    margin: 0,
    fontSize: '14px',
    color: '#166534',
    fontWeight: '600',
  },
  pinDisplay: {
    background: '#eff6ff',
    border: '2px solid #93c5fd',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  pinLabel: {
    margin: '0 0 8px',
    fontSize: '13px',
    color: '#1e40af',
    fontWeight: '600',
  },
  pin: {
    margin: '0 0 12px',
    fontSize: '36px',
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: '8px',
    fontFamily: 'monospace',
  },
  pinHint: {
    margin: 0,
    fontSize: '12px',
    color: '#3b82f6',
  },
  summaryBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    fontSize: '13px',
    lineHeight: '1.8',
    color: '#374151',
  },
  summaryTitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  footer: {
    marginTop: '24px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
};

export default RegisterBailleur;
