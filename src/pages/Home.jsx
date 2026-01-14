import React, { useContext, useMemo, useState } from 'react';
import UserCard from '../components/UserCard';
import { UserContext } from '../services/UserContext';
import { follow, unfollow } from '../services/api';

const Home = () => {
  const { users, usersLoading, usersError, selectedUser, reloadUsers } = useContext(UserContext);
  const [followingByUserId, setFollowingByUserId] = useState({});
  const [toggleLoadingByUserId, setToggleLoadingByUserId] = useState({});

  const canToggle = Boolean(selectedUser?.id);

  const usersWithFollowState = useMemo(() => {
    return users.map((u) => ({
      ...u,
      isFollowing: Boolean(followingByUserId[u.id]),
    }));
  }, [users, followingByUserId]);

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

      await reloadUsers();

      setFollowingByUserId((prev) => ({
        ...prev,
        [targetUserId]: !isFollowing,
      }));
    } finally {
      setToggleLoadingByUserId((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };


  return (
    <div>

      {usersLoading && <p>Carregando usuários...</p>}
      {usersError && <p>Erro: {usersError}</p>}

      {!usersLoading && !usersError && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {usersWithFollowState.length === 0 && <p>Nenhum usuário encontrado.</p>}

          {usersWithFollowState.map((u) => (
            <div key={u.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <UserCard
                username={u.name}
                followersCount={u.followersCount ?? u.followers ?? 0}
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

export default Home;