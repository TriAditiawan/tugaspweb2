// js/tracking-app.js — Vue 3 via CDN (tanpa SFC)
const { createApp, computed } = Vue;

createApp({
  data(){
    const today = new Date();
    const yyyy = today.getFullYear();
    // data utama
    return {
      yearNow: yyyy,
      pengirimanList: [
        { kode: "REG", nama: "Reguler (3-5 hari)" },
        { kode: "EXP", nama: "Ekspres (1-2 hari)" }
      ],
      paket: [
        { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
        { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
      ],
      tracking: {
        "DO2025-0001": {
          nim: "123456789",
          nama: "Rina Wulandari",
          status: "Dalam Perjalanan",
          ekspedisi: "JNE",
          tanggalKirim: "2025-08-25",
          paket: "PAKET-UT-001",
          total: 120000,
          perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
            { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
          ]
        }
      },
      // dummy dataTracking tambahan (tanpa data login)
      extraTracking: {
        "2023001234": {
          nomorDO: "2023001234",
          nama: "Rina Wulandari",
          status: "Dalam Perjalanan",
          ekspedisi: "JNE",
          tanggalKirim: "2025-08-25",
          paket: "0JKT01",
          total: 180000,
          perjalanan:[
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
            { waktu: "2025-08-25 10:12:20", keterangan: "Diteruskan ke Kantor Jakarta Selatan" }
          ]
        },
        "2023005678": {
          nomorDO: "2023005678",
          nama: "Agus Pranoto",
          status: "Dikirim",
          ekspedisi: "Pos Indonesia",
          tanggalKirim: "2025-08-25",
          paket: "0UPBJJBDG",
          total: 220000,
          perjalanan:[
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
            { waktu: "2025-08-25 16:30:10", keterangan: "Diteruskan ke Kantor Kota Bandung" },
            { waktu: "2025-08-26 12:15:33", keterangan: "Tiba di Hub: Kota BANDUNG" },
            { waktu: "2025-08-26 15:06:12", keterangan: "Proses antar ke Cimahi" },
            { waktu: "2025-08-26 20:00:00", keterangan: "Selesai Antar. Penerima: Agus Pranoto" }
          ]
        }
      },
      form: { nim:"", nama:"", ekspedisi:"", paket:"", tanggalKirim: new Date().toISOString().slice(0,10) },
      errors: {}
    };
  },
  created(){
    // gabungkan extraTracking (yang bukan format DO2025-xxxx) agar tetap terlihat di daftar
    for (const k in this.extraTracking){
      this.tracking[k] = this.extraTracking[k];
    }
  },
  computed:{
    calculatedNextDO(){
      // cari DO dengan format DO<YEAR>-NNNN
      const year = this.yearNow;
      const prefix = `DO${year}-`;
      const numbers = Object.keys(this.tracking)
        .filter(k => k.startsWith(prefix))
        .map(k => parseInt(k.replace(prefix,""), 10))
        .filter(n => !isNaN(n));
      const next = (numbers.length ? Math.max(...numbers) + 1 : 1);
      return prefix + String(next).padStart(4, "0");
    },
    paketTerpilih(){
      return this.paket.find(p=>p.kode === this.form.paket) || null;
    }
  },
  methods:{
    formatIDR(x){
      try{ return new Intl.NumberFormat('id-ID').format(x); }catch(e){ return x; }
    },
    validateForm(){
      const e = {};
      if (!this.form.nim.trim()) e.nim = "NIM wajib";
      if (!this.form.nama.trim()) e.nama = "Nama wajib";
      if (!this.form.ekspedisi) e.ekspedisi = "Pilih ekspedisi";
      if (!this.form.paket) e.paket = "Pilih paket";
      this.errors = e;
      return Object.keys(e).length === 0;
    },
    resetForm(){
      this.form = { nim:"", nama:"", ekspedisi:"", paket:"", tanggalKirim: new Date().toISOString().slice(0,10) };
      this.errors = {};
    },
    buatDOBaru(){
      if (!this.validateForm()) return;
      const kode = this.calculatedNextDO;
      const pkt = this.paketTerpilih;
      this.tracking[kode] = {
        nim: this.form.nim,
        nama: this.form.nama,
        status: "Dikirim",
        ekspedisi: this.form.ekspedisi,
        tanggalKirim: this.form.tanggalKirim,
        paket: this.form.paket,
        total: pkt ? pkt.harga : 0,
        perjalanan: [
          { waktu: new Date().toISOString().replace("T"," ").slice(0,19), keterangan: "Order dibuat" }
        ]
      };
      alert("DO baru dibuat: " + kode);
      this.resetForm();
    }
  }
}).mount("#app");
