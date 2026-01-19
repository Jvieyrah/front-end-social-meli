
import React, { useContext, useEffect, useRef, useState } from 'react';

import UserCard from '../components/UserCard';
import { UserContext } from '../services/UserContext';
import { getFollowingByUserIdOrdered, unfollow } from '../services/api';

const QuemEuSigo = () => {
  const {
    selectedUser,
  } = useContext(UserContext);

  const [unfollowLoadingByUserId, setUnfollowLoadingByUserId] = useState({});
  const [sortDirection, setSortDirection] = useState('asc');

  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingUsersError, setFollowingUsersError] = useState(null);
  const [followingUsersLoading, setFollowingUsersLoading] = useState(false);
  const [followingUsersLoadingMore, setFollowingUsersLoadingMore] = useState(false);
  const [followingUsersPage, setFollowingUsersPage] = useState(0);
  const [followingUsersHasMore, setFollowingUsersHasMore] = useState(true);

  const pageSize = 10;

  const followingUsersLoadingRef = useRef(false);
  const followingUsersLoadingMoreRef = useRef(false);
  const followingUsersHasMoreRef = useRef(true);
  const followingUsersPageRef = useRef(0);
  const sortDirectionRef = useRef(sortDirection);
  const selectedUserIdRef = useRef(selectedUser?.id);
  const scrollTickingRef = useRef(false);

  const canLoad = Boolean(selectedUser?.id);

  useEffect(() => {
    if (!selectedUser?.id) {
      setFollowingUsers([]);
      setFollowingUsersError(null);
      setFollowingUsersLoading(false);
      setFollowingUsersLoadingMore(false);
      setFollowingUsersPage(0);
      setFollowingUsersHasMore(true);

      followingUsersLoadingRef.current = false;
      followingUsersLoadingMoreRef.current = false;
      followingUsersHasMoreRef.current = true;
      followingUsersPageRef.current = 0;
      selectedUserIdRef.current = null;
      return;
    }

    selectedUserIdRef.current = selectedUser.id;
    sortDirectionRef.current = sortDirection;

    let isMounted = true;
    const loadFirstPage = async () => {
      setFollowingUsersLoading(true);
      setFollowingUsersError(null);
      setFollowingUsersPage(0);
      setFollowingUsersHasMore(true);

      followingUsersLoadingRef.current = true;
      followingUsersLoadingMoreRef.current = false;
      followingUsersHasMoreRef.current = true;
      followingUsersPageRef.current = 0;

      try {
        const order = `name_${sortDirection}`;
        const data = await getFollowingByUserIdOrdered(selectedUser.id, order, 0, pageSize);

        const normalizedUsersRaw =
          (Array.isArray(data?.followed) && data.followed) ||
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
        setFollowingUsers(normalizedUsers);
        setFollowingUsersHasMore(!isLast && normalizedUsers.length === pageSize);

        followingUsersHasMoreRef.current = !isLast && normalizedUsers.length === pageSize;
      } catch (err) {
        if (!isMounted) return;
        setFollowingUsers([]);
        setFollowingUsersError(err?.message || 'Erro ao carregar seguindo');
        setFollowingUsersHasMore(false);

        followingUsersHasMoreRef.current = false;
      } finally {
        if (!isMounted) return;
        setFollowingUsersLoading(false);

        followingUsersLoadingRef.current = false;
      }
    };

    loadFirstPage().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id, sortDirection]);

  const loadMoreFollowing = async () => {
    const selectedId = selectedUserIdRef.current;
    if (!selectedId) return;
    if (followingUsersLoadingRef.current || followingUsersLoadingMoreRef.current) return;
    if (!followingUsersHasMoreRef.current) return;

    const nextPage = followingUsersPageRef.current + 1;

    followingUsersLoadingMoreRef.current = true;
    setFollowingUsersLoadingMore(true);
    setFollowingUsersError(null);

    try {
      const order = `name_${sortDirectionRef.current}`;
      const data = await getFollowingByUserIdOrdered(selectedId, order, nextPage, pageSize);

      const normalizedUsersRaw =
        (Array.isArray(data?.followed) && data.followed) ||
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

      setFollowingUsers((prev) => {
        const prevArr = Array.isArray(prev) ? prev : [];
        const seen = new Set(prevArr.map((u) => u?.id));
        const next = normalizedUsers.filter((u) => !seen.has(u?.id));
        return [...prevArr, ...next];
      });

      setFollowingUsersPage(nextPage);
      setFollowingUsersHasMore(!isLast && normalizedUsers.length === pageSize);

      followingUsersPageRef.current = nextPage;
      followingUsersHasMoreRef.current = !isLast && normalizedUsers.length === pageSize;
    } catch (err) {
      setFollowingUsersError(err?.message || 'Erro ao carregar mais seguindo');
      setFollowingUsersHasMore(false);

      followingUsersHasMoreRef.current = false;
    } finally {
      setFollowingUsersLoadingMore(false);
      followingUsersLoadingMoreRef.current = false;
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
            loadMoreFollowing().catch(() => {});
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

  const handleUnfollow = async (targetUserId) => {
    if (!selectedUser?.id) return;
    if (unfollowLoadingByUserId[targetUserId]) return;

    setUnfollowLoadingByUserId((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      await unfollow(selectedUser.id, targetUserId);
      setFollowingUsersPage(0);
      setFollowingUsersHasMore(true);
      followingUsersPageRef.current = 0;
      followingUsersHasMoreRef.current = true;

      setFollowingUsersLoading(true);
      followingUsersLoadingRef.current = true;

      const order = `name_${sortDirectionRef.current}`;
      const data = await getFollowingByUserIdOrdered(selectedUser.id, order, 0, pageSize);

      const normalizedUsersRaw =
        (Array.isArray(data?.followed) && data.followed) ||
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

      setFollowingUsers(normalizedUsers);
      setFollowingUsersHasMore(!isLast && normalizedUsers.length === pageSize);
      followingUsersHasMoreRef.current = !isLast && normalizedUsers.length === pageSize;
    } finally {
      setFollowingUsersLoading(false);
      followingUsersLoadingRef.current = false;
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

          {followingUsersLoadingMore && <p>Carregando mais...</p>}
        </div>
      )}
    </div>
  );
};

export default QuemEuSigo;

