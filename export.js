const admin = require("firebase-admin");
const fs = require("fs");

// Inisialisasi Firebase Admin SDK dengan credential Anda
const serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Inisialisasi Firestore
const db = admin.firestore();

// Nama koleksi Firestore yang ingin Anda export
const collectionName = "laporan";

// Fungsi untuk mengambil data dari Firestore dan menyimpannya dalam file JSON
async function exportFirestoreDataToJson() {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    const jsonContent = JSON.stringify(data, null, 2);
    const outputPath = "output.json";

    fs.writeFileSync(outputPath, jsonContent);

    console.log(`Data berhasil diekspor ke ${outputPath}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Panggil fungsi untuk memulai proses ekspor
exportFirestoreDataToJson();
