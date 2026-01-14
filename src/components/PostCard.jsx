import React from 'react';
import { PRODUCT_CATEGORY_BY_ID } from '../constants/productCategories';

const PostCard = ({ postId, date, product, category, price, hasPromo, discount, likesCount, liked, onToggleLike }) => {
  const resolvedProduct = product || {};
  const productName = resolvedProduct.productName || 'Produto';
  const formattedDate = date ? new Date(date).toLocaleDateString() : '';
  const coverSrc = `${process.env.PUBLIC_URL}/post.png`;

  const categoryName = category != null ? PRODUCT_CATEGORY_BY_ID[category]?.name : undefined;
  const formattedPrice =
    price != null
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
      : undefined;
  const formattedDiscount =
    discount != null
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)
      : undefined;

  return (
    <article
      style={{
        border: '1px solid #e6e6e6',
        borderRadius: 12,
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Post #{postId}</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{formattedDate}</div>
        </div>

        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={Boolean(liked)}
          style={{
            background: Boolean(liked)
              ? 'var(--andes-color-blue-500, #3483fa)'
              : 'rgba(52,131,250,0.12)',
            color: Boolean(liked) ? '#fff' : '#3483fa',
            border: 'none',
            borderRadius: 999,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: '14px' }}>{Boolean(liked) ? '♥' : '♡'}</span>
          {Boolean(liked) ? 'Deslike' : 'Like'}
        </button>
      </header>

      <img
        src={coverSrc}
        alt="Ilustração do post"
        style={{
          width: '100%',
          height: 180,
          objectFit: 'cover',
          display: 'block',
          background: '#f4f4f4',
        }}
      />

      <div style={{ padding: 14, display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gap: 2 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
            {productName}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {resolvedProduct.type ? `${resolvedProduct.type}` : ''}
            {resolvedProduct.brand ? ` • ${resolvedProduct.brand}` : ''}
            {resolvedProduct.color ? ` • ${resolvedProduct.color}` : ''}
          </div>
        </div>

        {(formattedPrice || categoryName || likesCount != null || hasPromo) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {formattedPrice && (
              <span
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: '#f4f4f4',
                }}
              >
                {formattedPrice}
              </span>
            )}

            {categoryName && (
              <span
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: '#f4f4f4',
                }}
              >
                {categoryName}
              </span>
            )}

            {Boolean(hasPromo) && (
              <span
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'rgba(0, 166, 80, 0.12)',
                  color: '#00a650',
                  fontWeight: 700,
                }}
              >
                Promo{formattedDiscount ? ` -${formattedDiscount}` : ''}
              </span>
            )}

            {likesCount != null && (
              <span
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: '#f4f4f4',
                }}
              >
                {likesCount} curtidas
              </span>
            )}
          </div>
        )}

        {resolvedProduct.notes && (
          <div
            style={{
              fontSize: 13,
              lineHeight: '18px',
              background: '#fafafa',
              border: '1px solid #eee',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            {resolvedProduct.notes}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {resolvedProduct.productId != null && (
            <span
              style={{
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                background: '#f4f4f4',
              }}
            >
              Produto #{resolvedProduct.productId}
            </span>
          )}
          {resolvedProduct.type && (
            <span
              style={{
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                background: '#f4f4f4',
              }}
            >
              {resolvedProduct.type}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;

