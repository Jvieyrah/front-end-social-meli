import React, { useContext } from 'react';
import { UserContext } from '../services/UserContext';


const UserSelector = () => {
  const { users, selectedUser, setSelectedUser, usersLoading, usersError } =
    useContext(UserContext);
 
  const handleChange = (e) => {
    const selectedId = Number(e.target.value);
    const user = users.find((u) => u.id === selectedId) || null;
    setSelectedUser(user);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffe600',
        fontFamily: '"Proxima Nova", -apple-system, Roboto, Arial, sans-serif',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>
            Usuário
          </h1>

          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {selectedUser ? `Selecionado: ${selectedUser.name}` : 'Nenhum selecionado'}
          </div>
        </div>

        {usersLoading && <p style={{ margin: 0, fontSize: 13 }}>Carregando usuários...</p>}
        {usersError && <p style={{ margin: 0, fontSize: 13 }}>Erro: {usersError}</p>}

        <select
          value={selectedUser?.id ?? ''}
          onChange={handleChange}
          disabled={usersLoading || users.length === 0}
          style={{
            height: 40,
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.18)',
            padding: '0 12px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            outline: 'none',
            fontSize: 14,
          }}
        >
        <option value="" disabled>
          {usersLoading ? 'Carregando...' : 'Selecione um usuário'}
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
        </select>

        {!usersLoading && users.length === 0 && (
          <p style={{ margin: 0, fontSize: 13 }}>Nenhum usuário disponível</p>
        )}
      </div>
    </div>
  );
};

export default UserSelector;