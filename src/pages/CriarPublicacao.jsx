
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../services/UserContext';
import { PRODUCT_CATEGORIES } from '../constants/productCategories';

const parseToIsoDate = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const brMatch = raw.match(/^([0-3]?\d)\/([01]?\d)\/(\d{4})$/);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const year = Number(brMatch[3]);
    const date = new Date(year, month - 1, day);
    const isValid =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!isValid) return null;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  const isoMatch = raw.match(/^(\d{4})-([01]\d)-([0-3]\d)$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const date = new Date(year, month - 1, day);
    const isValid =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
    if (!isValid) return null;
    return raw;
  }

  return null;
};

const formatApiErrorMessage = (message) => {
  return String(message ?? '').trim();
};

const CriarPublicacao = () => {
  const {
    selectedUser,
    createPublication,
    createPublicationLoading,
    createPublicationError,
    createPublicationSuccess,
    resetCreatePublicationState,
  } = useContext(UserContext);

  const [form, setForm] = useState({
    date: '',
    product_id: '',
    product_name: '',
    type: '',
    brand: '',
    color: '',
    notes: '',
    category: '',
    price: '',
    hasPromo: false,
    discount: '',
  });

  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    resetCreatePublicationState?.();
    setSubmitError(null);

    return () => {
      resetCreatePublicationState?.();
    };
  }, []);

  const canLoad = Boolean(selectedUser?.id);

  const errors = useMemo(() => {
    const next = {};

    if (!canLoad) {
      next.userId = 'Selecione um usuário antes de publicar.';
    }

    if (!form.date) next.date = 'Data é obrigatória.';
    else if (!parseToIsoDate(form.date)) next.date = 'Data inválida. Use dd/mm/aaaa.';

    const productIdNumber = Number(form.product_id);
    if (!form.product_id) next.product_id = 'ID do produto é obrigatório.';
    else if (Number.isNaN(productIdNumber) || productIdNumber <= 0) next.product_id = 'ID do produto inválido.';

    if (!form.product_name?.trim()) next.product_name = 'Nome do produto é obrigatório.';
    if (!form.type?.trim()) next.type = 'Tipo é obrigatório.';
    if (!form.brand?.trim()) next.brand = 'Marca é obrigatória.';
    if (!form.color?.trim()) next.color = 'Cor é obrigatória.';

    const categoryNumber = Number(form.category);
    if (form.category === '' || form.category == null) next.category = 'Categoria é obrigatória.';
    else if (Number.isNaN(categoryNumber) || categoryNumber < 1) next.category = 'Categoria inválida.';

    const priceNumber = Number(form.price);
    if (!form.price) next.price = 'Preço é obrigatório.';
    else if (Number.isNaN(priceNumber) || priceNumber <= 0) next.price = 'Preço deve ser maior que zero.';

    if (form.hasPromo) {
      const discountNumber = Number(form.discount);
      if (form.discount === '' || form.discount == null) next.discount = 'Desconto é obrigatório para promo.';
      else if (Number.isNaN(discountNumber) || discountNumber < 0) next.discount = 'Desconto inválido.';
      else if (discountNumber > 100) next.discount = 'Desconto deve ser menor ou igual a 100.';
    }

    return next;
  }, [form, canLoad]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleBlur = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    resetCreatePublicationState?.();

    setTouched({
      date: true,
      product_id: true,
      product_name: true,
      type: true,
      brand: true,
      color: true,
      category: true,
      price: true,
      discount: true,
    });

    if (!isValid) return;

    const isoDate = parseToIsoDate(form.date);
    if (!isoDate) {
      setSubmitError('Data inválida. Use dd/mm/aaaa.');
      return;
    }

    const payload = {
      userId: selectedUser.id,
      date: isoDate,
      product: {
        product_id: Number(form.product_id),
        product_name: form.product_name,
        type: form.type,
        brand: form.brand,
        color: form.color,
        notes: form.notes,
      },
      category: Number(form.category),
      price: Number(form.price),
      hasPromo: Boolean(form.hasPromo),
      ...(form.hasPromo
        ? {
            discount: Number(form.discount),
          }
        : {}),
    };

    try {
      await createPublication(payload);
      setForm({
        date: '',
        product_id: '',
        product_name: '',
        type: '',
        brand: '',
        color: '',
        notes: '',
        category: '',
        price: '',
        hasPromo: false,
        discount: '',
      });
      setTouched({});
      setSubmitError(null);
    } catch (err) {
      setSubmitError(err?.message || 'Falha ao publicar.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 14,
    boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, marginBottom: 6 };

  const errorTextStyle = { marginTop: 6, fontSize: 12, color: '#b00020' };

  const publishErrorMessage = useMemo(() => {
    return formatApiErrorMessage(submitError || createPublicationError);
  }, [submitError, createPublicationError]);

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Criar publicação</h2>

      {!canLoad && (
        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 10, background: '#fff' }}>
          Selecione um usuário para publicar.
        </div>
      )}

      {createPublicationSuccess && (
        <div style={{ padding: 12, border: '1px solid #c8f3d2', borderRadius: 10, background: '#eefcf1' }}>
          Publicação criada com sucesso.
        </div>
      )}

      {Boolean(submitError || createPublicationError) && (
        <div style={{ padding: 12, border: '1px solid #ffd0d0', borderRadius: 10, background: '#fff5f5' }}>
          {publishErrorMessage || 'Erro ao publicar.'}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <div style={labelStyle}>Data</div>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              placeholder="DD/MM/AAAA"
              style={inputStyle}
              disabled={createPublicationLoading}
            />
            {touched.date && errors.date && <div style={errorTextStyle}>{errors.date}</div>}
          </div>

          <div>
            <div style={labelStyle}>Categoria</div>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              style={inputStyle}
              disabled={createPublicationLoading}
            >
              <option value="">Selecione...</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {touched.category && errors.category && <div style={errorTextStyle}>{errors.category}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <div style={labelStyle}>Preço</div>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              onBlur={() => handleBlur('price')}
              style={inputStyle}
              disabled={createPublicationLoading}
            />
            {touched.price && errors.price && <div style={errorTextStyle}>{errors.price}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={form.hasPromo}
                onChange={(e) => setField('hasPromo', e.target.checked)}
                disabled={createPublicationLoading}
              />
              É promoção?
            </label>
          </div>
        </div>

        {form.hasPromo && (
          <div>
            <div style={labelStyle}>Desconto (%)</div>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => setField('discount', e.target.value)}
              onBlur={() => handleBlur('discount')}
              style={inputStyle}
              disabled={createPublicationLoading}
            />
            {touched.discount && errors.discount && <div style={errorTextStyle}>{errors.discount}</div>}
          </div>
        )}

        <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 12, background: '#fff' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Produto</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <div>
              <div style={labelStyle}>ID do produto</div>
              <input
                type="number"
                value={form.product_id}
                onChange={(e) => setField('product_id', e.target.value)}
                onBlur={() => handleBlur('product_id')}
                style={inputStyle}
                disabled={createPublicationLoading}
              />
              {touched.product_id && errors.product_id && <div style={errorTextStyle}>{errors.product_id}</div>}
            </div>

            <div>
              <div style={labelStyle}>Nome</div>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => setField('product_name', e.target.value)}
                onBlur={() => handleBlur('product_name')}
                style={inputStyle}
                disabled={createPublicationLoading}
              />
              {touched.product_name && errors.product_name && (
                <div style={errorTextStyle}>{errors.product_name}</div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
            <div>
              <div style={labelStyle}>Tipo</div>
              <input
                type="text"
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                onBlur={() => handleBlur('type')}
                style={inputStyle}
                disabled={createPublicationLoading}
              />
              {touched.type && errors.type && <div style={errorTextStyle}>{errors.type}</div>}
            </div>

            <div>
              <div style={labelStyle}>Marca</div>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setField('brand', e.target.value)}
                onBlur={() => handleBlur('brand')}
                style={inputStyle}
                disabled={createPublicationLoading}
              />
              {touched.brand && errors.brand && <div style={errorTextStyle}>{errors.brand}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
            <div>
              <div style={labelStyle}>Cor</div>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setField('color', e.target.value)}
                onBlur={() => handleBlur('color')}
                style={inputStyle}
                disabled={createPublicationLoading}
              />
              {touched.color && errors.color && <div style={errorTextStyle}>{errors.color}</div>}
            </div>

            <div>
              <div style={labelStyle}>Observações</div>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                style={inputStyle}
                disabled={createPublicationLoading}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || createPublicationLoading}
          style={{
              color: '#fff',
              display: 'flex',
              background: !isValid || createPublicationLoading ? '#f6f6f6' : 'var(--andes-color-blue-500, #3483fa)',
              fontSize: 12,
              justifyContent: 'center',
              lineHeight: '12px',
              margin: '0 8px 12px',
              textDecoration: 'none',
              width: "100%",
              border: 'none',
              borderRadius: 12,
              padding: '10px 14px',
              cursor: !isValid || createPublicationLoading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              opacity: !isValid || createPublicationLoading ? 0.7 : 1,
          }}

        >
          {createPublicationLoading ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
};

export default CriarPublicacao;


