import { db } from "@workspace/db";
import {
  laporanTable, kebutuhanTable, relawanTable,
  inventarisTable, transaksiInventarisTable, penugasanTable
} from "@workspace/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing seed data
  await db.delete(penugasanTable);
  await db.delete(kebutuhanTable);
  await db.delete(transaksiInventarisTable);
  await db.delete(inventarisTable);
  await db.delete(relawanTable);
  await db.delete(laporanTable);

  // --- LAPORAN ---
  const [l1] = await db.insert(laporanTable).values({
    judul: "Banjir Parah Menerjang Desa Ubud",
    jenis_bencana: "banjir",
    lokasi: "Desa Ubud, Kec. Ubud, Gianyar",
    deskripsi: "Banjir setinggi 1.5 meter melanda permukiman warga sejak pukul 03.00 WITA. Puluhan rumah terendam, warga mengungsi ke balai desa. Jembatan utama terputus sehingga akses terganggu.",
    nama_pelapor: "I Wayan Sudarsana",
    kontak_pelapor: "081234567890",
    jabatan_pelapor: "Kelian Banjar Ubud Kaja",
    jumlah_terdampak: 234,
    lokasi_pengungsian: "Balai Banjar Ubud Kaja",
    foto_urls: ["https://example.com/foto1.jpg"],
    status: "terverifikasi",
  }).returning();

  const [l2] = await db.insert(laporanTable).values({
    judul: "Tanah Longsor Ancam Permukiman Kintamani",
    jenis_bencana: "tanah_longsor",
    lokasi: "Banjar Temen, Desa Kintamani, Bangli",
    deskripsi: "Hujan deras sejak kemarin menyebabkan tebing setinggi 20 meter longsor dan menimbun 3 rumah warga. 1 keluarga masih tertimbun, butuh bantuan SAR segera.",
    nama_pelapor: "Ni Made Suartini",
    kontak_pelapor: "082345678901",
    jabatan_pelapor: "Ketua RT 05",
    jumlah_terdampak: 47,
    lokasi_pengungsian: "Pura Desa Kintamani",
    foto_urls: [],
    status: "menunggu",
  }).returning();

  const [l3] = await db.insert(laporanTable).values({
    judul: "Kebakaran Melanda Pasar Tradisional Tabanan",
    jenis_bencana: "kebakaran",
    lokasi: "Pasar Tabanan, Kec. Tabanan, Tabanan",
    deskripsi: "Kebakaran terjadi pukul 02.30 WITA diduga akibat korsleting listrik. Sekitar 30 kios habis terbakar. Tidak ada korban jiwa namun kerugian material sangat besar.",
    nama_pelapor: "I Ketut Wirawan",
    kontak_pelapor: "083456789012",
    jabatan_pelapor: "Ketua RT 02",
    jumlah_terdampak: 30,
    lokasi_pengungsian: null,
    foto_urls: [],
    status: "selesai",
  }).returning();

  // --- KEBUTUHAN ---
  await db.insert(kebutuhanTable).values([
    { laporan_id: l1.id, kategori: "pangan", nama_item: "Beras", jumlah_dibutuhkan: 500, jumlah_terpenuhi: 200, satuan: "kg" },
    { laporan_id: l1.id, kategori: "pangan", nama_item: "Mie Instan", jumlah_dibutuhkan: 1000, jumlah_terpenuhi: 500, satuan: "bungkus" },
    { laporan_id: l1.id, kategori: "sandang", nama_item: "Selimut", jumlah_dibutuhkan: 100, jumlah_terpenuhi: 30, satuan: "lembar" },
    { laporan_id: l1.id, kategori: "medis", nama_item: "Obat-obatan dasar", jumlah_dibutuhkan: 50, jumlah_terpenuhi: 20, satuan: "paket" },
    { laporan_id: l1.id, kategori: "air_bersih", nama_item: "Air mineral galon", jumlah_dibutuhkan: 200, jumlah_terpenuhi: 80, satuan: "galon" },
    { laporan_id: l2.id, kategori: "medis", nama_item: "Peralatan P3K", jumlah_dibutuhkan: 20, jumlah_terpenuhi: 0, satuan: "set" },
    { laporan_id: l2.id, kategori: "pangan", nama_item: "Nasi bungkus", jumlah_dibutuhkan: 300, jumlah_terpenuhi: 0, satuan: "bungkus" },
  ]);

  // --- RELAWAN ---
  const [r1] = await db.insert(relawanTable).values({
    nama: "I Gede Mahendra",
    nik: "5101010101010001",
    no_hp: "081111111111",
    email: "gede@example.com",
    alamat: "Jl. Raya Ubud No. 12, Gianyar",
    keahlian: ["SAR (Search & Rescue)", "Medis"],
    foto_ktp_url: "https://example.com/ktp1.jpg",
    status_verifikasi: "terverifikasi",
  }).returning();

  const [r2] = await db.insert(relawanTable).values({
    nama: "Ni Putu Dewi Rahayu",
    nik: "5101010101010002",
    no_hp: "082222222222",
    email: "dewi@example.com",
    alamat: "Jl. Sunset Road No. 45, Kuta, Badung",
    keahlian: ["Logistik", "Memasak", "Transportasi"],
    foto_ktp_url: "https://example.com/ktp2.jpg",
    status_verifikasi: "terverifikasi",
  }).returning();

  const [r3] = await db.insert(relawanTable).values({
    nama: "Kadek Surya Pratama",
    nik: "5101010101010003",
    no_hp: "083333333333",
    alamat: "Jl. Ngurah Rai No. 7, Denpasar",
    keahlian: ["Komunikasi", "Psikologi"],
    status_verifikasi: "menunggu",
  }).returning();

  // --- INVENTARIS ---
  const items = [
    { nama_barang: "Beras Premium 5kg", kategori: "pangan", satuan: "karung", stok: 150 },
    { nama_barang: "Mie Instan Karton", kategori: "pangan", satuan: "karton", stok: 80 },
    { nama_barang: "Air Mineral 600ml", kategori: "air_bersih", satuan: "dus", stok: 200 },
    { nama_barang: "Selimut Fleece", kategori: "sandang", satuan: "lembar", stok: 75 },
    { nama_barang: "Paket Obat Dasar", kategori: "medis", satuan: "paket", stok: 30 },
    { nama_barang: "Tenda Pengungsian", kategori: "tempat_tinggal", satuan: "unit", stok: 5 },
    { nama_barang: "Masker Medis", kategori: "medis", satuan: "kotak", stok: 100 },
    { nama_barang: "Pakaian Anak (Campuran)", kategori: "sandang", satuan: "pcs", stok: 3 },
  ];

  for (const item of items) {
    const keluar = Math.floor(item.stok * 0.2);
    const sisa = item.stok - keluar;

    const [inv] = await db.insert(inventarisTable).values({
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      satuan: item.satuan,
      stok_masuk: item.stok,
      stok_keluar: keluar,
      stok_sisa: sisa,
    }).returning();

    await db.insert(transaksiInventarisTable).values([
      { inventaris_id: inv.id, jenis: "masuk", jumlah: item.stok, keterangan: "Donasi awal dari masyarakat" },
      { inventaris_id: inv.id, jenis: "keluar", jumlah: keluar, keterangan: `Distribusi ke pengungsi Ubud (#${l1.id})`, laporan_id: l1.id },
    ]);
  }

  // --- PENUGASAN ---
  await db.insert(penugasanTable).values([
    {
      laporan_id: l1.id,
      relawan_id: r1.id,
      nama_relawan: r1.nama,
      detail_tugas: "Koordinasi evakuasi warga terdampak banjir dan pendirian posko pengungsian di Balai Banjar Ubud Kaja",
      lokasi_tugas: "Balai Banjar Ubud Kaja, Gianyar",
      link_grup: "https://chat.whatsapp.com/contoh-link-bencana-ubud",
      status: "aktif",
    },
    {
      laporan_id: l1.id,
      relawan_id: r2.id,
      nama_relawan: r2.nama,
      detail_tugas: "Distribusi logistik (beras, mie instan, air mineral) kepada pengungsi di posko utama",
      lokasi_tugas: "Posko Utama, Balai Banjar Ubud Kaja",
      link_grup: "https://chat.whatsapp.com/contoh-link-bencana-ubud",
      status: "aktif",
    },
  ]);

  console.log("✅ Seed berhasil!");
  console.log(`   - ${3} laporan bencana`);
  console.log(`   - ${7} kebutuhan bantuan`);
  console.log(`   - ${3} relawan`);
  console.log(`   - ${items.length} barang inventaris`);
  console.log(`   - 2 penugasan aktif`);
  process.exit(0);
}

seed().catch(e => {
  console.error("❌ Seed gagal:", e);
  process.exit(1);
});
