const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "-",
});

const firestore = admin.firestore();

const importToFirestore = async (jsonPath, collectionName) => {
  try {
    const jsonData = require(jsonPath);

    const uniqueAddress = new Set();
    const uniqueCodes = new Set();
    const uniquePhotoUrl = new Set();

    const distinctData = jsonData.filter((item) => {
      const isUniqueAddress = !uniqueAddress.has(item.lokasiAlamat);
      const isUniqueCode = !uniqueCodes.has(item.kode);
      const isUniquePhotoUrl = !uniqueCodes.has(item.photoURL[0]);

      if (isUniqueAddress) uniqueAddress.add(item.lokasiAlamat);
      if (isUniqueCode) uniqueCodes.add(item.kode);
      if (isUniquePhotoUrl) uniquePhotoUrl.add(item.kode);

      return isUniqueAddress && isUniqueCode && isUniquePhotoUrl;
    });

    const collectionRef = firestore.collection(collectionName);

    // await collectionRef.add(jsonData);
    console.log(`Importing ${distinctData.length}`);
    for (let index = 0; index < distinctData.length; index++) {
      const element = distinctData[index];
      await collectionRef.add(element);
      // console.log(`Yuhuuuu~ import ${distinctData.length} success`);
    }
    console.log(`Import ${distinctData.length} data success`);
  } catch (error) {
    console.log("Error: ", error);
  }
};

importToFirestore("../output/data.json", "laporan");
