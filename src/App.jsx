import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ImmeubleDetailPage from './pages/ImmeubleDetailPage';
import EtageDetailPage from './pages/EtageDetailPage';
import BienDetailPage from './pages/BienDetailPage';
import ComptesPage from './pages/ComptesPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ImmeubleListPage from './pages/ImmeubleListPage';
import BiensPage from './pages/BiensPage';
import LocatairesPage from './pages/LocatairesPage';
import EtagesPage from './pages/EtagesPage';
import BauxPage from './pages/BauxPage';
import InvitesPage from './pages/InvitesPage';
import AccountSelectionPage from './pages/AccountSelectionPage';
import RegisterBailleur from './components/RegisterBailleur';
import PlaceholderPage from './pages/PlaceholderPage';

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
  return token ? children : <Navigate to="/" replace />;
}

function Routes_ () {
  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register-bailleur" element={<RegisterBailleur />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/users/:userId" element={<ProtectedRoute><UserDetailPage /></ProtectedRoute>} />
        <Route path="/comptes" element={<ProtectedRoute><ComptesPage /></ProtectedRoute>} />
        <Route path="/biens" element={<ProtectedRoute><BiensPage /></ProtectedRoute>} />
        <Route path="/locataires" element={<ProtectedRoute><LocatairesPage /></ProtectedRoute>} />
        <Route path="/etages" element={<ProtectedRoute><EtagesPage /></ProtectedRoute>} />
        <Route path="/baux" element={<ProtectedRoute><BauxPage /></ProtectedRoute>} />
        <Route path="/immeubles-manage" element={<ProtectedRoute><ImmeubleListPage /></ProtectedRoute>} />
        <Route path="/account-selection" element={<ProtectedRoute><AccountSelectionPage /></ProtectedRoute>} />
        <Route path="/immeuble/:id" element={<ProtectedRoute><ImmeubleDetailPage /></ProtectedRoute>} />
        <Route path="/etage/:id" element={<ProtectedRoute><EtageDetailPage /></ProtectedRoute>} />
        <Route path="/bien/:id" element={<ProtectedRoute><BienDetailPage /></ProtectedRoute>} />
        <Route path="/invites/:immeubles_id" element={<ProtectedRoute><InvitesPage /></ProtectedRoute>} />
        <Route path="*" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
      </Routes>
  );
}

function App() {
  return (
    <Router>
      <Routes_ />
    </Router>
  );
}

export default App;
