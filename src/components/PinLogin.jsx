import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const PinLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState(['', '', '', '']);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];

    // Handle single digit input
    if (value.length === 1) {
      newPin[index] = value;
    } else if (value.length > 1) {
      // Handle paste/multiple characters: distribute to remaining fields
      for (let i = 0; i < value.length && index + i < 4; i++) {
        newPin[index + i] = value[i];
      }
    }

    setPin(newPin);
    setError('');

    // Move focus to next field if current is filled
    if (newPin[index] && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all fields are filled
    if (newPin[3] && newPin.every((digit) => digit)) {
      handleLogin(newPin);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (pinArray) => {
    const pinCode = pinArray.join('');

    if (pinCode.length !== 4) {
      setError('PIN invalide (4 chiffres requis)');
      return;
    }

    setLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 30;
      });
    }, 200);

    try {
      // Try to find account by PIN only
      const response = await api.post('/auth/login-pin-only', {
        pin: pinCode,
      });

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        const { token, refresh_token, user } = response.data.data;
        // Utiliser à la fois localStorage ET sessionStorage pour la persistance
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('access_token', token);
        sessionStorage.setItem('refresh_token', refresh_token);
        sessionStorage.setItem('user', JSON.stringify(user));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        // Rediriger vers le dashboard
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      setError(err.response?.data?.error || 'PIN invalide');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏢 Gestion_Immeuble</h1>
          <p style={styles.subtitle}>Gestion Intelligente d'Immeubles</p>
        </div>

        {/* PIN INPUT SECTION */}
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Entrez votre PIN (4 chiffres)</label>
            <p style={styles.description}>Bailleur • Invité • Locataire</p>

            <div style={styles.pinContainer}>
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  placeholder=""
                  disabled={loading}
                  style={styles.pinInput}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {loading && (
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <p style={styles.progressText}>{Math.round(progress)}%</p>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              style={styles.checkbox}
            />
            <label htmlFor="rememberMe" style={styles.checkboxLabel}>
              Se souvenir de moi
            </label>
          </div>

          <button
            type="button"
            onClick={() => navigate('/register-bailleur')}
            style={styles.registerLink}
          >
            Vous êtes un nouveau bailleur?
          </button>
        </div>
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
    padding: '50px 40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '32px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  description: {
    margin: '0 0 24px 0',
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  pinContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  pinInput: {
    width: '70px',
    height: '70px',
    padding: '0',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '32px',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  },
  progressContainer: {
    marginBottom: '24px',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.3s ease',
  },
  progressText: {
    margin: '0',
    fontSize: '13px',
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    padding: '16px 0',
    borderTop: '1px solid #f0f0f0',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
  },
  registerLink: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'underline',
    padding: '8px 0',
    textAlign: 'center',
    transition: 'color 0.2s',
  },
  footer: {
    marginTop: '32px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
};

export default PinLogin;
