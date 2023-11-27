const fetch = require("node-fetch");
const fs = require("fs");
const fu = require("./utils/file_utils");
const path = require("path");
const { getRegion } = require("./usecase/get_region");
const excel = require("./usecase/get_receipts_from_excel");

// Fungsi untuk mengunduh respons JSON dari URL dan menyimpannya ke dalam file di dalam folder
const downloadJsonFromUrl = (url, folderPath) => {
  // Buat folder jika belum ada
  fu.createFolderIfNotExists(folderPath);

  // Gabungkan jalur folder dengan nama file
  const filePath = path.join(folderPath, "data.json");

  // Gunakan metode fetch untuk mengambil data dari URL
  fetch(url)
    .then((response) => {
      // Periksa apakah respons berhasil (status 200 OK)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse respons sebagai JSON
      return response.json();
    })
    .then((jsonData) => {
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
        createdAt: jsonData.created_at,
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

      // Membaca file JSON
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          // Jika file tidak ditemukan, buat file baru dengan data awal
          if (err.code === "ENOENT") {
            const dataJSON = [targetJson];

            fs.writeFile(
              filePath,
              JSON.stringify(dataJSON, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  console.error("Gagal menulis file:", err);
                  return;
                }
                console.log("File baru berhasil dibuat:", filePath);
              }
            );
            return;
          }

          // Jika terdapat error lain selain file tidak ditemukan
          console.error("Gagal membaca file:", err);
          return;
        }

        // Parsing data JSON yang sudah ada
        let dataJSON = JSON.parse(data);

        // Menambahkan data baru
        dataJSON.push(targetJson);

        // Menulis kembali data JSON ke dalam file
        fs.writeFile(
          filePath,
          JSON.stringify(dataJSON, null, 2),
          "utf8",
          (err) => {
            if (err) {
              console.error("Gagal menulis file:", err);
              return;
            }
            console.log("Data berhasil ditambahkan ke", filePath);
          }
        );
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error.message);
    });
};

const receiptIds = excel.getReceiptsFromExcel();

const delay = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const batchDownload = async (receiptIds) => {
  for (let index = 0; index < receiptIds.length; index++) {
    const receiptId = receiptIds[index];
    const url = `https://asia-southeast2-lapor-tabloid-pesantren-2.cloudfunctions.net/api/posTracking/${receiptId}`; // Ganti dengan URL yang sesuai
    // const customFileName = `${receiptId}.json`; // Ganti dengan nama file yang sesuai
    downloadJsonFromUrl(url, "output");
    // console.log(receiptId);
    await delay(2000);
  }
};

batchDownload(receiptIds);
