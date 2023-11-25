const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Fungsi untuk membuat folder jika belum ada
function createFolderIfNotExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
}

// Fungsi untuk mengunduh respons JSON dari URL dan menyimpannya ke dalam file di dalam folder
function downloadJsonFromUrl(url, outputFile, folderPath) {
  // Buat folder jika belum ada
  createFolderIfNotExists(folderPath);

  // Gabungkan jalur folder dengan nama file
  const filePath = path.join(folderPath, outputFile);

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
      // Lakukan sesuatu dengan data JSON, contoh: tampilkan di konsol
      console.log("Response JSON:", jsonData);

      // Simpan data JSON ke dalam file
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      console.log(`Data saved to ${outputFile}`);
    })
    .catch((error) => {
      // Tangani kesalahan yang mungkin terjadi selama pengambilan data
      console.error("Error fetching data:", error.message);
    });
}

// Contoh penggunaan
const apiUrl =
  "https://asia-southeast2-lapor-tabloid-pesantren-2.cloudfunctions.net/api/posTracking/P2310240156307"; // Ganti dengan URL yang sesuai
const customFileName = "P2310240156307.json";
downloadJsonFromUrl(apiUrl, customFileName, "data");
