// js/stok-app.js — Vue 3 via CDN (tanpa SFC)
const { createApp, computed, watch } = Vue;

createApp({
  data(){
    return {
      upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
      kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
      paket: [
        { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
        { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
      ],
      // gabungan data stok awal
      stok: [
        { kode: "EKMA4116", judul: "Pengantar Manajemen", kategori: "MK Wajib", upbjj: "Jakarta", lokasiRak: "R1-A3", harga: 65000, qty: 28, safety: 20, catatanHTML: "<em>Edisi 2024, cetak ulang</em>" },
        { kode: "EKMA4115", judul: "Pengantar Akuntansi", kategori: "MK Wajib", upbjj: "Jakarta", lokasiRak: "R1-A4", harga: 60000, qty: 7, safety: 15, catatanHTML: "<strong>Cover baru</strong>" },
        { kode: "BIOL4201", judul: "Biologi Umum (Praktikum)", kategori: "Praktikum", upbjj: "Surabaya", lokasiRak: "R3-B2", harga: 80000, qty: 12, safety: 10, catatanHTML: "Butuh <u>pendingin</u> untuk kit basah" },
        { kode: "FISIP4001", judul: "Dasar-Dasar Sosiologi", kategori: "MK Pilihan", upbjj: "Makassar", lokasiRak: "R2-C1", harga: 55000, qty: 2, safety: 8, catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder" }
      ],
      // dummy dataBahanAjar tambahan (tanpa data login)
      dataBahanAjar: [
        { kodeLokasi: "0TMP01", kodeBarang: "ASIP4301", namaBarang: "Pengantar Ilmu Komunikasi", jenisBarang: "BMP", edisi: "2", stok: 548, cover: "assets/pengantar_komunikasi.jpg" },
        { kodeLokasi: "0JKT01", kodeBarang: "EKMA4216", namaBarang: "Manajemen Keuangan", jenisBarang: "BMP", edisi: "3", stok: 392, cover: "assets/‎najemen_keuangan.jpg" },
        { kodeLokasi: "0SBY02", kodeBarang: "EKMA4310", namaBarang: "Kepemimpinan", jenisBarang: "BMP", edisi: "1", stok: 278, cover: "assets/Kepemimpinan.jpg" },
        { kodeLokasi: "0MLG01", kodeBarang: "BIOL4211", namaBarang: "Mikrobiologi Dasar", jenisBarang: "BMP", edisi: "2", stok: 165, cover: "assets/MikrobiologiDasar.jpg" },
        { kodeLokasi: "0UPBJJBDG", kodeBarang: "PAUD4401", namaBarang: "Perkembangan Anak Usia Dini", jenisBarang: "BMP", edisi: "4", stok: 204, cover: "assets/paud.jpg" }
      ],
      filters: {
        upbjj: "",
        kategori: "",
        onlyBelowSafety: false,
        onlyZero: false,
      },
      sort: { by: "judul", desc: false },
      // edit state
      editIndex: -1,
      editBuffer: {},
      // form tambah
      form: { kode:"", judul:"", kategori:"", upbjj:"", lokasiRak:"", harga:0, qty:0, safety:0, catatanHTML:"" },
      errors: {}
    };
  },
  computed:{
    filteredSortedStok(){
      let rows = this.stok.slice();

      // dependent: kategori aktif hanya jika upbjj dipilih (tetap boleh kosong)
      if (this.filters.upbjj) {
        rows = rows.filter(r => r.upbjj === this.filters.upbjj);
        if (this.filters.kategori) rows = rows.filter(r => r.kategori === this.filters.kategori);
      }

      if (this.filters.onlyBelowSafety) rows = rows.filter(r => r.qty < r.safety);
      if (this.filters.onlyZero) rows = rows.filter(r => r.qty === 0);

      const dir = this.sort.desc ? -1 : 1;
      rows.sort((a,b)=>{
        const key = this.sort.by;
        if (key === "judul") return a.judul.localeCompare(b.judul) * dir;
        if (key === "qty" || key === "harga") return (a[key]-b[key]) * dir;
        return 0;
      });
      return rows;
    }
  },
  watch:{
    "filters.upbjj"(v){
      // reset kategori saat ganti upbjj
      this.filters.kategori = "";
    },
    "filters.onlyZero"(v){
      // jika pilih onlyZero, nonaktifkan belowSafety agar jelas
      if (v) this.filters.onlyBelowSafety = false;
    }
  },
  methods:{
    formatIDR(x){
      try{ return new Intl.NumberFormat('id-ID').format(x); }catch(e){ return x; }
    },
    statusClass(s){
      if (s.qty === 0) return "badge bad";
      if (s.qty < s.safety) return "badge warn";
      return "badge ok";
    },
    statusText(s){
      if (s.qty === 0) return "Kosong";
      if (s.qty < s.safety) return "Menipis";
      return "Aman";
    },
    resetFilters(){
      this.filters = { upbjj:"", kategori:"", onlyBelowSafety:false, onlyZero:false };
      this.sort = { by:"judul", desc:false };
    },
    // edit
    startEdit(i, s){
      this.editIndex = i;
      this.editBuffer = JSON.parse(JSON.stringify(s));
    },
    cancelEdit(){
      this.editIndex = -1;
      this.editBuffer = {};
    },
    saveEdit(i){
      // validasi sederhana
      if (!this.editBuffer.judul?.trim()) return alert("Judul wajib diisi");
      if (!this.editBuffer.kategori) return alert("Kategori wajib dipilih");
      if (!this.editBuffer.upbjj) return alert("UPBJJ wajib dipilih");
      if (this.editBuffer.harga < 0) return alert("Harga tidak valid");
      if (this.editBuffer.qty < 0 || this.editBuffer.safety < 0) return alert("Qty/Safety tidak valid");
      this.stok[i] = { ...this.editBuffer };
      this.cancelEdit();
    },
    // tambah baru
    resetForm(){
      this.form = { kode:"", judul:"", kategori:"", upbjj:"", lokasiRak:"", harga:0, qty:0, safety:0, catatanHTML:"" };
      this.errors = {};
    },
    validateForm(){
      const e = {};
      if (!this.form.kode.trim()) e.kode = "Kode wajib";
      if (this.stok.some(s=>s.kode === this.form.kode.trim())) e.kode = "Kode sudah ada";
      if (!this.form.judul.trim()) e.judul = "Judul wajib";
      if (!this.form.kategori) e.kategori = "Pilih kategori";
      if (!this.form.upbjj) e.upbjj = "Pilih UPBJJ";
      if (this.form.harga < 0) e.harga = "Harga tidak valid";
      this.errors = e;
      return Object.keys(e).length === 0;
    },
    tambahBaru(){
      if (!this.validateForm()) return;
      this.stok.push({ ...this.form });
      this.resetForm();
      alert("Data bahan ajar ditambahkan.");
    }
  }
}).mount("#app");
