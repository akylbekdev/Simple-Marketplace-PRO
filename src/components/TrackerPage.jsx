import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase';
import '../styles/TrackerPage.css';

const TODAY = new Date().toISOString().slice(0, 10);

function formatMoney(amount, suffix) {
  return `${Number(amount).toLocaleString('ru-RU')} ${suffix}`;
}

export default function TrackerPage({ user, authLoading, t }) {
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(TODAY);
  const [filterCategory, setFilterCategory] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');

  const isAnonymous = Boolean(user?.isAnonymous);
  const canUse = user && !isAnonymous && isFirebaseReady;

  /* ── Realtime subscription ── */
  useEffect(() => {
    if (!canUse) {
      setLoadingExpenses(false);
      return;
    }

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingExpenses(false);
      },
      () => setLoadingExpenses(false)
    );
    return () => unsub();
  }, [canUse, user?.uid]);

  /* ── Add expense ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) { setFormError(t.trackerExpenseName + ' — обязательно'); return; }
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) { setFormError(t.trackerExpenseAmountPlaceholder); return; }
    if (!category) { setFormError(t.trackerExpenseCategory + ' — обязательно'); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        title: title.trim(),
        amount: num,
        category,
        date,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setAmount('');
      setCategory('');
      setDate(TODAY);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete expense ── */
  const handleDelete = async (id) => {
    if (!window.confirm(t.trackerDeleteConfirm)) return;
    await deleteDoc(doc(db, 'expenses', id));
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = expenses;
    if (filterCategory) list = list.filter((ex) => ex.category === filterCategory);
    if (periodFilter === 'month') {
      const ym = TODAY.slice(0, 7);
      list = list.filter((ex) => ex.date && ex.date.startsWith(ym));
    }
    return list;
  }, [expenses, filterCategory, periodFilter]);

  const total = useMemo(() => filtered.reduce((s, ex) => s + (ex.amount || 0), 0), [filtered]);

  /* ── Category totals ── */
  const categoryTotals = useMemo(() => {
    const map = {};
    filtered.forEach((ex) => {
      map[ex.category] = (map[ex.category] || 0) + (ex.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const cats = t.trackerCategories;
  const suffix = t.currencySuffix;

  /* ── Loading state ── */
  if (authLoading) {
    return (
      <div className="container">
        <div className="tracker-loading">
          <div className="tracker-spinner" />
          <span>{t.userLoading}</span>
        </div>
      </div>
    );
  }

  if (!canUse) {
    return (
      <div className="container">
        <div className="tracker-login-prompt">
          <div className="tracker-login-icon">💸</div>
          <h2>{t.trackerTitle}</h2>
          <p>{t.trackerLoginRequired}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="tracker-page">

        {/* ── Header ── */}
        <div className="tracker-header">
          <div className="tracker-header-copy">
            <h2>{t.trackerTitle}</h2>
            <p>{t.trackerDesc}</p>
          </div>
          <div className="tracker-total-badge">
            <span className="tracker-total-label">{t.trackerTotal}</span>
            <span className="tracker-total-value">{formatMoney(total, suffix)}</span>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="tracker-filters">
          <select
            className="tracker-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">{t.trackerFilterAll}</option>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="tracker-period-tabs">
            <button
              type="button"
              className={`tracker-tab ${periodFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPeriodFilter('all')}
            >
              {t.trackerAllTime}
            </button>
            <button
              type="button"
              className={`tracker-tab ${periodFilter === 'month' ? 'active' : ''}`}
              onClick={() => setPeriodFilter('month')}
            >
              {t.trackerThisMonth}
            </button>
          </div>
        </div>

        <div className="tracker-body">

          {/* ── Add form ── */}
          <div className="tracker-form-card">
            <h3>{t.trackerAddTitle}</h3>
            {formError && <div className="tracker-form-error">{formError}</div>}
            <form className="tracker-form" onSubmit={handleAdd}>
              <label className="tracker-field">
                <span>{t.trackerExpenseName}</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.trackerExpenseNamePlaceholder}
                />
              </label>
              <label className="tracker-field">
                <span>{t.trackerExpenseAmount}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t.trackerExpenseAmountPlaceholder}
                />
              </label>
              <label className="tracker-field">
                <span>{t.trackerExpenseCategory}</span>
                <select
                  className="tracker-field-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">—</option>
                  {cats.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="tracker-field">
                <span>{t.trackerExpenseDate}</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={TODAY}
                />
              </label>
              <button className="tracker-add-btn" type="submit" disabled={saving}>
                {saving ? t.trackerSavingBtn : t.trackerAddBtn}
              </button>
            </form>
          </div>

          {/* ── Right column: stats + list ── */}
          <div className="tracker-right">

            {/* Category breakdown */}
            {categoryTotals.length > 0 && (
              <div className="tracker-breakdown-card">
                {categoryTotals.map(([cat, sum]) => {
                  const pct = total > 0 ? Math.round((sum / total) * 100) : 0;
                  return (
                    <div key={cat} className="tracker-breakdown-row">
                      <span className="tracker-breakdown-cat">{cat}</span>
                      <div className="tracker-breakdown-bar-wrap">
                        <div
                          className="tracker-breakdown-bar"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="tracker-breakdown-sum">
                        {formatMoney(sum, suffix)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Expense list */}
            <div className="tracker-list-card">
              {loadingExpenses ? (
                <div className="tracker-loading">
                  <div className="tracker-spinner" />
                  <span>{t.trackerLoadingMsg}</span>
                </div>
              ) : filtered.length === 0 ? (
                <p className="tracker-empty">{t.trackerNoExpenses}</p>
              ) : (
                <ul className="tracker-list">
                  {filtered.map((ex) => (
                    <li key={ex.id} className="tracker-item">
                      <div className="tracker-item-left">
                        <span className="tracker-item-cat-badge">{ex.category}</span>
                        <div className="tracker-item-info">
                          <span className="tracker-item-title">{ex.title}</span>
                          <span className="tracker-item-date">{ex.date}</span>
                        </div>
                      </div>
                      <div className="tracker-item-right">
                        <span className="tracker-item-amount">
                          {formatMoney(ex.amount, suffix)}
                        </span>
                        <button
                          type="button"
                          className="tracker-del-btn"
                          onClick={() => handleDelete(ex.id)}
                          aria-label={t.delete}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
