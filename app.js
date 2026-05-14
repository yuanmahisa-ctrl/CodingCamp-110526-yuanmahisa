/**
 * Expense & Budget Visualizer
 * Vanilla JS — No framework
 * Features: transactions, custom categories, monthly summary, spending limit alert
 * Data persisted via localStorage
 */

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY            = 'expense_visualizer_transactions';
const STORAGE_KEY_CATEGORIES = 'expense_visualizer_custom_categories';
const STORAGE_KEY_LIMIT      = 'expense_visualizer_budget_limit';

// ─── Default / Built-in Categories ───────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { name: 'Food',      icon: '🍔', color: '#f97316' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Fun',       icon: '🎉', color: '#a855f7' },
];

// Palette for auto-assigning colors to new custom categories
const CUSTOM_PALETTE = [
  '#10b981', '#f43f5e', '#0ea5e9', '#eab308',
  '#6366f1', '#14b8a6', '#ec4899', '#84cc16',
  '#8b5cf6', '#06b6d4',
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────
// Defined early so they can be used when loading initial state below.

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {{ id: string, name: string, amount: number, category: string, timestamp: number }[]} */
let transactions = loadFromStorage(STORAGE_KEY, []);

/** @type {{ name: string, icon: string, color: string }[]} */
let customCategories = loadFromStorage(STORAGE_KEY_CATEGORIES, []);

/** @type {number|null} */
let budgetLimit = loadFromStorage(STORAGE_KEY_LIMIT, null);

/** @type {Chart|null} */
let pieChart = null;

// ─── DOM References ───────────────────────────────────────────────────────────
// All DOM queries are done inside init() after DOMContentLoaded fires,
// so every getElementById/querySelector is guaranteed to find its element.

let form, itemNameInput, amountInput, categorySelect;
let totalBalanceEl, balanceLimitEl, balanceCard;
let transactionList, emptyState, chartCanvas, chartEmpty;
let itemNameError, amountError, categoryError;
let budgetLimitInput, saveLimitBtn, budgetAlert;
let newCategoryInput, addCategoryBtn, categoryAddError, customCategoryTags;
let monthlySummaryBtn, modalOverlay, modalClose, modalBody;

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  // ── Grab every DOM element here, after the document is fully parsed ──
  form               = document.getElementById('transactionForm');
  itemNameInput      = document.getElementById('itemName');
  amountInput        = document.getElementById('amount');
  categorySelect     = document.getElementById('category');
  totalBalanceEl     = document.getElementById('totalBalance');
  balanceLimitEl     = document.getElementById('balanceLimit');
  balanceCard        = document.querySelector('.balance-card');
  transactionList    = document.getElementById('transactionList');
  emptyState         = document.getElementById('emptyState');
  chartCanvas        = document.getElementById('expenseChart');
  chartEmpty         = document.getElementById('chartEmpty');
  itemNameError      = document.getElementById('itemNameError');
  amountError        = document.getElementById('amountError');
  categoryError      = document.getElementById('categoryError');
  budgetLimitInput   = document.getElementById('budgetLimitInput');
  saveLimitBtn       = document.getElementById('saveLimitBtn');
  budgetAlert        = document.getElementById('budgetAlert');
  newCategoryInput   = document.getElementById('newCategoryInput');
  addCategoryBtn     = document.getElementById('addCategoryBtn');
  categoryAddError   = document.getElementById('categoryAddError');
  customCategoryTags = document.getElementById('customCategoryTags');
  monthlySummaryBtn  = document.getElementById('monthlySummaryBtn');
  modalOverlay       = document.getElementById('modalOverlay');
  modalClose         = document.getElementById('modalClose');
  modalBody          = document.getElementById('modalBody');

  // ── Restore budget limit input ──
  if (budgetLimit !== null) {
    budgetLimitInput.value = budgetLimit;
  }

  // ── Build dropdown: default + custom categories ──
  rebuildCategoryDropdown();

  // ── Render custom category tags ──
  renderCustomCategoryTags();

  // ── Render transactions, balance, chart ──
  renderAll();

  // ── Event listeners ──
  form.addEventListener('submit', handleAddTransaction);
  saveLimitBtn.addEventListener('click', handleSaveLimit);
  budgetLimitInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSaveLimit(); });
  addCategoryBtn.addEventListener('click', handleAddCategory);
  newCategoryInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddCategory(); });
  monthlySummaryBtn.addEventListener('click', openMonthlySummary);
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// Wait for the full DOM before running anything
document.addEventListener('DOMContentLoaded', init);

// ─── Category Helpers ─────────────────────────────────────────────────────────

