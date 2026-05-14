# Structure

## File Tree

```
CodingCamp-110526-yuanmahisa/
├── index.html              # Entry point — seluruh markup UI ada di sini
├── css/
│   └── style.css           # Semua styling: layout, komponen, animasi, responsif
├── js/
│   └── app.js              # Seluruh logika aplikasi (state, render, event, storage)
└── .kiro/
    └── steering/
        ├── project.md      # Ringkasan project & tech stack
        ├── product.md      # Tujuan produk, fitur, UX principles
        ├── tech.md         # Konvensi kode, stack detail, storage keys
        └── structure.md    # Panduan struktur file & arsitektur (file ini)
```

## Arsitektur app.js

File `app.js` diorganisir dalam satu file dengan urutan bagian sebagai berikut:

```
1. Storage Keys        — konstanta key untuk localStorage
2. Default Categories  — data kategori bawaan (Food, Transport, Fun)
3. Custom Palette      — array warna untuk kategori custom
4. Storage Helpers     — loadFromStorage() / saveToStorage()
5. State               — variabel global: transactions, customCategories, budgetLimit, pieChart
6. DOM References      — deklarasi variabel DOM (diisi saat init())
7. init()              — query semua DOM, restore state, pasang event listeners
8. Category Helpers    — allCategories(), getCategoryMeta(), rebuildCategoryDropdown()
9. Custom Category     — handleAddCategory(), handleDeleteCategory(), renderCustomCategoryTags()
10. Budget Limit       — handleSaveLimit()
11. Monthly Summary    — openMonthlySummary(), closeModal()
12. Transaction        — handleAddTransaction(), handleDeleteTransaction()
13. Validation         — clearErrors(), validateForm()
14. Render             — renderAll(), renderBalance(), renderTransactionList(), renderChart()
15. Utilities          — generateId(), formatRupiah(), escapeHtml()
```

## Konvensi Penamaan

| Jenis | Pola | Contoh |
|---|---|---|
| Handler fungsi | `handle<Action>` | `handleAddTransaction` |
| Render fungsi | `render<Target>` | `renderTransactionList` |
| DOM variable | camelCase, suffix sesuai elemen | `totalBalanceEl`, `budgetAlert` |
| Storage key | `STORAGE_KEY_<NAMA>` | `STORAGE_KEY_CATEGORIES` |
| CSS class | kebab-case | `.transaction-item`, `.btn-primary` |
| CSS variable | `--color-<nama>`, `--<property>` | `--color-primary`, `--radius` |

## Aturan Penambahan Fitur Baru

- **HTML** — tambahkan markup di `index.html`, ikuti pola section + `aria-label`
- **CSS** — tambahkan style di `style.css` dengan komentar section header (`/* === Nama Section === */`)
- **JS** — tambahkan fungsi di bagian yang sesuai dalam `app.js` (lihat urutan di atas); jangan buat file JS baru
- **Kategori baru** — tambahkan ke array `DEFAULT_CATEGORIES` di `app.js` beserta warna di `:root` CSS
- **State baru** — deklarasikan di bagian State, gunakan `loadFromStorage` dengan fallback, definisikan storage key baru

## Yang Tidak Boleh Dilakukan

- Jangan pisah `app.js` menjadi beberapa file (tidak ada module bundler)
- Jangan tambahkan `<script>` CDN baru tanpa alasan kuat
- Jangan query DOM di luar `init()` atau fungsi render
- Jangan masukkan HTML user input ke DOM tanpa `escapeHtml()` terlebih dahulu
