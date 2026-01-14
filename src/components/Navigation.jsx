import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <nav
      style={{
        width: '100%',
        boxSizing: 'border-box',
        borderBottom: 'solid 1px #e6e6e6',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>Menu</div>

        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            lineHeight: 0,
            borderRadius: 6,
          }}
        >
          <span style={{ fontSize: 22 }}>
            {isOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {isOpen && (
        <ul
          style={{
            position: 'relative',
            background: '#fff',
            listStyle: 'none',
            margin: 0,
            padding: '16px 0',
            borderBottom: 0,
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        >
          <li style={{ padding: '10px 16px' }}>
            <Link to="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: '#333' }}>
              Home
            </Link>
          </li>
          <li style={{ padding: '10px 16px' }}>
            <Link
              to="/quem-me-segue"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              Quem me segue
            </Link>
          </li>
          <li style={{ padding: '10px 16px' }}>
            <Link
              to="/quem-eu-sigo"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              Quem eu sigo
            </Link>
          </li>
          <li style={{ padding: '10px 16px' }}>
            <Link
              to="/feed-de-publicacoes"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              Feed de publicações
            </Link>
          </li>
          <li style={{ padding: '10px 16px' }}>
            <Link
              to="/criar-publicacao"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              Criar publicação
            </Link>
          </li>
          <li style={{ padding: '10px 16px' }}>
            <Link
              to="/produtos-em-promocao"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              Produtos em promoção
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navigation;