/** All categories combined (default + custom) */
function allCategories() {
  return [...DEFAULT_CATEGORIES, ...customCategories];
}

function getCategoryMeta(name) {
  return allCategories().find(c => c.name === name) || { name, icon: '📦', color: '#94a3b8' };
}

/** Pick next color from palette, cycling if needed */
function nextCustomColor() {
  return CUSTOM_PALETTE[customCategories.length % CUSTOM_PALETTE.length];
}

/**
 * Rebuild the <select> dropdown.
 * Always starts with the placeholder, then adds ALL categories (default + custom).
 * Preserves the currently selected value if it still exists.
 */
function rebuildCategoryDropdown() {
  // Safety guard — should never be null after init(), but just in case
  if (!categorySelect) return;

  const previousValue = categorySelect.value;

  // Clear and re-add placeholder
  categorySelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value       = '';
  placeholder.textContent = '-- Pilih Kategori --';
  categorySelect.appendChild(placeholder);

  // Add every category as an <option>
  allCategories().forEach(cat => {
    const opt = document.createElement('option');
    opt.value       = cat.name;
    opt.textContent = `${cat.icon} ${cat.name}`;
    categorySelect.appendChild(opt);
  });

  // Restore previous selection if it still exists in the new list
  if (previousValue && allCategories().some(c => c.name === previousValue)) {
    categorySelect.value = previousValue;
  }
}

// ─── Custom Category Handlers ─────────────────────────────────────────────────

function handleAddCategory() {
  categoryAddError.textContent = '';
  const raw = newCategoryInput.value.trim();

  if (!raw) {
    categoryAddError.textContent = 'Nama kategori tidak boleh kosong.';
    newCategoryInput.focus();
    return;
  }

  const isDuplicate = allCategories().some(
    c => c.name.toLowerCase() === raw.toLowerCase()
  );

  if (isDuplicate) {
    categoryAddError.textContent = `Kategori "${raw}" sudah ada.`;
    newCategoryInput.focus();
    return;
  }

  const newCat = {
    name:  raw,
    icon:  '📦',
    color: nextCustomColor(),
  };

  customCategories.push(newCat);
  saveToStorage(STORAGE_KEY_CATEGORIES, customCategories);

  newCategoryInput.value = '';
  rebuildCategoryDropdown();
  renderCustomCategoryTags();
  renderChart();
}

function handleDeleteCategory(name) {
  const inUse = transactions.some(t => t.category === name);
  if (inUse) {
    alert(`Kategori "${name}" tidak bisa dihapus karena masih digunakan oleh transaksi.`);
    return;
  }

  customCategories = customCategories.filter(c => c.name !== name);
  saveToStorage(STORAGE_KEY_CATEGORIES, customCategories);
  rebuildCategoryDropdown();
  renderCustomCategoryTags();
  renderChart();
}

function renderCustomCategoryTags() {
  if (!customCategoryTags) return;
  customCategoryTags.innerHTML = '';

  customCategories.forEach(cat => {
    const tag = document.createElement('span');
    tag.className        = 'category-tag';
    tag.style.background = cat.color;
    tag.innerHTML = `
      ${escapeHtml(cat.icon)} ${escapeHtml(cat.name)}
      <button class="tag-delete" aria-label="Hapus kategori ${escapeHtml(cat.name)}" title="Hapus">✕</button>
    `;
    tag.querySelector('.tag-delete').addEventListener('click', () => handleDeleteCategory(cat.name));
    customCategoryTags.appendChild(tag);
  });
}

// ─── Spending Limit Handlers ──────────────────────────────────────────────────

function handleSaveLimit() {
  const val = parseFloat(budgetLimitInput.value);

  if (budgetLimitInput.value === '' || isNaN(val) || val < 0) {
    budgetLimit = null;
    saveToStorage(STORAGE_KEY_LIMIT, null);
  } else {
    budgetLimit = val;
    saveToStorage(STORAGE_KEY_LIMIT, val);
  }

  renderBalance();
}

// ─── Monthly Summary ──────────────────────────────────────────────────────────

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function openMonthlySummary() {
  modalBody.innerHTML = '';

  if (transactions.length === 0) {
    modalBody.innerHTML = '<p class="modal-empty">Belum ada transaksi untuk ditampilkan.</p>';
    modalOverlay.hidden = false;
    return;
  }

  // Group by "YYYY-MM"
  const grouped = {};
  transactions.forEach(t => {
    const d   = new Date(t.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) {
      grouped[key] = { total: 0, count: 0, year: d.getFullYear(), month: d.getMonth() };
    }
    grouped[key].total += t.amount;
    grouped[key].count += 1;
  });

  // Sort newest first
  const sorted = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));

  sorted.forEach(([, data]) => {
    const item = document.createElement('div');
    item.className = 'monthly-item';
    item.innerHTML = `
      <div>
        <div class="monthly-month">${MONTH_NAMES_ID[data.month]} ${data.year}</div>
        <div class="monthly-count">${data.count} transaksi</div>
      </div>
      <div class="monthly-amount">${formatRupiah(data.total)}</div>
    `;
    modalBody.appendChild(item);
  });

  modalOverlay.hidden = false;
  modalClose.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
}

