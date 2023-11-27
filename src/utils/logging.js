const fs = require("fs");
const path = require("path");

const logError = (error, message) => {
  const logFilePath = path.join("log", "error.json");
  const timestamp = new Date().toISOString();

  // Membaca file log jika sudah ada
  let logArray = [];
  if (fs.existsSync(logFilePath)) {
    const existingLog = fs.readFileSync(logFilePath, "utf8");
    try {
      logArray = JSON.parse(existingLog);
    } catch (parseError) {
      console.error("Gagal membaca file log:", parseError);
    }
  }

  // Menambahkan log baru ke dalam array
  const errorLog = {
    timestamp: timestamp,
    message: message,
    stack: error.stack,
  };
  logArray.push(errorLog);

  // Menyimpan array log ke dalam file
  const logMessage = JSON.stringify(logArray, null, 2) + "\n";
  fs.writeFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Gagal menulis ke file log:", err);
    }
  });

  console.error("Error terjadi. Lihat file log untuk detailnya.");
};

// Contoh penggunaan:
// try {
//   // Kode yang mungkin menyebabkan error
//   // Misalnya: throw new Error('Ini contoh error');
//   throw new Error();
// } catch (error) {
//   logError(error);
// }

module.exports = { logError };
