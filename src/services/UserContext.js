import React, { createContext, useEffect, useState } from 'react';

import {
  createPost,
  createPromoPost,
  follow,
  getFollowedPosts,
  getFollowedPostsOrdered,
  getPromoPosts,
  getFollowersByUserId,
  getFollowersByUserIdOrdered,
  getFollowingByUserId,
  getFollowingByUserIdOrdered,
  getTopUsers,
} from './api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingUsersLoading, setFollowingUsersLoading] = useState(false);
  const [followingUsersError, setFollowingUsersError] = useState(null);

  const [followersUsers, setFollowersUsers] = useState([]);
  const [followersUsersLoading, setFollowersUsersLoading] = useState(false);
  const [followersUsersError, setFollowersUsersError] = useState(null);

  const [followedPosts, setFollowedPosts] = useState([]);
  const [followedPostsLoading, setFollowedPostsLoading] = useState(false);
  const [followedPostsError, setFollowedPostsError] = useState(null);

  const [promoPosts, setPromoPosts] = useState([]);
  const [promoPostsLoading, setPromoPostsLoading] = useState(false);
  const [promoPostsError, setPromoPostsError] = useState(null);

  const [createPublicationLoading, setCreatePublicationLoading] = useState(false);
  const [createPublicationError, setCreatePublicationError] = useState(null);
  const [createPublicationSuccess, setCreatePublicationSuccess] = useState(false);

  const resetCreatePublicationState = () => {
    setCreatePublicationLoading(false);
    setCreatePublicationError(null);
    setCreatePublicationSuccess(false);
  };

  const reloadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const data = await getTopUsers();

      const normalizedUsers =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.users) && data.users) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.content) && data.content) ||
        [];

      setUsers(
        normalizedUsers.map((u) => ({
          ...u,
          id: u?.id ?? u?.userId,
          name: u?.name ?? u?.userName,
        }))
      );
    } catch (err) {
      setUsers([]);
      setUsersError(err?.message || 'Erro ao carregar usuários');
    } finally {
      setUsersLoading(false);
    }
  };

  const createPublication = async (payload) => {
    setCreatePublicationLoading(true);
    setCreatePublicationError(null);
    setCreatePublicationSuccess(false);

    const selectedUserId = selectedUser?.id;
    if (!selectedUserId) {
      setCreatePublicationLoading(false);
      setCreatePublicationError('Selecione um usuário antes de publicar');
      throw new Error('Selecione um usuário antes de publicar');
    }

    if (payload?.userId != null && Number(payload.userId) !== Number(selectedUserId)) {
      setCreatePublicationLoading(false);
      setCreatePublicationError('Não é permitido publicar por outro usuário');
      throw new Error('Não é permitido publicar por outro usuário');
    }

    const normalizedPayload = {
      ...payload,
      userId: selectedUserId,
    };

    try {
      const result = normalizedPayload?.hasPromo
        ? await createPromoPost(normalizedPayload)
        : await createPost(normalizedPayload);

      setCreatePublicationSuccess(true);
      await Promise.all([reloadFollowedPosts(), reloadPromoPosts()]);
      return result;
    } catch (err) {
      setCreatePublicationError(err?.message || 'Erro ao criar publicação');
      throw err;
    } finally {
      setCreatePublicationLoading(false);
    }
  };

  const reloadFollowersUsers = async (userIdParam, orderParam) => {
    const userId = userIdParam ?? selectedUser?.id;
    if (!userId) {
      setFollowersUsers([]);
      setFollowersUsersLoading(false);
      setFollowersUsersError(null);
      return;
    }

    setFollowersUsersLoading(true);
    setFollowersUsersError(null);

    try {
      const data = orderParam
        ? await getFollowersByUserIdOrdered(userId, orderParam)
        : await getFollowersByUserId(userId);

      const normalizedUsers =
        (Array.isArray(data?.followers) && data.followers) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.users) && data.users) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.content) && data.content) ||
        [];

      setFollowersUsers(
        normalizedUsers.map((u) => ({
          ...u,
          id: u?.id ?? u?.userId,
          name: u?.name ?? u?.userName,
        }))
      );
    } catch (err) {
      setFollowersUsers([]);
      setFollowersUsersError(err?.message || 'Erro ao carregar seguidores');
    } finally {
      setFollowersUsersLoading(false);
    }
  };

  const followUser = async (targetUserId, followerIdParam) => {
    const followerId = followerIdParam ?? selectedUser?.id;
    if (!followerId || !targetUserId) return;

    await follow(followerId, targetUserId);
    await Promise.all([reloadFollowersUsers(followerId), reloadFollowingUsers(followerId)]);
  };

  const reloadFollowingUsers = async (userIdParam, orderParam) => {
    const userId = userIdParam ?? selectedUser?.id;
    if (!userId) {
      setFollowingUsers([]);
      setFollowingUsersLoading(false);
      setFollowingUsersError(null);
      return;
    }

    setFollowingUsersLoading(true);
    setFollowingUsersError(null);

    try {
      const data = orderParam
        ? await getFollowingByUserIdOrdered(userId, orderParam)
        : await getFollowingByUserId(userId);

      const normalizedUsers =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.followed) && data.followed) ||
        (Array.isArray(data?.users) && data.users) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.content) && data.content) ||
        [];

      setFollowingUsers(
        normalizedUsers.map((u) => ({
          ...u,
          id: u?.id ?? u?.userId,
          name: u?.name ?? u?.userName,
        }))
      );
    } catch (err) {
      setFollowingUsers([]);
      setFollowingUsersError(err?.message || 'Erro ao carregar seguindo');
    } finally {
      setFollowingUsersLoading(false);
    }
  };

  const reloadFollowedPosts = async (userIdParam, orderParam) => {
    const userId = userIdParam ?? selectedUser?.id;
    if (!userId) {
      setFollowedPosts([]);
      setFollowedPostsLoading(false);
      setFollowedPostsError(null);
      return;
    }

    setFollowedPostsLoading(true);
    setFollowedPostsError(null);

    try {
      const data = orderParam
        ? await getFollowedPostsOrdered(userId, orderParam)
        : await getFollowedPosts(userId);

      const normalizedPosts =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.content) && data.content) ||
        [];

      setFollowedPosts(
        normalizedPosts.map((p) => {
          const product = p?.product || {};

          return {
            ...p,
            product: {
              ...product,
              productId: product?.productId ?? product?.product_id,
              productName: product?.productName ?? product?.product_name,
            },
          };
        })
      );
    } catch (err) {
      setFollowedPosts([]);
      setFollowedPostsError(err?.message || 'Erro ao carregar posts seguidos');
    } finally {
      setFollowedPostsLoading(false);
    }
  };

  const reloadPromoPosts = async (userIdParam) => {
    const userId = userIdParam ?? selectedUser?.id;
    if (!userId) {
      setPromoPosts([]);
      setPromoPostsLoading(false);
      setPromoPostsError(null);
      return;
    }

    setPromoPostsLoading(true);
    setPromoPostsError(null);

    try {
      const data = await getPromoPosts(userId);

      const normalizedPosts =
        (Array.isArray(data?.posts) && data.posts) ||
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.content) && data.content) ||
        [];

      setPromoPosts(normalizedPosts);
    } catch (err) {
      setPromoPosts([]);
      setPromoPostsError(err?.message || 'Erro ao carregar promo posts');
    } finally {
      setPromoPostsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    reloadUsers().catch(() => {
      if (!isMounted) return;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    reloadFollowingUsers().catch(() => {});
  }, [selectedUser?.id]);

  useEffect(() => {
    reloadFollowersUsers().catch(() => {});
  }, [selectedUser?.id]);

  useEffect(() => {
    reloadFollowedPosts().catch(() => {});
  }, [selectedUser?.id]);

  useEffect(() => {
    reloadPromoPosts().catch(() => {});
  }, [selectedUser?.id]);

  return (
    <UserContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        users,
        usersLoading,
        usersError,
        reloadUsers,
        followingUsers,
        followingUsersLoading,
        followingUsersError,
        reloadFollowingUsers,
        followersUsers,
        followersUsersLoading,
        followersUsersError,
        reloadFollowersUsers,
        followedPosts,
        followedPostsLoading,
        followedPostsError,
        reloadFollowedPosts,
        promoPosts,
        promoPostsLoading,
        promoPostsError,
        reloadPromoPosts,
        createPublication,
        createPublicationLoading,
        createPublicationError,
        createPublicationSuccess,
        resetCreatePublicationState,
        followUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};