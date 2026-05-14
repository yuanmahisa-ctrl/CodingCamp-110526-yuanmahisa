# Tech

## Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Markup | HTML5 | Single file `index.html` |
| Styling | CSS3 | `css/style.css` — custom properties, Grid, Flexbox |
| Logic | Vanilla JavaScript (ES6+) | `js/app.js` — no framework, no bundler |
| Chart | Chart.js 4.4.0 | Dimuat via CDN (`cdn.jsdelivr.net`) |
| Storage | `localStorage` | Persistensi data di sisi klien |

## Tidak Ada Build System

Tidak ada `package.json`, bundler (Webpack/Vite), transpiler (Babel), atau langkah kompilasi.  
Buka `index.html` langsung di browser atau gunakan static file server sederhana (Live Server, `python -m http.server`, dll.).

## Konvensi JavaScript

- Semua DOM query dilakukan di dalam `init()` setelah `DOMContentLoaded` — tidak ada query di top-level
- State disimpan dalam variabel modul: `transactions`, `customCategories`, `budgetLimit`, `pieChart`
- Storage diakses lewat helper `loadFromStorage(key, fallback)` dan `saveToStorage(key, value)`
- Render dipisah per concern: `renderBalance()`, `renderTransactionList()`, `renderChart()` — dipanggil bersama via `renderAll()`
- ID transaksi di-generate dengan `generateId()` → format `txn_<timestamp>_<random>`
- HTML user input selalu di-escape lewat `escapeHtml()` sebelum dimasukkan ke `innerHTML`
- Format mata uang menggunakan `formatRupiah()` dengan `toLocaleString('id-ID')`

## localStorage Keys

| Key | Tipe | Isi |
|---|---|---|
| `expense_visualizer_transactions` | `Array` | Daftar objek transaksi |
| `expense_visualizer_custom_categories` | `Array` | Daftar kategori custom |
| `expense_visualizer_budget_limit` | `number \| null` | Batas anggaran |

## Konvensi CSS

- Semua warna dan nilai berulang didefinisikan sebagai CSS custom properties di `:root`
- Breakpoint responsif: `768px` (tablet) dan `480px` (mobile)
- Animasi menggunakan `@keyframes fadeIn` dan `slideIn` — durasi ≤ 0.3s
- Nama class menggunakan kebab-case; BEM-style untuk komponen (`.transaction-item`, `.transaction-name`, dll.)

## Dependency Eksternal

- **Chart.js 4.4.0** — satu-satunya dependency, dimuat via CDN. Tidak ada dependency lain.
- Jangan tambahkan library baru tanpa pertimbangan matang — proyek ini sengaja dibuat zero-dependency.

## Browser Support

Menarget browser modern (Chrome, Firefox, Edge, Safari versi terbaru).  
Tidak perlu polyfill — fitur yang digunakan (CSS Grid, `localStorage`, `fetch`-free) sudah didukung luas.
