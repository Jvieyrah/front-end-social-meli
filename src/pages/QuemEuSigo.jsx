
import React, { useContext, useEffect, useState } from 'react';

import UserCard from '../components/UserCard';
import { UserContext } from '../services/UserContext';
import { unfollow } from '../services/api';

const QuemEuSigo = () => {
  const {
    selectedUser,
    followingUsers,
    followingUsersLoading,
    followingUsersError,
    reloadFollowingUsers,
  } = useContext(UserContext);

  const [unfollowLoadingByUserId, setUnfollowLoadingByUserId] = useState({});
  const [sortDirection, setSortDirection] = useState('asc');

  const canLoad = Boolean(selectedUser?.id);

  useEffect(() => {
    if (!selectedUser?.id) return;
    reloadFollowingUsers(selectedUser.id, `name_${sortDirection}`).catch(() => {});
  }, [selectedUser?.id, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleUnfollow = async (targetUserId) => {
    if (!selectedUser?.id) return;
    if (unfollowLoadingByUserId[targetUserId]) return;

    setUnfollowLoadingByUserId((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      await unfollow(selectedUser.id, targetUserId);
      await reloadFollowingUsers(selectedUser.id, `name_${sortDirection}`);
    } finally {
      setUnfollowLoadingByUserId((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Quem eu sigo</h2>

      {canLoad && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '12px 0' }}>
          <button
            type="button"
            onClick={toggleSortDirection}
            style={{
              border: '1px solid #ddd',
              background: '#fff',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Ordenação: {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      )}

      {!canLoad && <p>Selecione um usuário para ver quem ele segue.</p>}

      {canLoad && followingUsersLoading && <p>Carregando...</p>}
      {canLoad && followingUsersError && <p>Erro: {followingUsersError}</p>}

      {canLoad && !followingUsersLoading && !followingUsersError && (
        <div style={{ display: 'grid', gap: 12 }}>
          {followingUsers.length === 0 && <p>Este usuário não segue ninguém.</p>}

          {followingUsers.map((u) => (
            <div key={u.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <UserCard
                username={u.name}
                imageUrl={u.imageUrl}
                isFollowing
                onToggleFollow={() => handleUnfollow(u.id)}
              />

              {unfollowLoadingByUserId[u.id] && <p>Atualizando...</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuemEuSigo;

