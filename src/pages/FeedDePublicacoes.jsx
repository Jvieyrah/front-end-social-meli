import React, { useContext, useEffect, useMemo, useState } from 'react';
import PostCard from '../components/PostCard';
import { UserContext } from '../services/UserContext';
import { likePost, unlikePost } from '../services/api';

const FeedDePublicacoes = () => {
  const {
    selectedUser,
    followedPosts,
    followedPostsLoading,
    followedPostsError,
    reloadFollowedPosts,
  } = useContext(UserContext);

  const [likedByPostId, setLikedByPostId] = useState({});
  const [likesCountByPostId, setLikesCountByPostId] = useState({});
  const [toggleLoadingByPostId, setToggleLoadingByPostId] = useState({});

  const canLoad = Boolean(selectedUser?.id);

  const posts = useMemo(() => {
    return Array.isArray(followedPosts) ? followedPosts : [];
  }, [followedPosts]);

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

        <button
          type="button"
          disabled={!canLoad || followedPostsLoading}
          onClick={() => reloadFollowedPosts()}
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
        </div>
      )}
    </div>
  );
};

export default FeedDePublicacoes;
