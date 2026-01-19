
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import UserCard from '../components/UserCard';
import { UserContext } from '../services/UserContext';
import { follow, getFollowersByUserIdOrdered, unfollow } from '../services/api';

const QuemMeSegue = () => {
  const {
    selectedUser,
    followingUsers,
  } = useContext(UserContext);

  const [followingByUserId, setFollowingByUserId] = useState({});
  const [toggleLoadingByUserId, setToggleLoadingByUserId] = useState({});
  const [sortDirection, setSortDirection] = useState('asc');

  const [followersUsers, setFollowersUsers] = useState([]);
  const [followersUsersError, setFollowersUsersError] = useState(null);
  const [followersUsersLoading, setFollowersUsersLoading] = useState(false);
  const [followersUsersLoadingMore, setFollowersUsersLoadingMore] = useState(false);
  const [followersUsersPage, setFollowersUsersPage] = useState(0);
  const [followersUsersHasMore, setFollowersUsersHasMore] = useState(true);

  const pageSize = 10;

  const followersUsersLoadingRef = useRef(false);
  const followersUsersLoadingMoreRef = useRef(false);
  const followersUsersHasMoreRef = useRef(true);
  const followersUsersPageRef = useRef(0);
  const sortDirectionRef = useRef(sortDirection);
  const selectedUserIdRef = useRef(selectedUser?.id);
  const scrollTickingRef = useRef(false);

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
    if (!selectedUser?.id) {
      setFollowersUsers([]);
      setFollowersUsersError(null);
      setFollowersUsersLoading(false);
      setFollowersUsersLoadingMore(false);
      setFollowersUsersPage(0);
      setFollowersUsersHasMore(true);

      followersUsersLoadingRef.current = false;
      followersUsersLoadingMoreRef.current = false;
      followersUsersHasMoreRef.current = true;
      followersUsersPageRef.current = 0;
      selectedUserIdRef.current = null;
      return;
    }

    selectedUserIdRef.current = selectedUser.id;
    sortDirectionRef.current = sortDirection;

    let isMounted = true;
    const loadFirstPage = async () => {
      setFollowersUsersLoading(true);
      setFollowersUsersError(null);
      setFollowersUsersPage(0);
      setFollowersUsersHasMore(true);

      followersUsersLoadingRef.current = true;
      followersUsersLoadingMoreRef.current = false;
      followersUsersHasMoreRef.current = true;
      followersUsersPageRef.current = 0;

      try {
        const order = `name_${sortDirection}`;
        const data = await getFollowersByUserIdOrdered(selectedUser.id, order, 0, pageSize);

        const normalizedUsersRaw =
          (Array.isArray(data?.followers) && data.followers) ||
          (Array.isArray(data?.content) && data.content) ||
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.users) && data.users) ||
          (Array.isArray(data?.data) && data.data) ||
          [];

        const normalizedUsers = normalizedUsersRaw.map((u) => ({
          ...u,
          id: u?.id ?? u?.userId,
          name: u?.name ?? u?.userName,
        }));

        const isLast = Boolean(data?.last);

        if (!isMounted) return;
        setFollowersUsers(normalizedUsers);
        setFollowersUsersHasMore(!isLast && normalizedUsers.length === pageSize);

        followersUsersHasMoreRef.current = !isLast && normalizedUsers.length === pageSize;
      } catch (err) {
        if (!isMounted) return;
        setFollowersUsers([]);
        setFollowersUsersError(err?.message || 'Erro ao carregar seguidores');
        setFollowersUsersHasMore(false);

        followersUsersHasMoreRef.current = false;
      } finally {
        if (!isMounted) return;
        setFollowersUsersLoading(false);

        followersUsersLoadingRef.current = false;
      }
    };

    loadFirstPage().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id, sortDirection]);

  const loadMoreFollowers = async () => {
    const selectedId = selectedUserIdRef.current;
    if (!selectedId) return;
    if (followersUsersLoadingRef.current || followersUsersLoadingMoreRef.current) return;
    if (!followersUsersHasMoreRef.current) return;

    const nextPage = followersUsersPageRef.current + 1;

    followersUsersLoadingMoreRef.current = true;
    setFollowersUsersLoadingMore(true);
    setFollowersUsersError(null);

    try {
      const order = `name_${sortDirectionRef.current}`;
      const data = await getFollowersByUserIdOrdered(selectedId, order, nextPage, pageSize);

      const normalizedUsersRaw =
        (Array.isArray(data?.followers) && data.followers) ||
        (Array.isArray(data?.content) && data.content) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.users) && data.users) ||
        (Array.isArray(data?.data) && data.data) ||
        [];

      const normalizedUsers = normalizedUsersRaw.map((u) => ({
        ...u,
        id: u?.id ?? u?.userId,
        name: u?.name ?? u?.userName,
      }));

      const isLast = Boolean(data?.last);

      setFollowersUsers((prev) => {
        const prevArr = Array.isArray(prev) ? prev : [];
        const seen = new Set(prevArr.map((u) => u?.id));
        const next = normalizedUsers.filter((u) => !seen.has(u?.id));
        return [...prevArr, ...next];
      });

      setFollowersUsersPage(nextPage);
      setFollowersUsersHasMore(!isLast && normalizedUsers.length === pageSize);

      followersUsersPageRef.current = nextPage;
      followersUsersHasMoreRef.current = !isLast && normalizedUsers.length === pageSize;
    } catch (err) {
      setFollowersUsersError(err?.message || 'Erro ao carregar mais seguidores');
      setFollowersUsersHasMore(false);

      followersUsersHasMoreRef.current = false;
    } finally {
      setFollowersUsersLoadingMore(false);

      followersUsersLoadingMoreRef.current = false;
    }
  };

  useEffect(() => {
    if (!canLoad) return;

    const onScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;

      window.requestAnimationFrame(() => {
        try {
          if (window.scrollY <= 0) return;

          const thresholdPx = 220;
          const scrolledToBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - thresholdPx;

          if (scrolledToBottom) {
            loadMoreFollowers().catch(() => {});
          }
        } finally {
          scrollTickingRef.current = false;
        }
      });
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [canLoad]);

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

      await reloadFollowingUsers(followerId, `name_${sortDirection}`);

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

          {followersUsersLoadingMore && <p>Carregando mais...</p>}
        </div>
      )}
    </div>
  );
};

export default QuemMeSegue;

