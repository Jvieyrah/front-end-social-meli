
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PostCard from '../components/PostCard';
import { UserContext } from '../services/UserContext';
import { getPromoPosts, likePost, unlikePost } from '../services/api';

const ProdutosEmPromocao = () => {
  const {
    selectedUser,
  } = useContext(UserContext);

  const [promoPosts, setPromoPosts] = useState([]);
  const [promoPostsLoading, setPromoPostsLoading] = useState(false);
  const [promoPostsLoadingMore, setPromoPostsLoadingMore] = useState(false);
  const [promoPostsError, setPromoPostsError] = useState(null);
  const [promoPostsPage, setPromoPostsPage] = useState(0);
  const [promoPostsHasMore, setPromoPostsHasMore] = useState(true);

  const [likedByPostId, setLikedByPostId] = useState({});
  const [likesCountByPostId, setLikesCountByPostId] = useState({});
  const [toggleLoadingByPostId, setToggleLoadingByPostId] = useState({});

  const pageSize = 4;

  const promoPostsLoadingRef = useRef(false);
  const promoPostsLoadingMoreRef = useRef(false);
  const promoPostsHasMoreRef = useRef(true);
  const promoPostsPageRef = useRef(0);
  const selectedUserIdRef = useRef(selectedUser?.id);
  const scrollTickingRef = useRef(false);

  const canLoad = Boolean(selectedUser?.id);

  const posts = useMemo(() => {
    return Array.isArray(promoPosts) ? promoPosts : [];
  }, [promoPosts]);

  useEffect(() => {
    if (!selectedUser?.id) {
      setPromoPosts([]);
      setPromoPostsError(null);
      setPromoPostsLoading(false);
      setPromoPostsLoadingMore(false);
      setPromoPostsPage(0);
      setPromoPostsHasMore(true);

      promoPostsLoadingRef.current = false;
      promoPostsLoadingMoreRef.current = false;
      promoPostsHasMoreRef.current = true;
      promoPostsPageRef.current = 0;
      selectedUserIdRef.current = null;
      return;
    }

    selectedUserIdRef.current = selectedUser.id;

    let isMounted = true;
    const loadFirstPage = async () => {
      setPromoPostsLoading(true);
      setPromoPostsError(null);
      setPromoPostsPage(0);
      setPromoPostsHasMore(true);

      promoPostsLoadingRef.current = true;
      promoPostsLoadingMoreRef.current = false;
      promoPostsHasMoreRef.current = true;
      promoPostsPageRef.current = 0;

      try {
        const data = await getPromoPosts(selectedUser.id, 0, pageSize);

        const normalizedPosts =
          (Array.isArray(data?.posts) && data.posts) ||
          (Array.isArray(data?.content) && data.content) ||
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.data) && data.data) ||
          [];

        const isLast = Boolean(data?.last);

        if (!isMounted) return;
        setPromoPosts(normalizedPosts);
        setPromoPostsHasMore(!isLast && normalizedPosts.length === pageSize);
        promoPostsHasMoreRef.current = !isLast && normalizedPosts.length === pageSize;
      } catch (err) {
        if (!isMounted) return;
        setPromoPosts([]);
        setPromoPostsError(err?.message || 'Erro ao carregar posts');
        setPromoPostsHasMore(false);
        promoPostsHasMoreRef.current = false;
      } finally {
        if (!isMounted) return;
        setPromoPostsLoading(false);
        promoPostsLoadingRef.current = false;
      }
    };

    loadFirstPage().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id]);

  const reloadPosts = async () => {
    if (!selectedUserIdRef.current) return;
    if (promoPostsLoadingRef.current) return;

    setPromoPostsLoading(true);
    setPromoPostsError(null);
    setPromoPostsPage(0);
    setPromoPostsHasMore(true);

    promoPostsLoadingRef.current = true;
    promoPostsLoadingMoreRef.current = false;
    promoPostsHasMoreRef.current = true;
    promoPostsPageRef.current = 0;

    try {
      const data = await getPromoPosts(selectedUserIdRef.current, 0, pageSize);

      const normalizedPosts =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data?.content) && data.content) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        [];

      const isLast = Boolean(data?.last);

      setPromoPosts(normalizedPosts);
      setPromoPostsHasMore(!isLast && normalizedPosts.length === pageSize);
      promoPostsHasMoreRef.current = !isLast && normalizedPosts.length === pageSize;
    } catch (err) {
      setPromoPosts([]);
      setPromoPostsError(err?.message || 'Erro ao carregar posts');
      setPromoPostsHasMore(false);
      promoPostsHasMoreRef.current = false;
    } finally {
      setPromoPostsLoading(false);
      promoPostsLoadingRef.current = false;
    }
  };

  const loadMorePosts = async () => {
    const selectedId = selectedUserIdRef.current;
    if (!selectedId) return;
    if (promoPostsLoadingRef.current || promoPostsLoadingMoreRef.current) return;
    if (!promoPostsHasMoreRef.current) return;

    const nextPage = promoPostsPageRef.current + 1;

    promoPostsLoadingMoreRef.current = true;
    setPromoPostsLoadingMore(true);
    setPromoPostsError(null);

    try {
      const data = await getPromoPosts(selectedId, nextPage, pageSize);

      const normalizedPosts =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data?.content) && data.content) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        [];

      const isLast = Boolean(data?.last);

      setPromoPosts((prev) => {
        const prevArr = Array.isArray(prev) ? prev : [];
        const seen = new Set(prevArr.map((p) => p?.postId ?? `${p?.userId}-${p?.date}`));
        const next = normalizedPosts.filter(
          (p) => !seen.has(p?.postId ?? `${p?.userId}-${p?.date}`)
        );
        return [...prevArr, ...next];
      });

      setPromoPostsPage(nextPage);
      setPromoPostsHasMore(!isLast && normalizedPosts.length === pageSize);

      promoPostsPageRef.current = nextPage;
      promoPostsHasMoreRef.current = !isLast && normalizedPosts.length === pageSize;
    } catch (err) {
      setPromoPostsError(err?.message || 'Erro ao carregar mais posts');
      setPromoPostsHasMore(false);
      promoPostsHasMoreRef.current = false;
    } finally {
      setPromoPostsLoadingMore(false);
      promoPostsLoadingMoreRef.current = false;
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
    } finally {
      setToggleLoadingByPostId((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Produtos em promoção</h2>

        <button
          type="button"
          disabled={!canLoad || promoPostsLoading}
          onClick={() => reloadPosts()}
          style={{
            border: '1px solid #e6e6e6',
            background: '#fff',
            borderRadius: 10,
            padding: '8px 12px',
            cursor: !canLoad || promoPostsLoading ? 'not-allowed' : 'pointer',
            opacity: !canLoad || promoPostsLoading ? 0.6 : 1,
            fontWeight: 600,
          }}
        >
          Recarregar
        </button>
      </div>

      {!canLoad && (
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 10, background: '#fff' }}>
          Selecione um usuário para ver os produtos em promoção.
        </div>
      )}

      {promoPostsLoading && <div>Carregando posts...</div>}
      {promoPostsError && <div>Erro: {promoPostsError}</div>}

      {canLoad && !promoPostsLoading && !promoPostsError && posts.length === 0 && (
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

          {promoPostsLoadingMore && <div>Carregando mais...</div>}
        </div>
      )}
    </div>
  );
};

export default ProdutosEmPromocao;


