const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export async function getTopUsers() {

  const response = await fetch(`${baseUrl}/users/top`);

  if (!response.ok) {
    throw new Error(`Failed to fetch top users: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function follow(follower, followed){
  const response = await fetch(`${baseUrl}/users/${follower}/follow/${followed}`,{
      method: 'POST',
      });

  if (!response.ok) {
    throw new Error(`Failed to follow user: ${response.status} ${response.statusText}`);
  }

  return true;
}

export async function unfollow(follower, followed){
  const response = await fetch(`${baseUrl}/users/${follower}/unfollow/${followed}`,{
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to unfollow user: ${response.status} ${response.statusText}`);
  }

  return true;
}

export async function getFollowingByUserId(userId) {
  const response = await fetch(`${baseUrl}/users/${userId}/followed/list`);

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

  if (!response.ok) {
    throw new Error(`Failed to like post: ${response.status} ${response.statusText}`);
  }

  return true;
}

export async function unlikePost(postId, userId) {
  const response = await fetch(`${baseUrl}/products/${postId}/unlike/${userId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to unlike post: ${response.status} ${response.statusText}`);
  }

  return true;
}