
import React, { useContext, useEffect, useMemo, useState } from 'react';

import UserCard from '../components/UserCard';
import { UserContext } from '../services/UserContext';
import { follow, unfollow } from '../services/api';

const QuemMeSegue = () => {
  const {
    selectedUser,
    followersUsers,
    followersUsersLoading,
    followersUsersError,
    reloadFollowersUsers,
    followingUsers,
    reloadFollowingUsers,
  } = useContext(UserContext);

  const [followingByUserId, setFollowingByUserId] = useState({});
  const [toggleLoadingByUserId, setToggleLoadingByUserId] = useState({});
  const [sortDirection, setSortDirection] = useState('asc');

  const canLoad = Boolean(selectedUser?.id);
  const canToggle = Boolean(selectedUser?.id);

  useEffect(() => {
    setFollowingByUserId(() => {
      const next = {};
      (Array.isArray(followingUsers) ? followingUsers : []).forEach((u) => {
        if (u?.id == null) return;
        next[u.id] = true;
      });
      return next;
    });
  }, [followingUsers]);

  const followersWithFollowState = useMemo(() => {
    return (Array.isArray(followersUsers) ? followersUsers : []).map((u) => ({
      ...u,
      isFollowing: Boolean(followingByUserId[u.id]),
    }));
  }, [followersUsers, followingByUserId]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    if (!reloadFollowersUsers) return;
    reloadFollowersUsers(selectedUser.id, `name_${sortDirection}`).catch(() => {});
  }, [selectedUser?.id, sortDirection]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    if (!reloadFollowingUsers) return;
    reloadFollowingUsers(selectedUser.id, `name_${sortDirection}`).catch(() => {});
  }, [selectedUser?.id, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const toggleFollowing = async (targetUserId) => {
    if (!canToggle) return;
    if (toggleLoadingByUserId[targetUserId]) return;

    const followerId = selectedUser.id;
    const isFollowing = Boolean(followingByUserId[targetUserId]);

    setToggleLoadingByUserId((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      if (isFollowing) {
        await unfollow(followerId, targetUserId);
      } else {
        await follow(followerId, targetUserId);
      }

      await Promise.all([
        reloadFollowersUsers(followerId, `name_${sortDirection}`),
        reloadFollowingUsers(followerId, `name_${sortDirection}`),
      ]);

      setFollowingByUserId((prev) => ({
        ...prev,
        [targetUserId]: !isFollowing,
      }));
    } finally {
      setToggleLoadingByUserId((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Quem me segue</h2>

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

      {!canLoad && <p>Selecione um usuário para ver seus seguidores.</p>}

      {canLoad && followersUsersLoading && <p>Carregando...</p>}
      {canLoad && followersUsersError && <p>Erro: {followersUsersError}</p>}

      {canLoad && !followersUsersLoading && !followersUsersError && (
        <div style={{ display: 'grid', gap: 12 }}>
          {followersUsers.length === 0 && <p>Este usuário não tem seguidores.</p>}

          {followersWithFollowState.map((u) => (
            <div key={u.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <UserCard
                username={u.name}
                imageUrl={u.imageUrl}
                isFollowing={u.isFollowing}
                onToggleFollow={() => toggleFollowing(u.id)}
              />

              {toggleLoadingByUserId[u.id] && <p>Atualizando...</p>}
              {!canToggle && <p>Selecione um usuário para seguir/deixar de seguir</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuemMeSegue;

