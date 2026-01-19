import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PostCard from '../components/PostCard';
import { UserContext } from '../services/UserContext';
import { getFollowedPostsOrdered, likePost, unlikePost } from '../services/api';

const FeedDePublicacoes = () => {
  const {
    selectedUser,
  } = useContext(UserContext);

  const [followedPosts, setFollowedPosts] = useState([]);
  const [followedPostsLoading, setFollowedPostsLoading] = useState(false);
  const [followedPostsLoadingMore, setFollowedPostsLoadingMore] = useState(false);
  const [followedPostsError, setFollowedPostsError] = useState(null);
  const [followedPostsPage, setFollowedPostsPage] = useState(0);
  const [followedPostsHasMore, setFollowedPostsHasMore] = useState(true);

  const [likedByPostId, setLikedByPostId] = useState({});
  const [likesCountByPostId, setLikesCountByPostId] = useState({});
  const [toggleLoadingByPostId, setToggleLoadingByPostId] = useState({});
  const [sortDirection, setSortDirection] = useState('desc');

  const pageSize = 4;

  const followedPostsLoadingRef = useRef(false);
  const followedPostsLoadingMoreRef = useRef(false);
  const followedPostsHasMoreRef = useRef(true);
  const followedPostsPageRef = useRef(0);
  const sortDirectionRef = useRef(sortDirection);
  const selectedUserIdRef = useRef(selectedUser?.id);
  const scrollTickingRef = useRef(false);

  const canLoad = Boolean(selectedUser?.id);

  const posts = useMemo(() => {
    return Array.isArray(followedPosts) ? followedPosts : [];
  }, [followedPosts]);

  useEffect(() => {
    if (!selectedUser?.id) {
      setFollowedPosts([]);
      setFollowedPostsError(null);
      setFollowedPostsLoading(false);
      setFollowedPostsLoadingMore(false);
      setFollowedPostsPage(0);
      setFollowedPostsHasMore(true);

      followedPostsLoadingRef.current = false;
      followedPostsLoadingMoreRef.current = false;
      followedPostsHasMoreRef.current = true;
      followedPostsPageRef.current = 0;
      selectedUserIdRef.current = null;
      return;
    }

    selectedUserIdRef.current = selectedUser.id;
    sortDirectionRef.current = sortDirection;

    let isMounted = true;
    const loadFirstPage = async () => {
      setFollowedPostsLoading(true);
      setFollowedPostsError(null);
      setFollowedPostsPage(0);
      setFollowedPostsHasMore(true);

      followedPostsLoadingRef.current = true;
      followedPostsLoadingMoreRef.current = false;
      followedPostsHasMoreRef.current = true;
      followedPostsPageRef.current = 0;

      try {
        const order = `date_${sortDirection}`;
        const data = await getFollowedPostsOrdered(selectedUser.id, order, 0, pageSize);

        const normalizedPosts =
          (Array.isArray(data?.posts) && data.posts) ||
          (Array.isArray(data?.content) && data.content) ||
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.data) && data.data) ||
          [];

        const isLast = Boolean(data?.last);

        if (!isMounted) return;
        setFollowedPosts(normalizedPosts);
        setFollowedPostsHasMore(!isLast && normalizedPosts.length === pageSize);
        followedPostsHasMoreRef.current = !isLast && normalizedPosts.length === pageSize;
      } catch (err) {
        if (!isMounted) return;
        setFollowedPosts([]);
        setFollowedPostsError(err?.message || 'Erro ao carregar posts');
        setFollowedPostsHasMore(false);
        followedPostsHasMoreRef.current = false;
      } finally {
        if (!isMounted) return;
        setFollowedPostsLoading(false);
        followedPostsLoadingRef.current = false;
      }
    };

    loadFirstPage().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id, sortDirection]);

  const reloadPosts = async () => {
    if (!selectedUserIdRef.current) return;
    if (followedPostsLoadingRef.current) return;

    setFollowedPostsLoading(true);
    setFollowedPostsError(null);
    setFollowedPostsPage(0);
    setFollowedPostsHasMore(true);

    followedPostsLoadingRef.current = true;
    followedPostsLoadingMoreRef.current = false;
    followedPostsHasMoreRef.current = true;
    followedPostsPageRef.current = 0;

    try {
      const order = `date_${sortDirectionRef.current}`;
      const data = await getFollowedPostsOrdered(selectedUserIdRef.current, order, 0, pageSize);

      const normalizedPosts =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data?.content) && data.content) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        [];

      const isLast = Boolean(data?.last);

      setFollowedPosts(normalizedPosts);
      setFollowedPostsHasMore(!isLast && normalizedPosts.length === pageSize);
      followedPostsHasMoreRef.current = !isLast && normalizedPosts.length === pageSize;
    } catch (err) {
      setFollowedPosts([]);
      setFollowedPostsError(err?.message || 'Erro ao carregar posts');
      setFollowedPostsHasMore(false);
      followedPostsHasMoreRef.current = false;
    } finally {
      setFollowedPostsLoading(false);
      followedPostsLoadingRef.current = false;
    }
  };

  const loadMorePosts = async () => {
    const selectedId = selectedUserIdRef.current;
    if (!selectedId) return;
    if (followedPostsLoadingRef.current || followedPostsLoadingMoreRef.current) return;
    if (!followedPostsHasMoreRef.current) return;

    const nextPage = followedPostsPageRef.current + 1;

    followedPostsLoadingMoreRef.current = true;
    setFollowedPostsLoadingMore(true);
    setFollowedPostsError(null);

    try {
      const order = `date_${sortDirectionRef.current}`;
      const data = await getFollowedPostsOrdered(selectedId, order, nextPage, pageSize);

      const normalizedPosts =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data?.content) && data.content) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        [];

      const isLast = Boolean(data?.last);

      setFollowedPosts((prev) => {
        const prevArr = Array.isArray(prev) ? prev : [];
        const seen = new Set(prevArr.map((p) => p?.postId ?? `${p?.userId}-${p?.date}`));
        const next = normalizedPosts.filter(
          (p) => !seen.has(p?.postId ?? `${p?.userId}-${p?.date}`)
        );
        return [...prevArr, ...next];
      });

      setFollowedPostsPage(nextPage);
      setFollowedPostsHasMore(!isLast && normalizedPosts.length === pageSize);

      followedPostsPageRef.current = nextPage;
      followedPostsHasMoreRef.current = !isLast && normalizedPosts.length === pageSize;
    } catch (err) {
      setFollowedPostsError(err?.message || 'Erro ao carregar mais posts');
      setFollowedPostsHasMore(false);
      followedPostsHasMoreRef.current = false;
    } finally {
      setFollowedPostsLoadingMore(false);
      followedPostsLoadingMoreRef.current = false;
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
            loadMorePosts().catch(() => {});
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

  useEffect(() => {
    setLikesCountByPostId((prev) => {
      const next = { ...prev };
      posts.forEach((p) => {
        if (p?.postId == null) return;
        if (next[p.postId] == null && p.likesCount != null) {
          next[p.postId] = p.likesCount;
        }
      });
      return next;
    });
  }, [posts]);

  const toggleLike = async (postId) => {
    if (!postId) return;
    if (!selectedUser?.id) return;
    if (toggleLoadingByPostId[postId]) return;

    const wasLiked = Boolean(likedByPostId[postId]);

    setToggleLoadingByPostId((prev) => ({ ...prev, [postId]: true }));
    setLikedByPostId((prev) => ({ ...prev, [postId]: !wasLiked }));
    setLikesCountByPostId((prev) => {
      const current = prev[postId];
      const fallback = posts.find((p) => p.postId === postId)?.likesCount ?? 0;
      const base = current != null ? current : fallback;
      const nextValue = Math.max(0, base + (wasLiked ? -1 : 1));
      return { ...prev, [postId]: nextValue };
    });

    try {
      if (wasLiked) {
        await unlikePost(postId, selectedUser.id);
      } else {
        await likePost(postId, selectedUser.id);
      }
    } catch (err) {
      setLikedByPostId((prev) => ({ ...prev, [postId]: wasLiked }));
      setLikesCountByPostId((prev) => {
        const current = prev[postId];
        const fallback = posts.find((p) => p.postId === postId)?.likesCount ?? 0;
        const base = current != null ? current : fallback;
        const rolledBack = Math.max(0, base + (wasLiked ? 1 : -1));
        return { ...prev, [postId]: rolledBack };
      });
      // opcional: você pode querer mostrar err?.message no UI
    } finally {
      setToggleLoadingByPostId((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Feed de publicações</h2>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            disabled={!canLoad || followedPostsLoading}
            onClick={toggleSortDirection}
            style={{
              border: '1px solid #e6e6e6',
              background: '#fff',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: !canLoad || followedPostsLoading ? 'not-allowed' : 'pointer',
              opacity: !canLoad || followedPostsLoading ? 0.6 : 1,
              fontWeight: 600,
            }}
          >
            Data: {sortDirection === 'asc' ? 'mais antigas' : 'mais novas'}
          </button>

          <button
            type="button"
            disabled={!canLoad || followedPostsLoading}
            onClick={() => reloadPosts()}
            style={{
              border: '1px solid #e6e6e6',
              background: '#fff',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: !canLoad || followedPostsLoading ? 'not-allowed' : 'pointer',
              opacity: !canLoad || followedPostsLoading ? 0.6 : 1,
              fontWeight: 600,
            }}
          >
            Recarregar
          </button>
        </div>
      </div>

      {!canLoad && (
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 10, background: '#fff' }}>
          Selecione um usuário para ver o feed.
        </div>
      )}

      {followedPostsLoading && <div>Carregando posts...</div>}
      {followedPostsError && <div>Erro: {followedPostsError}</div>}

      {canLoad && !followedPostsLoading && !followedPostsError && posts.length === 0 && (
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 10, background: '#fff' }}>
          Nenhuma publicação encontrada.
        </div>
      )}

      {posts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {posts.map((p) => (
            <PostCard
              key={p.postId ?? `${p.userId}-${p.date}`}
              postId={p.postId}
              date={p.date}
              product={p.product}
              category={p.category}
              price={p.price}
              hasPromo={p.hasPromo}
              discount={p.discount}
              likesCount={likesCountByPostId[p.postId] ?? p.likesCount}
              liked={Boolean(likedByPostId[p.postId])}
              onToggleLike={() => toggleLike(p.postId)}
            />
          ))}

          {followedPostsLoadingMore && <div>Carregando mais...</div>}
        </div>
      )}
    </div>
  );
};

export default FeedDePublicacoes;
