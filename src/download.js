const axios = require("axios");
const fs = require("fs");
const fu = require("./utils/file_utils");
const path = require("path");
const { getRegion } = require("./usecase/get_region");
const moment = require("moment");
const excel = require("./usecase/get_data_from_excel");
const logging = require("./utils/logging");

const http = require("http");
const https = require("https");

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "testfirestore-5d53a.firebaseapp.com",
});

function convertStringToDatetime(dateString) {
  // Menggunakan moment untuk mengonversi string ke objek tanggal
  const dateObject = moment(dateString, "YYYY-MM-DD HH:mm:ss").toDate();
  return admin.firestore.Timestamp.fromDate(dateObject);
}

// Fungsi untuk mengunduh respons JSON dari URL dan menyimpannya ke dalam file di dalam folder
const downloadJsonFromUrl = (
  url,
  receiptId,
  folderPath,
  retryCount = 0,
  maxRetries = 3
) => {
  // Buat folder jika belum ada
  fu.createFolderIfNotExists(folderPath);

  // Gabungkan jalur folder dengan nama file
  const filePath = path.join(folderPath, "data.json");

  // Gunakan metode fetch untuk mengambil data dari URL
  axios
    .get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      httpAgent,
      httpsAgent,
      validateStatus: (status) => status < 500,
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        const contentType = response.headers["content-type"];
        if (!contentType || !contentType.includes("application/json")) {
          logging.logError(
            new Error(),
            `Response tidak berupa JSON untuk resi ${receiptId}`
          );
          return;
        }

        const jsonData = response.data;

        // Validasi JSON
        try {
          JSON.parse(JSON.stringify(jsonData));
        } catch (error) {
          console.error("Response tidak valid JSON:", error.message);
          return;
        }

        const coordinateString = jsonData.pod.coordinate;

        const [latitude, longitude] = coordinateString
          .split(",")
          .map((coord) => parseFloat(coord));

        const { province, city, district, village, area } = getRegion(
          parseInt(jsonData.connote_receiver_zipcode),
          jsonData.connote_code
        );

        const targetJson = {
          catatan: "",
          ceritaLaporan: jsonData.koli_description,
          createdAt: convertStringToDatetime(jsonData.created_at),
          jabatanLokasiRelawan: "Kota/Kabupaten",
          kategori: "Tabloid",
          keteranganTambahanLaporan: jsonData.reason_delivery,
          kode: jsonData.connote_code,
          latitude: latitude,
          lokasiAlamat: jsonData.connote_receiver_address,
          lokasiAlamatKecamatan: district,
          lokasiAlamatKelurahan: village,
          lokasiAlamatKotaKabupaten: city,
          lokasiAlamatPropinsi: province,
          lokasiLaporan: jsonData.koli_description,
          longitude: longitude,
          namaRelawan: "pos",
          photoURL: [jsonData.pod.photo],
          status: "sent",
          uidRelawan: "pos",
          verifiedAt: "",
          verifiedById: "",
          verifiedByName: "",
          wilayahRelawan: area,
        };

        fs.access(filePath, fs.constants.F_OK, (error) => {
          if (error) {
            // Jika file belum ada, membuat file baru
            createNewFile(targetJson, filePath);
          } else {
            // Jika file sudah ada, tambahkan data baru
            appendDataToFile(targetJson, filePath);
          }
        });
      } else {
        logging.logError(
          new Error(),
          `Gagal mendapatkan response JSON untuk resi ${receiptId}. Kode status ${response.status}`
        );
        retryOrLogError(url, receiptId, retryCount, maxRetries);
      }
    })
    .catch((error) => {
      logging.logError(
        error,
        `Gagal mendapatkan response JSON: ${error.message}`
      );
      retryOrLogError(url, receiptId, retryCount, maxRetries);
    });
};

// Fungsi untuk membuat file baru dan menyimpan data JSON di dalamnya
function createNewFile(data, filePath) {
  fs.writeFile(filePath, JSON.stringify([data], null, 2), (writeErr) => {
    if (writeErr) {
      logging.logError(
        writeErr,
        `Gagal membuat file dan menulis data: ${writeErr.message}`
      );
    } else {
      console.log(
        `File ${filePath} berhasil dibuat dan data ${data.kode} berhasil ditambahkan`
      );
    }
  });
}

// Fungsi untuk menambahkan data ke dalam file JSON yang sudah ada
function appendDataToFile(newData, filePath) {
  fs.readFile(filePath, "utf8", (readErr, data) => {
    if (readErr) {
      logging.logError(readErr, `Gagal membaca file: ${readErr.message}`);
      return;
    }

    let existingData;

    // Validasi JSON yang sudah ada
    try {
      existingData = JSON.parse(data);
    } catch (parseErr) {
      logging.logError(parseErr, `File JSON tidak valid: ${parseErr.message}`);
      return;
    }

    // Menambahkan data baru ke dalam file JSON yang sudah ada
    existingData.push(newData);

    // Menulis kembali ke file
    fs.writeFile(
      filePath,
      JSON.stringify(existingData, null, 2),
      (writeErr) => {
        if (writeErr) {
          logging.logError(
            writeErr,
            `Gagal menulis ke file: ${writeErr.message}`
          );
        } else {
          console.log(`Data ${newData.kode} berhasil ditambahkan ke file JSON`);
        }
      }
    );
  });
}

function retryOrLogError(url, receiptId, retryCount, maxRetries) {
  if (retryCount < maxRetries - 1) {
    const nextRetryCount = retryCount + 1;
    console.log(
      `Mencoba lagi setelah 1 detik (Percobaan ke-${nextRetryCount + 1})...`
    );
    setTimeout(
      () => downloadJsonFromUrl(url, receiptId, "output", nextRetryCount),
      1000
    );
  } else {
    logging.logError(
      new Error(),
      "Percobaan mengulang melebihi batas maksimum. Tidak dapat mendapatkan data."
    );
  }
}

const receiptIds = excel.getReceiptsFromExcel();

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const batchDownload = async (receiptIds) => {
  try {
    for (let index = 0; index < receiptIds.length; index++) {
      const receiptId = receiptIds[index];
      const url = `https://asia-southeast2-lapor-tabloid-pesantren-2.cloudfunctions.net/api/posTracking/${receiptId}`; // Ganti dengan URL yang sesuai
      // const customFileName = `${receiptId}.json`; // Ganti dengan nama file yang sesuai
      downloadJsonFromUrl(url, receiptId, "output");
      // console.log(receiptId);
      await delay(1500);
    }
  } catch (error) {
    logging.logError(error, `Terjadi error: ${error.message}`);
  }
};

batchDownload(receiptIds);
