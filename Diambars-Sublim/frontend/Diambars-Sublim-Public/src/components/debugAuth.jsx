// src/components/DebugAuth.jsx
import React from 'react';
import { useAuth } from '../context/authContext';

const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      borderRadius: '5px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔍 Auth Debug</h4>
      <p><strong>Loading:</strong> {loading ? '⏳ true' : '✅ false'}</p>
      <p><strong>IsAuthenticated:</strong> {isAuthenticated ? '✅ true' : '❌ false'}</p>
      <p><strong>User:</strong> {user ? `👤 ${user.email}` : '❌ null'}</p>
      <p><strong>User ID:</strong> {user?._id || user?.id || '❌ null'}</p>
      <p><strong>LocalStorage:</strong> {localStorage.getItem('user') ? '💾 present' : '❌ empty'}</p>
      <p><strong>Cookies:</strong> {document.cookie.includes('authToken') ? '🍪 authToken' : '❌ no authToken'}</p>
      
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
        <button 
          onClick={() => console.log('User data:', user)}
          style={{ fontSize: '10px', padding: '2px 5px' }}
        >
          Log User Data
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;