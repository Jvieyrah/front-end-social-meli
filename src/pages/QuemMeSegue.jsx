
import React, { useContext, useState } from 'react';

import UserCard from '../components/UserCard';
import { UserContext } from '../services/UserContext';

const QuemMeSegue = () => {
  const {
    selectedUser,
    followersUsers,
    followersUsersLoading,
    followersUsersError,
    followUser,
  } = useContext(UserContext);

  const [followLoadingByUserId, setFollowLoadingByUserId] = useState({});

  const canLoad = Boolean(selectedUser?.id);

  const handleFollow = async (targetUserId) => {
    if (!selectedUser?.id) return;
    if (followLoadingByUserId[targetUserId]) return;

    setFollowLoadingByUserId((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      await followUser(targetUserId, selectedUser.id);
    } finally {
      setFollowLoadingByUserId((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Quem me segue</h2>

      {!canLoad && <p>Selecione um usuário para ver seus seguidores.</p>}

      {canLoad && followersUsersLoading && <p>Carregando...</p>}
      {canLoad && followersUsersError && <p>Erro: {followersUsersError}</p>}

      {canLoad && !followersUsersLoading && !followersUsersError && (
        <div style={{ display: 'grid', gap: 12 }}>
          {followersUsers.length === 0 && <p>Este usuário não tem seguidores.</p>}

          {followersUsers.map((u) => (
            <div key={u.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <UserCard
                username={u.name}
                imageUrl={u.imageUrl}
                isFollowing={false}
                onToggleFollow={() => handleFollow(u.id)}
              />

              {followLoadingByUserId[u.id] && <p>Atualizando...</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuemMeSegue;