// ─── Transaction Handlers ─────────────────────────────────────────────────────

function handleAddTransaction(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const newTransaction = {
    id:        generateId(),
    name:      itemNameInput.value.trim(),
    amount:    parseFloat(amountInput.value),
    category:  categorySelect.value,
    timestamp: Date.now(),
  };

  transactions.unshift(newTransaction);
  saveToStorage(STORAGE_KEY, transactions);
  renderAll();

  form.reset();
  clearErrors();
  itemNameInput.focus();
}

function handleDeleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage(STORAGE_KEY, transactions);
  renderAll();
}

// ─── Validation ───────────────────────────────────────────────────────────────

function clearErrors() {
  [itemNameInput, amountInput, categorySelect].forEach(el => el.classList.remove('invalid'));
  [itemNameError, amountError, categoryError].forEach(el => (el.textContent = ''));
}

function validateForm() {
  clearErrors();
  let valid = true;

  if (!itemNameInput.value.trim()) {
    itemNameError.textContent = 'Nama item tidak boleh kosong.';
    itemNameInput.classList.add('invalid');
    valid = false;
  }

  const amt = amountInput.value.trim();
  if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
    amountError.textContent = 'Masukkan jumlah yang valid (lebih dari 0).';
    amountInput.classList.add('invalid');
    valid = false;
  }

  if (!categorySelect.value) {
    categoryError.textContent = 'Pilih kategori terlebih dahulu.';
    categorySelect.classList.add('invalid');
    valid = false;
  }

  return valid;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderAll() {
  renderBalance();
  renderTransactionList();
  renderChart();
}

function renderBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  totalBalanceEl.textContent = formatRupiah(total);

  if (budgetLimit !== null && budgetLimit > 0) {
    const remaining = budgetLimit - total;
    const isOver    = total > budgetLimit;

    balanceLimitEl.textContent = isOver
      ? `Melebihi limit sebesar ${formatRupiah(Math.abs(remaining))}`
      : `Sisa budget: ${formatRupiah(remaining)}`;

    balanceCard.classList.toggle('over-budget', isOver);
    budgetAlert.hidden = !isOver;
  } else {
    balanceLimitEl.textContent = '';
    balanceCard.classList.remove('over-budget');
    budgetAlert.hidden = true;
  }
}

function renderTransactionList() {
  transactionList.querySelectorAll('.transaction-item').forEach(el => el.remove());

  if (transactions.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  transactions.forEach(t => {
    const meta = getCategoryMeta(t.category);
    const item = document.createElement('div');
    item.className = 'transaction-item';
    item.setAttribute('data-category', t.category);
    item.setAttribute('role', 'listitem');
    item.style.borderLeftColor = meta.color;

    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
        <div class="transaction-meta">
          <span class="transaction-amount">${formatRupiah(t.amount)}</span>
          <span class="category-badge" style="background:${meta.color}">${escapeHtml(meta.icon)} ${escapeHtml(t.category)}</span>
        </div>
      </div>
      <button
        class="btn-delete"
        aria-label="Hapus transaksi ${escapeHtml(t.name)}"
        title="Hapus"
      >🗑</button>
    `;

    item.querySelector('.btn-delete').addEventListener('click', () => handleDeleteTransaction(t.id));
    transactionList.appendChild(item);
  });
}

function renderChart() {
  const totalsMap = {};
  transactions.forEach(t => {
    totalsMap[t.category] = (totalsMap[t.category] || 0) + t.amount;
  });

  const hasData = Object.keys(totalsMap).length > 0;
  chartCanvas.style.display = hasData ? 'block' : 'none';
  chartEmpty.style.display  = hasData ? 'none'  : 'block';

  const labels = Object.keys(totalsMap).map(k => {
    const m = getCategoryMeta(k);
    return `${m.icon} ${k}`;
  });
  const data   = Object.values(totalsMap);
  const colors = Object.keys(totalsMap).map(k => getCategoryMeta(k).color);

  if (pieChart) {
    pieChart.data.labels                      = labels;
    pieChart.data.datasets[0].data            = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();
    return;
  }

  pieChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 13, weight: '600' },
            color: '#1e293b',
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const value = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return ` ${formatRupiah(value)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateId() {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
