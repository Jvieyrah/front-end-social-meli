const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function extractErrorMessage(response) {
  try {
    const text = await response.clone().text();
    if (text && text.trim()) {
      try {
        const data = JSON.parse(text);
        if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();
      } catch (e) {
        return text.trim();
      }
    }
  } catch (e) {
    // ignore
  }

  return `${response.status} ${response.statusText}`;
}

async function safeReadJson(response) {
  const text = await response.text();
  if (!text || !text.trim()) return null;
  return JSON.parse(text);
}

export async function getTopUsers() {

  const response = await fetch(`${baseUrl}/users/top`);

  if (!response.ok) {
    throw new Error(`Failed to fetch top users: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getFollowedPostsOrdered(userId, order, page, size) {
  const queryString = buildQueryString({ order, page, size });
  const response = await fetch(`${baseUrl}/products/followed/${userId}/list${queryString}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch followed posts by user ID: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getPromoPosts(userId, page, size) {
  const queryString = buildQueryString({ userId, page, size });
  const response = await fetch(`${baseUrl}/products/promo-pub/list${queryString}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch promo posts: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getFollowersByUserIdOrdered(userId, order, page, size) {
  const queryString = buildQueryString({ order, page, size });
  const response = await fetch(`${baseUrl}/users/${userId}/followers/list${queryString}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch followers by user ID: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function follow(follower, followed){
  const response = await fetch(`${baseUrl}/users/${follower}/follow/${followed}`,{
      method: 'POST',
      });

  return true;
}

export async function createPost(payload) {
  const response = await fetch(`${baseUrl}/products/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const msg = await extractErrorMessage(response);
    throw new Error(msg);
  }

  return safeReadJson(response);
}

export async function createPromoPost(payload) {
  const response = await fetch(`${baseUrl}/products/promo-pub`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const msg = await extractErrorMessage(response);
    throw new Error(msg);
  }

  return safeReadJson(response);
}

export async function getProductById(productId) {
  const response = await fetch(`${baseUrl}/products/${productId}`);

  if (!response.ok) {
    const msg = await extractErrorMessage(response);
    throw new Error(msg);
  }

  return safeReadJson(response);
}

export async function unfollow(follower, followed){
  const response = await fetch(`${baseUrl}/users/${follower}/unfollow/${followed}`,{
    method: 'POST',
  });
  return true;
}

export async function getFollowingByUserId(userId) {
  const response = await fetch(`${baseUrl}/users/${userId}/followed/list`);

  if (!response.ok) {
    throw new Error(`Failed to fetch followed by user ID: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getFollowingByUserIdOrdered(userId, order, page, size) {
  const queryString = buildQueryString({ order, page, size });
  const response = await fetch(`${baseUrl}/users/${userId}/followed/list${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch followed by user ID: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getFollowersByUserId(userId) {
  const response = await fetch(`${baseUrl}/users/${userId}/followers/list`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch followers by user ID: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getFollowedPosts(userId) {
  const response = await fetch(`${baseUrl}/products/followed/${userId}/list`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch followed posts by user ID: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function likePost(postId, userId) {
  const response = await fetch(`${baseUrl}/products/${postId}/like/${userId}`, {
    method: 'POST',
  });

  return true;
}

export async function unlikePost(postId, userId) {
  const response = await fetch(`${baseUrl}/products/${postId}/unlike/${userId}`, {
    method: 'POST',
  });

  return true;
}