const fs = require("fs");
const path = require("path");

const logError = (error, message) => {
  const logFilePath = path.join("log", "error.json");
  const timestamp = new Date().toISOString();

  // Membaca file log jika sudah ada
  let logArray = [];
  // if (fs.existsSync(logFilePath)) {
  //   const existingLog = fs.readFileSync(logFilePath, "utf8");
  //   try {
  //     logArray = JSON.parse(existingLog);
  //   } catch (parseError) {
  //     console.error("Gagal membaca file log:", parseError);
  //   }
  // }

  // Menambahkan log baru ke dalam array
  const errorLog = {
    timestamp: timestamp,
    message: message,
    stack: error.stack,
  };

  fs.access(logFilePath, fs.constants.F_OK, (error) => {
    if (error) {
      // Jika file belum ada, membuat file baru
      createNewFile(errorLog, logFilePath);
    } else {
      // Jika file sudah ada, tambahkan data baru
      appendDataToFile(errorLog, logFilePath);
    }
  });

  // logArray.push(errorLog);

  // Menyimpan array log ke dalam file
  // const logMessage = JSON.stringify(logArray, null, 2) + "\n";
  // fs.writeFile(logFilePath, logMessage, (err) => {
  //   if (err) {
  //     console.error("Gagal menulis ke file log:", err);
  //   }
  // });

  console.error("Error terjadi. Lihat file log untuk detailnya.");
};

// Fungsi untuk membuat file baru dan menyimpan data JSON di dalamnya
function createNewFile(data, filePath) {
  fs.writeFile(filePath, JSON.stringify([data], null, 2), (writeErr) => {
    if (writeErr) {
      console.error("Gagal menulis ke file log:", writeErr);
      // logging.logError(
      //   writeErr,
      //   `Gagal membuat file dan menulis data: ${writeErr.message}`
      // );
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
      console.error("Gagal membaca file log:", readErr);
      return;
    }

    let existingData;

    // Validasi JSON yang sudah ada
    try {
      existingData = JSON.parse(data);
    } catch (parseErr) {
      console.error("File JSON tidak valid:", parseErr);
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
          console.error("Gagal menulis ke file log:", writeErr);
        } else {
          console.log(`Data ${newData.kode} berhasil ditambahkan ke file JSON`);
        }
      }
    );
  });
}

module.exports = { logError };
