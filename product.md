# Product

**Expense & Budget Visualizer** adalah aplikasi web satu halaman (SPA) yang membantu pengguna mencatat pengeluaran harian, menetapkan batas anggaran, dan memvisualisasikan pola belanja mereka.

## Target Pengguna

Individu yang ingin memantau keuangan pribadi secara sederhana tanpa perlu akun atau koneksi internet — semua data tersimpan lokal di browser.

## User Goals

- Mencatat transaksi pengeluaran dengan cepat (nama, jumlah, kategori)
- Mengetahui total pengeluaran secara real-time
- Mendapat peringatan ketika pengeluaran melampaui budget yang ditetapkan
- Melihat distribusi pengeluaran per kategori lewat grafik
- Mengelola kategori sendiri sesuai kebutuhan
- Melihat ringkasan pengeluaran per bulan

## Key UX Principles

- **Zero friction** — tidak perlu login, tidak perlu install, buka langsung di browser
- **Instant feedback** — setiap aksi (tambah, hapus, set limit) langsung terrefleksi di UI
- **Accessible** — menggunakan atribut ARIA, `role`, dan `aria-live` untuk screen reader
- **Responsive** — layout menyesuaikan dari mobile (≤480px) hingga desktop (≥1100px)

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| Tambah Transaksi | Form dengan validasi: nama item, jumlah (Rp), kategori |
| Hapus Transaksi | Tombol hapus per item di daftar transaksi |
| Budget Limit | Set batas anggaran; muncul alert + kartu berubah merah jika terlampaui |
| Custom Category | Tambah/hapus kategori sendiri; warna otomatis dari palet |
| Pie Chart | Visualisasi pengeluaran per kategori menggunakan Chart.js |
| Monthly Summary | Modal ringkasan total & jumlah transaksi per bulan |
| Persistensi Data | Semua data disimpan di `localStorage`, tetap ada setelah refresh |

## Out of Scope

- Autentikasi / akun pengguna
- Sinkronisasi data ke server / cloud
- Fitur pemasukan (income) — hanya pengeluaran
- Multi-currency (hanya Rupiah / IDR)
- Export data (CSV, PDF, dll.)
