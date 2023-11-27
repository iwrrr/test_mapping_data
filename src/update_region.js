const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "-",
});

// Referensi Firestore
const db = admin.firestore();
const collectionRef = db.collection("laporan"); // Ganti dengan nama koleksi Firestore Anda

const data = {
  receiptId: "", // No Resi
  region: {
    province: "", // Provinsi
    city: "", // Kota/Kabupaten
    district: "", // Kecamatan
    village: "", // Desa
    area: "", // PROVINSI|KOTA/KABUPATEN
  },
};

// Fungsi untuk update data berdasarkan kondisi tertentu
const updateData = async ({ receiptId, region }) => {
  try {
    const query = collectionRef
      .where("kode", "==", receiptId)
      .where("wilayahRelawan", "==", "-")
      .where("lokasiAlamatKecamatan", "==", "-")
      .where("lokasiAlamatKelurahan", "==", "-")
      .where("lokasiAlamatKotaKabupaten", "==", "-")
      .where("lokasiAlamatPropinsi", "==", "-");

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log("Tidak ada dokumen yang memenuhi kondisi.");
      return;
    }

    snapshot.forEach((doc) => {
      // Update data di Firestore
      const docRef = collectionRef.doc(doc.id);
      return docRef
        .update({
          wilayahRelawan: region.area,
          lokasiAlamatKecamatan: region.district,
          lokasiAlamatKelurahan: region.village,
          lokasiAlamatKotaKabupaten: region.city,
          lokasiAlamatPropinsi: region.province,
          // Tambahkan field lain yang ingin diupdate jika diperlukan
        })
        .then(() => {
          console.log("Data berhasil diupdate:", doc.id);
        })
        .catch((error) => {
          console.error("Gagal update data:", error);
        });
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// Panggil fungsi untuk update data
updateData(data);
