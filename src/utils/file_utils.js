const fs = require("fs");

// Fungsi untuk membuat folder jika belum ada
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

module.exports = { createFolderIfNotExists };
