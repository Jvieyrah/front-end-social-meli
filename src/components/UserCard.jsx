
import React from 'react';

const UserCard = ({
  username,
  followersCount = null,
  onToggleFollow,
  imageUrl,
  isFollowing,
}) => {
  const resolvedImageUrl = imageUrl || `${process.env.PUBLIC_URL}/user.png`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img
        src={resolvedImageUrl}
        alt={username}
        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
      />

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{username}</div>
          {followersCount !== null && (
        <div style={{ fontSize: 12, opacity: 0.8 }}>{followersCount} followers</div>
          )}
      </div>

      <button
        type="button"
        onClick={onToggleFollow}
        style={{
          background: 'var(--andes-color-blue-500, #3483fa)',
          borderRadius: 4,
          color: '#fff',
          display: 'flex',
          flexDirection: 'row',
          fontSize: 12,
          fontWeight: 600,
          justifyContent: 'center',
          lineHeight: '12px',
          margin: '0 8px 12px',
          padding: '7px 8px',
          textDecoration: 'none',
          width: 104,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default UserCard;

