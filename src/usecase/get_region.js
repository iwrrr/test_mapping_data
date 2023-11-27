const fs = require("fs");
const logging = require("../utils/logging");
const path = require("path");

// Membaca isi file JSON secara sinkron
const getRegion = (postalCode, receipt) => {
  const filePath = "./data/postal-code.json"; // Ganti dengan path file JSON Anda

  try {
    const data = fs.readFileSync(filePath, "utf8");

    // Mengonversi string JSON menjadi objek JavaScript
    const jsonData = JSON.parse(data);

    const uniquePostalCodes = new Set();
    const uniqueCodes = new Set();

    // Memfilter data JSON berdasarkan key "postal" dan "code"
    const distinctData = jsonData.filter((item) => {
      const isUniquePostal = !uniquePostalCodes.has(item.postal);
      const isUniqueCode = !uniqueCodes.has(item.code);

      if (isUniquePostal) uniquePostalCodes.add(item.postal);
      if (isUniqueCode) uniqueCodes.add(item.code);

      return isUniquePostal && isUniqueCode;
    });

    const searchDataByPostal = () => {
      try {
        const data = distinctData.filter(
          (item) => item.postal === postalCode
        )[0];

        const region = {
          province: data.province,
          city: data.city,
          district: data.district,
          village: data.village,
          area: `${data.province.toUpperCase()}|${data.city.toUpperCase()}`,
        };

        return region;
        // return `${data.province.toUpperCase()}|${data.city.toUpperCase()}`;
      } catch (error) {
        logging.logError(
          error,
          `Kodepos ${postalCode} dengan resi ${receipt} tidak ditemukan`
        );
        postalCodeLog(postalCode, receipt);

        const region = {
          province: "-",
          city: "-",
          district: "-",
          village: "-",
          area: "-",
        };
        return region;
        // return `-`;
      }
    };

    return searchDataByPostal();
  } catch (error) {
    logging.logError(error, "File tidak ditemukan");
  }
};

const postalCodeLog = (postalCode, receipt) => {
  console.log(`Postal code ${postalCode} with receipt ${receipt} not found`);

  const logFilePath = path.join("log", "postal-code-log.json");

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
  const postalCodeLog = {
    postalCode: postalCode,
    receipt: receipt,
  };

  logArray.push(postalCodeLog);

  // Menyimpan array log ke dalam file
  const logMessage = JSON.stringify(logArray, null, 2) + "\n";
  fs.writeFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Gagal menulis ke file log:", err);
    }
  });
};

// getCity(30966, "P2310240156323");

module.exports = { getRegion };
